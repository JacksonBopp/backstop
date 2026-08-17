import { axisCatLabels } from "@/data/scoring";
import type { DeploymentTopology, ChangeReadiness, SurveillanceSensitivity } from "@/generated/prisma/client";

export const topologyLabel: Record<DeploymentTopology, string> = {
  AUGMENTATION: axisCatLabels.augmentation,
  AUTOMATION: axisCatLabels.automation,
  DECISION_SUPPORT: axisCatLabels.decision,
  MIXED: axisCatLabels.mixed,
};

export const readinessLabel: Record<ChangeReadiness, string> = {
  BURNED: axisCatLabels.burned,
  NEUTRAL: axisCatLabels.neutral,
  ENTHUSIASTIC: axisCatLabels.enthusiastic,
};

export const surveillanceLabel: Record<SurveillanceSensitivity, string> = {
  LOW: axisCatLabels.low,
  MEDIUM: axisCatLabels.medium,
  HIGH: axisCatLabels.high,
};
