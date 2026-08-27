"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateTeamSlug } from "@/lib/slug";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.team.create({
    data: { name, slug: generateTeamSlug() },
  });

  redirect("/admin/teams");
}
