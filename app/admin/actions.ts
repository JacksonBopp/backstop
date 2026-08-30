"use server";

import { redirect } from "next/navigation";
import { verifyAdminPassword } from "@/lib/auth";
import { setSessionCookie, clearSessionCookie, requireAdminSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { SubmissionStatus } from "@/generated/prisma/client";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await verifyAdminPassword(password);

  if (!ok) {
    redirect("/admin/login?error=1");
  }

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
