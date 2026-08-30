import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { hasValidSession } from "@/lib/session";
import { syncAllAccounts } from "@/lib/backstopSync";

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") ?? "";
  const isCron = Boolean(cronSecret) && safeEquals(authHeader, `Bearer ${cronSecret}`);
  const isAdmin = await hasValidSession();

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncAllAccounts();
  return NextResponse.json({ synced: results });
}
