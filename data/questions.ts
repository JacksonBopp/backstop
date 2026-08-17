export type Axis = "topology" | "readiness" | "surveillance";

export type TopologyCat = "augmentation" | "automation" | "decision" | "mixed";
export type ReadinessCat = "burned" | "neutral" | "enthusiastic";
export type SurveillanceCat = "low" | "medium" | "high";
export type Cat = TopologyCat | ReadinessCat | SurveillanceCat;

export interface QuestionOption {
  text: string;
  cat: Cat;
}

export interface Question {
  axis: Axis;
  label?: string;
  prompt: string;
  options: QuestionOption[];
}

export const questions: Question[] = [
  {
    axis: "topology",
    label: "Deployment topology",
    prompt: "Where does AI currently sit in your team's workflow?",
    options: [
      { text: "Drafting or summarizing work that a person reviews before it ships", cat: "augmentation" },
      { text: "Running inside an operational pipeline, a support queue, claims, logistics, and similar", cat: "automation" },
      { text: "Feeding directly into high-stakes calls: hiring, credit, medical, legal", cat: "decision" },
      { text: "Honestly, a bit of everything right now", cat: "mixed" },
    ],
  },
  {
    axis: "topology",
    prompt: "If the AI tool disappeared tomorrow, what breaks first?",
    options: [
      { text: "Individual output slows down. Drafts and analysis take longer", cat: "augmentation" },
      { text: "A queue or pipeline backs up", cat: "automation" },
      { text: "A decision process loses its main input", cat: "decision" },
      { text: "Nothing critical yet. It's still early", cat: "mixed" },
    ],
  },
  {
    axis: "topology",
    prompt: "Who is the primary user of the AI system day to day?",
    options: [
      { text: "Individual contributors, on demand", cat: "augmentation" },
      { text: "The system itself, running with minimal human triggering", cat: "automation" },
      { text: "A small group of decision-makers", cat: "decision" },
      { text: "Not yet defined", cat: "mixed" },
    ],
  },
  {
    axis: "readiness",
    label: "Change-readiness baseline",
    prompt: "How did your last major tech or process rollout go?",
    options: [
      { text: "Rocky. People still bring it up", cat: "burned" },
      { text: "Unremarkable. Neither loved nor hated", cat: "neutral" },
      { text: "Smooth. People were genuinely glad", cat: "enthusiastic" },
      { text: "This would be the first major one", cat: "neutral" },
    ],
  },
  {
    axis: "readiness",
    prompt: "How is leadership talking about this rollout relative to the people doing the work?",
    options: [
      { text: "Leadership is noticeably more excited than the frontline", cat: "enthusiastic" },
      { text: "Roughly the same energy on both sides", cat: "neutral" },
      { text: "The frontline is more skeptical than leadership seems to realize", cat: "burned" },
    ],
  },
  {
    axis: "readiness",
    prompt: "If you asked five random employees how they feel about AI at work, what would you hear?",
    options: [
      { text: "Guarded, or openly frustrated", cat: "burned" },
      { text: "Mixed. Mostly indifferent", cat: "neutral" },
      { text: "Curious and mostly positive", cat: "enthusiastic" },
    ],
  },
  {
    axis: "surveillance",
    label: "Surveillance sensitivity",
    prompt: "Does your organization track individual-level productivity today: keystrokes, call times, ticket counts, and the like?",
    options: [
      { text: "Yes, extensively", cat: "high" },
      { text: "Somewhat, mostly at team level", cat: "medium" },
      { text: "Basically no individual tracking today", cat: "low" },
    ],
  },
  {
    axis: "surveillance",
    prompt: "How would employees likely react to new AI-usage monitoring?",
    options: [
      { text: "Assume the worst. Read it as surveillance", cat: "high" },
      { text: "Cautious but open if it's explained well", cat: "medium" },
      { text: "Not a major concern here", cat: "low" },
    ],
  },
  {
    axis: "surveillance",
    prompt: "Has monitoring or metrics ever been a flashpoint here before, a tool pulled back, a policy walked back?",
    options: [
      { text: "Yes", cat: "high" },
      { text: "Not that I know of, but no one's asked", cat: "medium" },
      { text: "No, this isn't a sensitive topic here", cat: "low" },
    ],
  },
];
