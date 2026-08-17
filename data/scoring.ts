import { questions, type Axis, type Cat, type TopologyCat, type ReadinessCat, type SurveillanceCat } from "./questions";

export type AnswerMap = Record<string, Cat>;

export const axisCats: Record<Axis, Cat[]> = {
  topology: ["augmentation", "automation", "decision", "mixed"],
  readiness: ["burned", "neutral", "enthusiastic"],
  surveillance: ["low", "medium", "high"],
};

export const axisCatLabels: Record<Cat, string> = {
  augmentation: "Augmentation",
  automation: "Workflow automation",
  decision: "Decision support",
  mixed: "Mixed / undefined",
  burned: "Burned by prior rollouts",
  neutral: "Neutral / first rollout",
  enthusiastic: "Leadership-driven enthusiasm",
  low: "Low",
  medium: "Moderate",
  high: "High",
};

export const topologyTemplates: Record<TopologyCat, string> = {
  augmentation:
    "Your primary topology is augmentation. AI is drafting, summarizing, or assisting individuals who stay the final author. Layer 2 work should focus on keeping evaluative skill sharp, not just review speed, so people don't quietly deskill while looking more productive.",
  automation:
    "Your primary topology is workflow automation. AI is embedded inside an operational pipeline. Layer 2 work should focus on exception-handling design: who owns an edge case when the pipeline breaks, and whether that person retains enough context to handle it well.",
  decision:
    "Your primary topology is decision support. AI is feeding recommendations into high-stakes calls. Layer 2 and Layer 3 both need to prioritize override rights, accountability lines, and audit trails before scale, not after an incident forces it.",
  mixed:
    "Your topology is still mixed or undefined. Before any Layer 2 redesign, spend real time in Layer 1 mapping exactly where AI touches the workflow today. Redesigning roles before that map exists is the most common failure mode we see.",
};

export const readinessTemplates: Record<ReadinessCat, string> = {
  burned:
    "Your change-readiness baseline is burned. A prior rollout left real skepticism. Layer 3 needs to open with trust repair, not feature explanation, and should name the past failure directly before introducing anything new.",
  neutral:
    "Your change-readiness baseline is neutral, reading as a first major rollout. Layer 3 can open with expectation-setting and skill-building rather than trust repair. Don't over-invest in reassurance nobody is asking for yet.",
  enthusiastic:
    "Your change-readiness baseline is leadership-driven enthusiasm. The risk here isn't resistance, it's overtrust outpacing the frontline's actual comfort. Layer 3 should slow leadership down enough for calibrated trust to catch up.",
};

export const surveillanceTemplates: Record<SurveillanceCat, string> = {
  low: "Surveillance sensitivity is low. There's more room to instrument Layer 4 metrics directly, but build the norm deliberately now, before usage grows, so it doesn't calcify into something invasive later.",
  medium:
    "Surveillance sensitivity is moderate. Default Layer 4 metrics to team-level aggregates and be explicit about what's tracked and why before rollout, not after someone asks.",
  high: "Surveillance sensitivity is high. Individual-level AI-usage tracking will likely read as surveillance regardless of intent. Layer 4 should start with team-level aggregates only, co-designed with the team.",
};

const fallbackByAxis: Record<Axis, Cat> = {
  topology: "mixed",
  readiness: "neutral",
  surveillance: "medium",
};

export type AxisScores = Record<Axis, Record<string, number>>;

export function tallyAnswers(answers: AnswerMap): AxisScores {
  const scores: AxisScores = {
    topology: Object.fromEntries(axisCats.topology.map((c) => [c, 0])),
    readiness: Object.fromEntries(axisCats.readiness.map((c) => [c, 0])),
    surveillance: Object.fromEntries(axisCats.surveillance.map((c) => [c, 0])),
  };

  questions.forEach((q, i) => {
    const chosen = answers["q" + i];
    if (chosen && scores[q.axis][chosen] !== undefined) {
      scores[q.axis][chosen] += 1;
    }
  });

  return scores;
}

export interface Winners {
  topology: TopologyCat;
  readiness: ReadinessCat;
  surveillance: SurveillanceCat;
}

export function computeWinners(scores: AxisScores): Winners {
  const winners = {} as Record<Axis, Cat>;

  (Object.keys(axisCats) as Axis[]).forEach((axis) => {
    const cats = axisCats[axis];
    let max = -1;
    cats.forEach((c) => {
      if (scores[axis][c] > max) max = scores[axis][c];
    });
    const top = cats.filter((c) => scores[axis][c] === max);
    winners[axis] = top.length === 1 ? top[0] : fallbackByAxis[axis];
  });

  return winners as unknown as Winners;
}

export function questionCountForAxis(axis: Axis): number {
  return questions.filter((q) => q.axis === axis).length;
}
