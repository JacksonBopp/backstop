import { prisma } from "@/lib/db";

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // failures older than this don't count toward the lockout
const LOCKOUT_MS = 5 * 60 * 1000;

export async function isLockedOut(ip: string): Promise<boolean> {
  const record = await prisma.loginAttempt.findUnique({ where: { ip } });
  if (!record?.lockedUntil) return false;
  return record.lockedUntil.getTime() > Date.now();
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const record = await prisma.loginAttempt.findUnique({ where: { ip } });
  const now = new Date();
  const windowExpired = !record || now.getTime() - record.lastFailedAt.getTime() > WINDOW_MS;
  const nextCount = windowExpired ? 1 : record.failedCount + 1;
  const lockedUntil = nextCount >= MAX_FAILED_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_MS) : null;

  await prisma.loginAttempt.upsert({
    where: { ip },
    create: { ip, failedCount: nextCount, lastFailedAt: now, lockedUntil },
    update: { failedCount: nextCount, lastFailedAt: now, lockedUntil },
  });
}

export async function clearFailedAttempts(ip: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { ip } });
}
