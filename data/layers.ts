export interface Layer {
  id: "l0" | "l1" | "l2" | "l3" | "l4";
  idx: string;
  role: string;
  title: string;
  /** Full paragraph used on the landing-page architecture diagram. */
  description: string;
  /** Short one-liner used as the Explorer accordion subtitle. */
  oneLine: string;
  method: string;
  tools: string;
  metrics: string;
}

export const layers: Layer[] = [
  {
    id: "l0",
    idx: "L0",
    role: "Calibration",
    title: "Diagnostic Intake",
    description:
      "Profiles the client on three axes (AI deployment topology, change-readiness baseline, and surveillance sensitivity) and routes them into the right configuration of Layers 1 through 4, rather than one generic playbook.",
    oneLine: "Profiles the client and routes them into the right configuration of Layers 1 through 4.",
    method:
      "Structured stakeholder interviews paired with the three-axis scoring used in the live diagnostic: deployment topology, change-readiness baseline, and surveillance sensitivity.",
    tools: "Intake questionnaire, stakeholder interview guide, scoring rubric.",
    metrics:
      "A configuration profile that determines which playbook variant the engagement runs, revisited at the end of every cycle.",
  },
  {
    id: "l1",
    idx: "L1",
    role: "Diagnose the flow",
    title: "System Dynamics",
    description:
      "Maps work as a stock-and-flow system: where AI sits in the sequence, which feedback loops it shortens or severs, and which human-to-human interdependencies quietly disappear when a task is automated.",
    oneLine: "Maps work as a stock-and-flow system before anything about roles or tools changes.",
    method:
      "Stock-and-flow mapping, feedback-loop analysis (reinforcing versus balancing), and an interdependency audit of who used to coordinate with whom.",
    tools: "Process-mapping workshops, causal loop diagrams, direct workflow shadowing.",
    metrics: "Cycle-time deltas, coordination touchpoints removed or added, and loop latency between an action and its feedback.",
  },
  {
    id: "l2",
    idx: "L2",
    role: "Redesign the role",
    title: "Job Design & Ergonomics",
    description:
      "Reallocates functions by complementary strength rather than technical possibility, and rebuilds jobs to keep skill variety, autonomy, and feedback intact instead of collapsing them into pure monitoring work.",
    oneLine: "Reallocates functions by complementary strength, not by whatever AI can technically do.",
    method:
      "Function-allocation mapping across human, AI, and joint work, plus before/after scoring against the Job Characteristics Model.",
    tools: "Task inventory and allocation matrix, structured job-characteristics survey, cognitive-load walkthroughs.",
    metrics: "Skill variety, autonomy, and task-identity scores, vigilance load, and override or exception rates.",
  },
  {
    id: "l3",
    idx: "L3",
    role: "Calibrate trust",
    title: "Change Management & Culture",
    description:
      "Targets the specific anxieties AI introduces: deskilling fear, authorship anxiety, job security. Builds appropriately calibrated trust, not maximal trust, so people know when to rely on AI and when to override it.",
    oneLine: "Targets the specific anxieties AI introduces instead of running a generic rollout playbook.",
    method:
      "A staged adoption plan aimed at AI-specific anxieties (deskilling fear, authorship anxiety, job security), plus trust-calibration exercises.",
    tools:
      "Anxiety-mapping interviews, trust-calibration workshops on when to rely on AI versus override it, manager enablement sessions.",
    metrics: "A calibrated-trust score (not just a trust level), resistance or sabotage indicators, and override-appropriateness rate.",
  },
  {
    id: "l4",
    idx: "L4",
    role: "Measure without surveillance",
    title: "Performance & Well-being",
    description:
      "Applies a demands-resources model to separate output metrics from well-being metrics, and feeds the results back into Layer 0, closing the loop instead of shipping a one-time rollout.",
    oneLine: "Separates output metrics from well-being metrics and feeds results back into Layer 0.",
    method:
      "Job Demands-Resources instrumentation, with metrics designed at the team level rather than the individual level by default.",
    tools: "Pulse surveys, aggregate usage analytics, a well-being index tracked alongside output.",
    metrics:
      "Demands-to-resources ratio, burnout-risk indicators, and output metrics always reported paired with well-being metrics, never alone.",
  },
];
