import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentCycle } from "@/data/pulseScoring";

const bodySchema = z.object({
  slug: z.string().min(1),
  seniorityBand: z.enum(["IC", "SENIOR_IC", "MANAGER", "LEADERSHIP"]),
  dominantWorkload: z.enum(["GENERATIVE", "AI_VERIFICATION", "MEETINGS", "EXCEPTIONS"]),
  demandsLevel: z.enum(["LOW", "MODERATE", "HIGH", "OVERWHELMING"]),
  resourcesLevel: z.enum(["INSUFFICIENT", "ADEQUATE", "STRONG"]),
  trustSignal: z.enum(["RELY_WITHOUT_CHECKING", "VERIFY_ROUTINELY", "OVERRIDE_FREQUENTLY"]),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { slug, seniorityBand, dominantWorkload, demandsLevel, resourcesLevel, trustSignal } = parsed.data;

  const team = await prisma.team.findUnique({ where: { slug }, select: { id: true } });
  if (!team) {
    return NextResponse.json({ error: "Unknown team." }, { status: 404 });
  }

  const response = await prisma.pulseResponse.create({
    data: {
      teamId: team.id,
      cycle: getCurrentCycle(),
      seniorityBand,
      dominantWorkload,
      demandsLevel,
      resourcesLevel,
      trustSignal,
    },
  });

  return NextResponse.json({ id: response.id });
}
