import { logger } from "firebase-functions/v2";
import { getAuth } from "firebase-admin/auth";
import "./admin";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

// Stubbed until Resend is wired in: logs what would be sent instead of
// actually sending, so the public forms / notification triggers are fully
// testable before an API key exists. Swap this body for a Resend API call
// (add the `resend` dependency + RESEND_API_KEY secret) — callers don't change.
export async function sendEmail(params: SendEmailParams): Promise<void> {
  logger.info("sendEmail (stub, not actually sent)", params);
}

// Studio staff are just Firebase Auth users with the `admin` custom claim —
// there's no separate "owner email" config to keep in sync.
export async function getAdminEmails(): Promise<string[]> {
  const result = await getAuth().listUsers(1000);
  return result.users
    .filter((user) => user.customClaims?.admin === true && user.email)
    .map((user) => user.email!);
}
