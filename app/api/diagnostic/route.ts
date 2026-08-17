import { NextResponse } from "next/server";
import { z } from "zod";
import { questions } from "@/data/questions";
import { tallyAnswers, computeWinners, type AnswerMap } from "@/data/scoring";
import { prisma } from "@/lib/db";
import type { DeploymentTopology, ChangeReadiness, SurveillanceSensitivity } from "@/generated/prisma/client";

const bodySchema = z.object({
  answers: z.record(z.string(), z.string()),
  contactName: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  contactOrg: z.string().trim().max(200).optional(),
});

/** Every question must be answered with one of that specific question's own option values. */
function answersAreValid(answers: Record<string, string>): boolean {
  return questions.every((q, i) => {
    const value = answers["q" + i];
    return q.options.some((o) => o.cat === value);
  });
}

const topologyMap: Record<string, DeploymentTopology> = {
  augmentation: "AUGMENTATION",
  automation: "AUTOMATION",
  decision: "DECISION_SUPPORT",
  mixed: "MIXED",
};
const readinessMap: Record<string, ChangeReadiness> = {
  burned: "BURNED",
  neutral: "NEUTRAL",
  enthusiastic: "ENTHUSIASTIC",
};
const surveillanceMap: Record<string, SurveillanceSensitivity> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success || !answersAreValid(parsed.data.answers)) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { answers, contactName, contactEmail, contactOrg } = parsed.data;

  // Server-side recomputation: the client's displayed result is never trusted for storage.
  const scores = tallyAnswers(answers as AnswerMap);
  const winners = computeWinners(scores);

  const submission = await prisma.submission.create({
    data: {
      answers,
      axisScores: scores,
      deploymentTopology: topologyMap[winners.topology],
      changeReadiness: readinessMap[winners.readiness],
      surveillanceSensitivity: surveillanceMap[winners.surveillance],
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactOrg: contactOrg || null,
    },
  });

  return NextResponse.json({ id: submission.id });
}
