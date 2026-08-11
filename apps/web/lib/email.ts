import "server-only";
import { Resend } from "resend";

// Separate from functions/src/email.ts — this app deploys to Vercel, not
// Firebase, so it needs its own RESEND_API_KEY and can't share the Cloud
// Functions secret binding. Same sender restriction applies until
// littlepixelstudios.com is verified in Resend (M7): mail only delivers to
// the Resend account's own inbox via the shared onboarding@resend.dev sender.
const FROM_EMAIL = process.env.MARKETING_FROM_EMAIL ?? "Little Pixel Studios <onboarding@resend.dev>";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

// Never throws — callers treat email as best-effort and must not let a
// delivery failure block the underlying action (e.g. client account
// creation), since the on-screen link is always the fallback.
export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("sendEmail: RESEND_API_KEY not set, skipping send", { to: params.to, subject: params.subject });
    return { ok: false, error: "Email isn't configured yet." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: FROM_EMAIL, ...params });
    if (error) {
      console.error("sendEmail failed", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendEmail threw", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
