import type {
  SeniorityBandValue,
  WorkloadTypeValue,
  PressureLevelValue,
  ResourceLevelValue,
  TrustSignalValue,
} from "./pulseQuestions";

export interface PulseResponseInput {
  cycle: string;
  seniorityBand: SeniorityBandValue;
  dominantWorkload: WorkloadTypeValue;
  demandsLevel: PressureLevelValue;
  resourcesLevel: ResourceLevelValue;
  trustSignal: TrustSignalValue;
}

/** Below this many respondents, a band (or a whole cycle) is too small to
 * report without effectively identifying an individual. Never lower this
 * to make a chart look fuller, it's the privacy guarantee, not a display
 * preference. */
export const MIN_SAMPLE = 2;
export function shouldSuppressBand(count: number): boolean {
  return count < MIN_SAMPLE;
}

const SENIORITY_BANDS: SeniorityBandValue[] = ["IC", "SENIOR_IC", "MANAGER", "LEADERSHIP"];

export function getCurrentCycle(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7; // Monday = 1 ... Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // shift to the Thursday of this ISO week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function distinctCycles(responses: PulseResponseInput[]): string[] {
  return Array.from(new Set(responses.map((r) => r.cycle))).sort();
}

export interface CycleSummary {
  cycle: string;
  respondentCount: number;
  suppressed: boolean;
  workloadCounts: Record<WorkloadTypeValue, number>;
  trustCounts: Record<TrustSignalValue, number>;
  demandsAvg: number | null;
  resourcesAvg: number | null;
}

export function aggregateCycle(cycleResponses: PulseResponseInput[]): CycleSummary {
  const cycle = cycleResponses[0]?.cycle ?? "";
  const respondentCount = cycleResponses.length;
  const suppressed = shouldSuppressBand(respondentCount);

  const workloadCounts: Record<WorkloadTypeValue, number> = {
    GENERATIVE: 0,
    AI_VERIFICATION: 0,
    MEETINGS: 0,
    EXCEPTIONS: 0,
  };
  const trustCounts: Record<TrustSignalValue, number> = {
    RELY_WITHOUT_CHECKING: 0,
    VERIFY_ROUTINELY: 0,
    OVERRIDE_FREQUENTLY: 0,
  };

  for (const r of cycleResponses) {
    workloadCounts[r.dominantWorkload] += 1;
    trustCounts[r.trustSignal] += 1;
  }

  return {
    cycle,
    respondentCount,
    suppressed,
    workloadCounts,
    trustCounts,
    demandsAvg: suppressed ? null : avg(cycleResponses.map((r) => pressureScore[r.demandsLevel])),
    resourcesAvg: suppressed ? null : avg(cycleResponses.map((r) => resourceScore[r.resourcesLevel])),
  };
}

export function summarizeAllCycles(responses: PulseResponseInput[]): CycleSummary[] {
  const cycles = distinctCycles(responses);
  return cycles.map((cycle) => aggregateCycle(responses.filter((r) => r.cycle === cycle)));
}

const pressureScore: Record<PressureLevelValue, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  OVERWHELMING: 4,
};
const resourceScore: Record<ResourceLevelValue, number> = {
  INSUFFICIENT: 1,
  ADEQUATE: 2,
  STRONG: 3,
};

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/* ---------- Seniority-load drift ---------- */

export type DriftDirection = "rising" | "stable" | "falling" | "insufficientData";

export interface BandDriftPoint {
  band: SeniorityBandValue;
  direction: DriftDirection;
  earliestRate: number | null;
  latestRate: number | null;
}

export type DriftVerdict = "concentrating_senior" | "distributed" | "insufficientData";

export interface DriftResult {
  insufficientData: boolean;
  cyclesObserved: number;
  bands: BandDriftPoint[];
  verdict: DriftVerdict;
  guidance: string;
}

const DRIFT_NOISE_THRESHOLD = 0.1; // 10 percentage points of movement before it counts as a real change

export const driftGuidance: Record<DriftVerdict, string> = {
  insufficientData:
    "Not enough cycles yet to call a trend. At least three cycles of data, with at least two respondents per band being compared, are needed before a drift signal means anything.",
  concentrating_senior:
    "Exception-handling load is concentrating toward your more senior people while it stays flat or falls for individual contributors. That matches the framework's core deskilling risk: as AI absorbs the routine cases, seniors quietly absorb the leftover complexity and juniors lose the reps that build expertise. Worth deliberately routing some exceptions back down with support, not letting them pool upward by default.",
  distributed:
    "No clear drift toward seniors absorbing more exception-handling. Exception load looks reasonably distributed across levels in the cycles observed so far.",
};

