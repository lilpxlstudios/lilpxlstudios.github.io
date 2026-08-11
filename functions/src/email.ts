import { logger } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { getAuth } from "firebase-admin/auth";
import { Resend } from "resend";
import "./admin";

// Callers that invoke sendEmail must list this in their trigger's `secrets`
// option, or the value will be empty at runtime.
export const resendApiKey = defineSecret("RESEND_API_KEY");

// Resend's shared testing domain — works with no DNS setup but only delivers
// to the account owner's own inbox. Swap once littlepixelstudios.com is
// verified in Resend (M7).
const FROM_EMAIL = process.env.MARKETING_FROM_EMAIL ?? "Little Pixel Studios <onboarding@resend.dev>";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const resend = new Resend(resendApiKey.value());
  const { error } = await resend.emails.send({ from: FROM_EMAIL, ...params });
  if (error) {
    logger.error("sendEmail failed", { error, to: params.to, subject: params.subject });
    throw new Error(`sendEmail failed: ${error.message}`);
  }
}

// Studio staff are just Firebase Auth users with the `admin` custom claim —
// there's no separate "owner email" config to keep in sync.
export async function getAdminEmails(): Promise<string[]> {
  const result = await getAuth().listUsers(1000);
  return result.users
    .filter((user) => user.customClaims?.admin === true && user.email)
    .map((user) => user.email!);
}
