import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/session";
import { syncAllAccounts } from "@/lib/backstopSync";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isAdmin = await hasValidSession();

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncAllAccounts();
  return NextResponse.json({ synced: results });
}
