import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "@/lib/auth";

export async function setSessionCookie() {
  const token = await createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function hasValidSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function requireAdminSession() {
  const valid = await hasValidSession();
  if (!valid) redirect("/admin/login");
}
