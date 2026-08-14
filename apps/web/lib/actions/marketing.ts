"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { inquiryStatusSchema, type NewsletterSubscriber } from "@lps/shared";

export type FormState = { status: "idle" } | { status: "error"; message: string };

export async function updateInquiryStatus(
  inquiryId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = inquiryStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) {
    return { status: "error", message: "Invalid status." };
  }

  await adminDb.collection("inquiries").doc(inquiryId).update({ status: parsed.data });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/crm");
  return { status: "idle" };
}

const inquiryNotesSchema = z.object({
  notes: z.string().trim().max(2000).nullable(),
  followUpAt: z.number().nullable(),
});

export async function updateInquiryNotes(
  inquiryId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const rawNotes = formData.get("notes");
  const rawFollowUpDate = formData.get("followUpAt");
  const parsed = inquiryNotesSchema.safeParse({
    notes: typeof rawNotes === "string" && rawNotes.trim() !== "" ? rawNotes : null,
    followUpAt:
      typeof rawFollowUpDate === "string" && rawFollowUpDate !== ""
        ? new Date(rawFollowUpDate).getTime()
        : null,
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid notes or follow-up date." };
  }

  await adminDb.collection("inquiries").doc(inquiryId).update(parsed.data);
  revalidatePath("/admin/crm");
  return { status: "idle" };
}

export type SubscriptionLinkResult = { status: "success" } | { status: "error"; message: string };

// Public, unauthenticated flows — the confirmationToken (an unguessable UUID
// generated client-side at signup) is the credential, not a login session.
// It's kept after confirming (not one-time) so the same link can also serve
// as this subscriber's standing unsubscribe link in future newsletter sends.
export async function confirmNewsletterSubscription(
  subscriberId: string,
  token: string
): Promise<SubscriptionLinkResult> {
  const ref = adminDb.collection("newsletterSubscribers").doc(subscriberId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { status: "error", message: "Subscription not found." };
  }
  const subscriber = snap.data() as NewsletterSubscriber;
  if (!subscriber.confirmationToken || subscriber.confirmationToken !== token) {
    return { status: "error", message: "Invalid or expired confirmation link." };
  }
  if (subscriber.status === "unsubscribed") {
    return { status: "error", message: "This subscription was unsubscribed. Sign up again to resubscribe." };
  }
  if (subscriber.status !== "subscribed") {
    await ref.update({ status: "subscribed", doubleOptInConfirmed: true });
  }
  return { status: "success" };
}

export async function unsubscribeNewsletter(subscriberId: string, token: string): Promise<SubscriptionLinkResult> {
  const ref = adminDb.collection("newsletterSubscribers").doc(subscriberId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { status: "error", message: "Subscription not found." };
  }
  const subscriber = snap.data() as NewsletterSubscriber;
  if (!subscriber.confirmationToken || subscriber.confirmationToken !== token) {
    return { status: "error", message: "Invalid unsubscribe link." };
  }
  if (subscriber.status !== "unsubscribed") {
    await ref.update({ status: "unsubscribed", unsubscribedAt: Date.now() });
  }
  return { status: "success" };
}
