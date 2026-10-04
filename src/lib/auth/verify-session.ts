import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";

/**
 * Single source of truth for "is this request an authenticated owner request".
 *
 * Proxy already redirects unauthenticated page visits, but it is an optimistic
 * cookie check. Every API route and server-side data read calls this too, so a
 * forged cookie cannot reach the database.
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
});

/** Same check, but returns null instead of redirecting. For API routes. */
export const readSessionOrNull = cache(async (): Promise<SessionPayload | null> => {
  return getSession();
});
