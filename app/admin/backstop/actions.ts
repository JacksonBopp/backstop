"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { requireAdminSession } from "@/lib/session";
import { syncOneAccount } from "@/lib/backstopSync";

/**
 * Kicks off the OAuth authorization-code flow for a Zendesk account.
 * The subdomain is encoded into `state` (plus a short random suffix for
 * basic hygiene) since Zendesk's redirect back to our fixed callback URL
 * doesn't otherwise tell us which subdomain the code belongs to.
 */
export async function startZendeskConnect(formData: FormData) {
  await requireAdminSession();

  const subdomain = String(formData.get("subdomain") ?? "").trim();
  if (!subdomain) return;

  const clientId = process.env.ZENDESK_OAUTH_CLIENT_ID;
  const redirectUri = process.env.ZENDESK_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("ZENDESK_OAUTH_CLIENT_ID / ZENDESK_OAUTH_REDIRECT_URI are not set");
  }

  const nonce = randomBytes(8).toString("hex");
  const state = `${subdomain}:${nonce}`;

  const authorizeUrl = new URL(`https://${subdomain}.zendesk.com/oauth/authorizations/new`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "read");
  authorizeUrl.searchParams.set("state", state);

  redirect(authorizeUrl.toString());
}

export async function triggerSync(accountId: string) {
  await requireAdminSession();
  await syncOneAccount(accountId);
  revalidatePath(`/admin/backstop/${accountId}`);
}
