"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateTeamSlug } from "@/lib/slug";

// Fixed, well-known slug so the public marketing site can always link to
// the same showcase example, regardless of how many times it's reseeded.
const SHOWCASE_TEAM_SLUG = "showcase-example";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.team.create({
    data: { name, slug: generateTeamSlug() },
  });

  redirect("/admin/teams");
}

/**
 * Fabricates a team with four cycles of synthetic responses, illustrating
 * both interpretation signals (seniority-load drift rising, demands/resources
 * worsening) and the small-N suppression guard. For demos only, never real
 * usage, the team name says so and stays visible everywhere the team appears.
 */
export async function seedDemoTeam() {
  // Idempotent: re-running this replaces the previous showcase data rather
  // than piling up duplicate demo teams. Cascade delete clears its responses.
  await prisma.team.deleteMany({ where: { slug: SHOWCASE_TEAM_SLUG } });

  const team = await prisma.team.create({
    data: { name: "Demo Team (simulated data, not a real pilot)", slug: SHOWCASE_TEAM_SLUG },
  });

  const cycles = ["2026-D01", "2026-D02", "2026-D03", "2026-D04"];

  for (const cycle of cycles) {
    // ICs: exception rate stays flat/low
    for (let i = 0; i < 2; i++) {
      await prisma.pulseResponse.create({
        data: {
          teamId: team.id,
          cycle,
          seniorityBand: "IC",
          dominantWorkload: i === 0 ? "GENERATIVE" : "AI_VERIFICATION",
          demandsLevel: "MODERATE",
          resourcesLevel: "ADEQUATE",
          trustSignal: "VERIFY_ROUTINELY",
        },
      });
    }
  }

  // Managers: exception rate climbs cycle over cycle, demands rise, resources thin
  const managerPattern: Record<string, ("GENERATIVE" | "EXCEPTIONS")[]> = {
    "2026-D01": ["GENERATIVE", "GENERATIVE"],
    "2026-D02": ["GENERATIVE", "EXCEPTIONS"],
    "2026-D03": ["EXCEPTIONS", "EXCEPTIONS"],
    "2026-D04": ["EXCEPTIONS", "EXCEPTIONS"],
  };
  for (const cycle of cycles) {
    for (const workload of managerPattern[cycle]) {
      await prisma.pulseResponse.create({
        data: {
          teamId: team.id,
          cycle,
          seniorityBand: "MANAGER",
          dominantWorkload: workload,
          demandsLevel: cycle === "2026-D04" ? "HIGH" : "MODERATE",
          resourcesLevel: cycle === "2026-D04" ? "INSUFFICIENT" : "ADEQUATE",
          trustSignal: "VERIFY_ROUTINELY",
        },
      });
    }
  }

  // A single leadership respondent in the latest cycle only, on purpose:
  // demonstrates the suppression guard refusing to draw a conclusion from one person.
  await prisma.pulseResponse.create({
    data: {
      teamId: team.id,
      cycle: "2026-D04",
      seniorityBand: "LEADERSHIP",
      dominantWorkload: "MEETINGS",
      demandsLevel: "HIGH",
      resourcesLevel: "ADEQUATE",
      trustSignal: "OVERRIDE_FREQUENTLY",
    },
  });

  redirect(`/admin/teams/${team.id}`);
}