export function computeSeniorityDrift(responses: PulseResponseInput[]): DriftResult {
  const cycles = distinctCycles(responses);

  if (cycles.length < 3) {
    return {
      insufficientData: true,
      cyclesObserved: cycles.length,
      bands: [],
      verdict: "insufficientData",
      guidance: driftGuidance.insufficientData,
    };
  }

  const earliestCycle = cycles[0];
  const latestCycle = cycles[cycles.length - 1];

  const bands: BandDriftPoint[] = SENIORITY_BANDS.map((band) => {
    const earliest = responses.filter((r) => r.cycle === earliestCycle && r.seniorityBand === band);
    const latest = responses.filter((r) => r.cycle === latestCycle && r.seniorityBand === band);

    if (shouldSuppressBand(earliest.length) || shouldSuppressBand(latest.length)) {
      return { band, direction: "insufficientData", earliestRate: null, latestRate: null };
    }

    const earliestRate = earliest.filter((r) => r.dominantWorkload === "EXCEPTIONS").length / earliest.length;
    const latestRate = latest.filter((r) => r.dominantWorkload === "EXCEPTIONS").length / latest.length;
    const delta = latestRate - earliestRate;

    const direction: DriftDirection =
      delta > DRIFT_NOISE_THRESHOLD ? "rising" : delta < -DRIFT_NOISE_THRESHOLD ? "falling" : "stable";

    return { band, direction, earliestRate, latestRate };
  });

  const withData = bands.filter((b) => b.direction !== "insufficientData");
  if (withData.length === 0) {
    return {
      insufficientData: true,
      cyclesObserved: cycles.length,
      bands,
      verdict: "insufficientData",
      guidance: driftGuidance.insufficientData,
    };
  }

  const seniorBands = withData.filter((b) => b.band === "MANAGER" || b.band === "LEADERSHIP");
  const juniorBands = withData.filter((b) => b.band === "IC" || b.band === "SENIOR_IC");

  const seniorsRising = seniorBands.some((b) => b.direction === "rising");
  const juniorsNotRising = juniorBands.length === 0 || juniorBands.every((b) => b.direction !== "rising");

  const verdict: DriftVerdict = seniorsRising && juniorsNotRising ? "concentrating_senior" : "distributed";

  return {
    insufficientData: false,
    cyclesObserved: cycles.length,
    bands,
    verdict,
    guidance: driftGuidance[verdict],
  };
}

/* ---------- Demands vs. resources trend ---------- */

export interface TrendPoint {
  cycle: string;
  avgDemands: number | null;
  avgResources: number | null;
  respondentCount: number;
  suppressed: boolean;
}

export type PressureVerdict = "improving" | "stable" | "worsening" | "insufficientData";

export const pressureGuidance: Record<PressureVerdict, string> = {
  insufficientData:
    "Not enough non-suppressed cycles yet to call a trend. Keep collecting responses, at least two cycles with enough respondents are needed.",
  improving:
    "The gap between demands and resources has narrowed across the cycles observed so far, pressure is easing relative to what people have to work with.",
  worsening:
    "The gap between demands and resources has widened across the cycles observed so far, pressure is outpacing what people have to work with. Worth treating as an early signal, not waiting for it to show up as attrition or visible burnout first.",
  stable:
    "Demands and resources have stayed roughly proportional across the cycles observed so far, no clear trend in either direction yet.",
};

export function computeDemandsResourcesTrend(responses: PulseResponseInput[]): {
  points: TrendPoint[];
  verdict: PressureVerdict;
  guidance: string;
} {
  const summaries = summarizeAllCycles(responses);
  const points: TrendPoint[] = summaries.map((s) => ({
    cycle: s.cycle,
    avgDemands: s.demandsAvg,
    avgResources: s.resourcesAvg,
    respondentCount: s.respondentCount,
    suppressed: s.suppressed,
  }));

  const usable = points.filter((p) => !p.suppressed && p.avgDemands !== null && p.avgResources !== null);
  if (usable.length < 2) {
    return { points, verdict: "insufficientData", guidance: pressureGuidance.insufficientData };
  }

  const first = usable[0];
  const last = usable[usable.length - 1];
  const firstGap = first.avgDemands! - first.avgResources!;
  const lastGap = last.avgDemands! - last.avgResources!;
  const delta = lastGap - firstGap;

  const verdict: PressureVerdict = delta > 0.3 ? "worsening" : delta < -0.3 ? "improving" : "stable";

  return { points, verdict, guidance: pressureGuidance[verdict] };
}
