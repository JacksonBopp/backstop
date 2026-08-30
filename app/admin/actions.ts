"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { verifyAdminPassword } from "@/lib/auth";
import { setSessionCookie, clearSessionCookie, requireAdminSession } from "@/lib/session";
import { isLockedOut, recordFailedAttempt, clearFailedAttempts } from "@/lib/loginRateLimit";
import { prisma } from "@/lib/db";
import type { SubmissionStatus } from "@/generated/prisma/client";

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function login(formData: FormData) {
  const ip = await getClientIp();

  if (await isLockedOut(ip)) {
    redirect("/admin/login?error=locked");
  }

  const password = String(formData.get("password") ?? "");
  const ok = await verifyAdminPassword(password);

  if (!ok) {
    await recordFailedAttempt(ip);
    redirect("/admin/login?error=1");
  }

  await clearFailedAttempts(ip);
  await setSessionCookie();
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function updateSubmission(id: string, status: SubmissionStatus, notes: string) {
  await requireAdminSession();
  await prisma.submission.update({
    where: { id },
    data: { status, notes },
  });
}
