import { prisma } from "@/lib/db";
import { getCycleForDate } from "@/data/backstopScoring";
import type { ZendeskAccount } from "@/generated/prisma/client";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

async function getValidAccessToken(account: ZendeskAccount): Promise<string> {
  const bufferMs = 60_000;
  if (account.tokenExpiresAt.getTime() - bufferMs > Date.now()) {
    return account.accessToken;
  }

  const clientId = process.env.ZENDESK_OAUTH_CLIENT_ID;
  const clientSecret = process.env.ZENDESK_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("OAuth env vars are not configured");

  const res = await fetch(`https://${account.subdomain}.zendesk.com/oauth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed for ${account.subdomain}: ${await res.text()}`);

  const tokens: TokenResponse = await res.json();
  const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000);

  await prisma.zendeskAccount.update({
    where: { id: account.id },
    data: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiresAt },
  });

  return tokens.access_token;
}

interface ZendeskGroup {
  id: number;
  name: string;
}

interface ZendeskTicket {
  id: number;
  tags: string[];
  group_id: number | null;
  status: string;
  updated_at: string;
}

interface IncrementalTicketsResponse {
  tickets: ZendeskTicket[];
  next_page: string | null;
  end_time: number;
  end_of_stream: boolean;
}

const MAX_PAGES = 20; // safety cap, not full backoff/retry handling, that's a v2 concern

async function syncAccount(account: ZendeskAccount): Promise<number> {
  const accessToken = await getValidAccessToken(account);
  const headers = { Authorization: `Bearer ${accessToken}` };

  const groupsRes = await fetch(`https://${account.subdomain}.zendesk.com/api/v2/groups.json`, { headers });
  if (!groupsRes.ok) throw new Error(`Failed to fetch groups for ${account.subdomain}`);
  const { groups }: { groups: ZendeskGroup[] } = await groupsRes.json();
  const groupNameById = new Map(groups.map((g) => [g.id, g.name]));

  const startTime = account.lastSyncedAt ? Math.floor(account.lastSyncedAt.getTime() / 1000) : 0;
  let url = `https://${account.subdomain}.zendesk.com/api/v2/incremental/tickets?start_time=${startTime}`;

  let snapshotCount = 0;
  let latestEndTime = startTime;

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Incremental export failed for ${account.subdomain}: ${await res.text()}`);
    const data: IncrementalTicketsResponse = await res.json();

    for (const ticket of data.tickets) {
      const cycle = getCycleForDate(new Date(ticket.updated_at));
      const groupId = ticket.group_id;
      await prisma.ticketSnapshot.upsert({
        where: { accountId_ticketId_cycle: { accountId: account.id, ticketId: ticket.id, cycle } },
        create: {
          accountId: account.id,
          ticketId: ticket.id,
          cycle,
          groupId,
          groupName: groupId ? (groupNameById.get(groupId) ?? null) : null,
          aiAssisted: ticket.tags.includes("backstop_ai_assisted"),
          status: ticket.status,
        },
        update: {
          groupId,
          groupName: groupId ? (groupNameById.get(groupId) ?? null) : null,
          aiAssisted: ticket.tags.includes("backstop_ai_assisted"),
          status: ticket.status,
        },
      });
      snapshotCount++;
    }

    latestEndTime = data.end_time;
    if (data.end_of_stream || !data.next_page) break;
    url = data.next_page;
  }

  await prisma.zendeskAccount.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date(latestEndTime * 1000) },
  });

  return snapshotCount;
}

export async function syncAllAccounts(): Promise<Record<string, number | string>> {
  const accounts = await prisma.zendeskAccount.findMany();
  const results: Record<string, number | string> = {};

  for (const account of accounts) {
    try {
      results[account.subdomain] = await syncAccount(account);
    } catch (err) {
      results[account.subdomain] = err instanceof Error ? `error: ${err.message}` : "error";
    }
  }

  return results;
}

export async function syncOneAccount(accountId: string): Promise<number | string> {
  const account = await prisma.zendeskAccount.findUniqueOrThrow({ where: { id: accountId } });
  try {
    return await syncAccount(account);
  } catch (err) {
    return err instanceof Error ? `error: ${err.message}` : "error";
  }
}
