import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PulseApp from "./PulseApp";

export const metadata: Metadata = {
  title: "IIO Team Pulse",
  description: "A short recurring check-in on workload, pace, and trust in AI output.",
};

export default async function PulsePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = await prisma.team.findUnique({ where: { slug }, select: { name: true, slug: true } });
  if (!team) notFound();

  return <PulseApp slug={team.slug} teamName={team.name} />;
}
