export type SeniorityBandValue = "IC" | "SENIOR_IC" | "MANAGER" | "LEADERSHIP";
export type WorkloadTypeValue = "GENERATIVE" | "AI_VERIFICATION" | "MEETINGS" | "EXCEPTIONS";
export type PressureLevelValue = "LOW" | "MODERATE" | "HIGH" | "OVERWHELMING";
export type ResourceLevelValue = "INSUFFICIENT" | "ADEQUATE" | "STRONG";
export type TrustSignalValue = "RELY_WITHOUT_CHECKING" | "VERIFY_ROUTINELY" | "OVERRIDE_FREQUENTLY";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface PulseField<T extends string> {
  key: "seniorityBand" | "dominantWorkload" | "demandsLevel" | "resourcesLevel" | "trustSignal";
  prompt: string;
  options: Option<T>[];
}

export const seniorityBandField: PulseField<SeniorityBandValue> = {
  key: "seniorityBand",
  prompt: "What's your role level?",
  options: [
    { value: "IC", label: "Individual contributor" },
    { value: "SENIOR_IC", label: "Senior individual contributor" },
    { value: "MANAGER", label: "Manager" },
    { value: "LEADERSHIP", label: "Leadership or executive" },
  ],
};

export const workloadField: PulseField<WorkloadTypeValue> = {
  key: "dominantWorkload",
  prompt: "What took up most of your work this cycle?",
  options: [
    { value: "GENERATIVE", label: "Creating new work: drafts, code, analysis, content" },
    { value: "AI_VERIFICATION", label: "Reviewing or correcting AI output" },
    { value: "MEETINGS", label: "Meetings and coordination" },
    { value: "EXCEPTIONS", label: "Handling exceptions or escalations" },
  ],
};

export const demandsField: PulseField<PressureLevelValue> = {
  key: "demandsLevel",
  prompt: "How did the pace feel this cycle?",
  options: [
    { value: "LOW", label: "Manageable, nothing unusual" },
    { value: "MODERATE", label: "Busy, but under control" },
    { value: "HIGH", label: "Stretched thin" },
    { value: "OVERWHELMING", label: "Overwhelming, couldn't keep up" },
  ],
};

export const resourcesField: PulseField<ResourceLevelValue> = {
  key: "resourcesLevel",
  prompt: "Did you have what you needed to do this well?",
  options: [
    { value: "INSUFFICIENT", label: "Not enough support, time, or tools" },
    { value: "ADEQUATE", label: "Enough to get by" },
    { value: "STRONG", label: "Well supported" },
  ],
};

export const trustField: PulseField<TrustSignalValue> = {
  key: "trustSignal",
  prompt: "How are you treating AI output right now?",
  options: [
    { value: "RELY_WITHOUT_CHECKING", label: "Mostly relying on it without double-checking" },
    { value: "VERIFY_ROUTINELY", label: "Routinely verifying it before using it" },
    { value: "OVERRIDE_FREQUENTLY", label: "Frequently overriding or discarding it" },
  ],
};

export const pulseFields = [
  seniorityBandField,
  workloadField,
  demandsField,
  resourcesField,
  trustField,
] as const;

function labelMap<T extends string>(field: PulseField<T>): Record<T, string> {
  return Object.fromEntries(field.options.map((o) => [o.value, o.label])) as Record<T, string>;
}

export const seniorityBandLabels = labelMap(seniorityBandField);
export const workloadLabels = labelMap(workloadField);
export const demandsLabels = labelMap(demandsField);
export const resourcesLabels = labelMap(resourcesField);
export const trustLabels = labelMap(trustField);
