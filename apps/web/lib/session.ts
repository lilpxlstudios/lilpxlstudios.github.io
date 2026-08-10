import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./firebase/admin";

export const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days — matches Firebase's session-cookie ceiling

// Exchanges a short-lived Firebase ID token (from client-side sign-in) for a
// long-lived, httpOnly session cookie. Called only from app/api/auth/session/route.ts.
export async function createSessionCookie(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
