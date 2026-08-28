import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { prisma } from "@/lib/db";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  scope: string;
  expires_in?: number;
}

export async function GET(req: Request) {
  await requireAdminSession();

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.json({ error: `Zendesk denied authorization: ${errorParam}` }, { status: 400 });
  }
  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state from Zendesk." }, { status: 400 });
  }

  const [subdomain] = state.split(":");
  if (!subdomain) {
    return NextResponse.json({ error: "Malformed state." }, { status: 400 });
  }

  const clientId = process.env.ZENDESK_OAUTH_CLIENT_ID;
  const clientSecret = process.env.ZENDESK_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.ZENDESK_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "OAuth env vars are not configured." }, { status: 500 });
  }

  const tokenRes = await fetch(`https://${subdomain}.zendesk.com/oauth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "");
    return NextResponse.json({ error: "Token exchange failed.", detail }, { status: 502 });
  }

  const tokens: TokenResponse = await tokenRes.json();
  const expiresInSeconds = tokens.expires_in ?? 3600;
  const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  const account = await prisma.zendeskAccount.upsert({
    where: { subdomain },
    create: {
      subdomain,
      displayName: subdomain,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
    },
  });

  redirect(`/admin/backstop/${account.id}`);
}
