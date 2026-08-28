/** ISO week ("2026-W34") for an arbitrary date, not just "now", since
 * synced tickets are stamped by their own updated_at, not sync time. */
export function getCycleForDate(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export interface TicketSnapshotInput {
  cycle: string;
  groupId: number | null;
  groupName: string | null;
  aiAssisted: boolean;
}

/** Below this many tickets, a group's rate in a cycle is too small to report
 * without effectively describing one or two people's work. Same discipline
 * as Team Pulse's suppression guard, never lower this to fill out a chart. */
export const MIN_SAMPLE = 3;
export function shouldSuppressGroup(count: number): boolean {
  return count < MIN_SAMPLE;
}

function distinctCycles(snapshots: TicketSnapshotInput[]): string[] {
  return Array.from(new Set(snapshots.map((s) => s.cycle))).sort();
}

function groupKey(s: TicketSnapshotInput): string {
  return s.groupId !== null ? String(s.groupId) : "ungrouped";
}

function groupLabel(s: TicketSnapshotInput): string {
  return s.groupName ?? "Ungrouped";
}

export interface GroupCycleRate {
  key: string;
  label: string;
  ticketCount: number;
  aiAssistedCount: number;
  rate: number | null; // null when suppressed
  suppressed: boolean;
}

export interface CycleSummary {
  cycle: string;
  ticketCount: number;
  aiAssistedCount: number;
  suppressed: boolean;
  groups: GroupCycleRate[];
}

export function aggregateCycle(cycleSnapshots: TicketSnapshotInput[]): CycleSummary {
  const cycle = cycleSnapshots[0]?.cycle ?? "";
  const ticketCount = cycleSnapshots.length;
  const aiAssistedCount = cycleSnapshots.filter((s) => s.aiAssisted).length;
  const suppressed = shouldSuppressGroup(ticketCount);

  const byGroup = new Map<string, { label: string; tickets: TicketSnapshotInput[] }>();
  for (const s of cycleSnapshots) {
    const key = groupKey(s);
    if (!byGroup.has(key)) byGroup.set(key, { label: groupLabel(s), tickets: [] });
    byGroup.get(key)!.tickets.push(s);
  }

  const groups: GroupCycleRate[] = Array.from(byGroup.entries()).map(([key, { label, tickets }]) => {
    const groupSuppressed = shouldSuppressGroup(tickets.length);
    const groupAiCount = tickets.filter((t) => t.aiAssisted).length;
    return {
      key,
      label,
      ticketCount: tickets.length,
      aiAssistedCount: groupAiCount,
      rate: groupSuppressed ? null : groupAiCount / tickets.length,
      suppressed: groupSuppressed,
    };
  });

  return { cycle, ticketCount, aiAssistedCount, suppressed, groups };
}

export function summarizeAllCycles(snapshots: TicketSnapshotInput[]): CycleSummary[] {
  const cycles = distinctCycles(snapshots);
  return cycles.map((cycle) => aggregateCycle(snapshots.filter((s) => s.cycle === cycle)));
}

/* ---------- AI-assisted load concentration ---------- */

export type GroupTrendDirection = "rising" | "stable" | "falling" | "insufficientData";

export interface GroupConcentrationPoint {
  key: string;
  label: string;
  direction: GroupTrendDirection;
  earliestRate: number | null;
  latestRate: number | null;
}

export type ConcentrationVerdict = "concentrating" | "distributed" | "insufficientData";

export interface ConcentrationResult {
  insufficientData: boolean;
  cyclesObserved: number;
  groups: GroupConcentrationPoint[];
  risingGroups: string[]; // labels of groups whose rate is clearly rising
  verdict: ConcentrationVerdict;
  guidance: string;
}

const TREND_NOISE_THRESHOLD = 0.1; // 10 percentage points before it counts as a real change

function concentrationGuidance(verdict: ConcentrationVerdict, risingGroups: string[]): string {
  if (verdict === "insufficientData") {
    return "Not enough cycles yet to call a trend. At least three cycles of data, with at least a handful of tickets per group being compared, are needed before this signal means anything.";
  }
  if (verdict === "concentrating") {
    const names = risingGroups.join(", ");
    return `AI-assisted ticket load is concentrating in specific groups (${names}) rather than staying evenly spread. That's worth a direct look, whether that's because those queues genuinely lean on AI more, or because verification work is quietly piling up somewhere nobody's tracking it.`;
  }
  return "No clear concentration yet. AI-assisted ticket load looks reasonably spread across groups in the cycles observed so far.";
}

/** Mirrors Team Pulse's computeSeniorityDrift in shape, but groups are
 * whatever the connected Zendesk account actually has, not a fixed enum,
 * so this derives the set of groups from the data instead of iterating a
 * known list. */
export function computeConcentration(snapshots: TicketSnapshotInput[]): ConcentrationResult {
  const cycles = distinctCycles(snapshots);

  if (cycles.length < 3) {
    return {
      insufficientData: true,
      cyclesObserved: cycles.length,
      groups: [],
      risingGroups: [],
      verdict: "insufficientData",
      guidance: concentrationGuidance("insufficientData", []),
    };
  }

  const earliestCycle = cycles[0];
  const latestCycle = cycles[cycles.length - 1];

  const allGroupKeys = new Map<string, string>(); // key -> label
  for (const s of snapshots) allGroupKeys.set(groupKey(s), groupLabel(s));

  const groups: GroupConcentrationPoint[] = Array.from(allGroupKeys.entries()).map(([key, label]) => {
    const earliest = snapshots.filter((s) => s.cycle === earliestCycle && groupKey(s) === key);
    const latest = snapshots.filter((s) => s.cycle === latestCycle && groupKey(s) === key);

    if (shouldSuppressGroup(earliest.length) || shouldSuppressGroup(latest.length)) {
      return { key, label, direction: "insufficientData", earliestRate: null, latestRate: null };
    }

    const earliestRate = earliest.filter((s) => s.aiAssisted).length / earliest.length;
    const latestRate = latest.filter((s) => s.aiAssisted).length / latest.length;
    const delta = latestRate - earliestRate;

    const direction: GroupTrendDirection =
      delta > TREND_NOISE_THRESHOLD ? "rising" : delta < -TREND_NOISE_THRESHOLD ? "falling" : "stable";

    return { key, label, direction, earliestRate, latestRate };
  });

  const withData = groups.filter((g) => g.direction !== "insufficientData");
  if (withData.length === 0) {
    return {
      insufficientData: true,
      cyclesObserved: cycles.length,
      groups,
      risingGroups: [],
      verdict: "insufficientData",
      guidance: concentrationGuidance("insufficientData", []),
    };
  }

  const rising = withData.filter((g) => g.direction === "rising");
  // Concentrating means some groups are clearly rising while at least one other isn't,
  // not just "everything went up together" (which is a demand story, not a concentration one).
  const verdict: ConcentrationVerdict =
    rising.length > 0 && rising.length < withData.length ? "concentrating" : "distributed";

  const risingGroups = rising.map((g) => g.label);

  return {
    insufficientData: false,
    cyclesObserved: cycles.length,
    groups,
    risingGroups,
    verdict,
    guidance: concentrationGuidance(verdict, risingGroups),
  };
}
