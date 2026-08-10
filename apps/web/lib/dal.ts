import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebase/admin";
import { SESSION_COOKIE_NAME } from "./session";

export type Session = {
  uid: string;
  email: string | null;
  admin: boolean;
};

// Verifies the session cookie against Firebase Auth (checks revocation) on every
// call within a render pass; React's cache() dedupes repeated calls per request.
// This is the "secure check" — proxy.ts only does an optimistic cookie-presence check.
export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      admin: decoded.admin === true,
    };
  } catch {
    return null;
  }
});

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (!session.admin) {
    redirect("/portal");
  }
  return session;
}
