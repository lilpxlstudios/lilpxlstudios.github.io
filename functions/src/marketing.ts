import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import "./admin";
import { sendEmail, getAdminEmails } from "./email";
import type { Inquiry, NewsletterSubscriber, Order } from "@lps/shared";

// Not deployed to a real domain yet (M7) — point this at littlepixelstudios.com
// once the site is live.
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export const onInquiryCreated = onDocumentCreated("inquiries/{inquiryId}", async (event) => {
  const inquiry = event.data?.data() as Inquiry | undefined;
  if (!inquiry) return;

  const adminEmails = await getAdminEmails();
  if (adminEmails.length === 0) {
    logger.warn("onInquiryCreated: no admin users to notify");
    return;
  }

  await Promise.all(
    adminEmails.map((to) =>
      sendEmail({
        to,
        subject: `New inquiry from ${inquiry.name}`,
        html: `<p><strong>${inquiry.name}</strong> (${inquiry.email}${inquiry.phone ? `, ${inquiry.phone}` : ""}) submitted a new inquiry${inquiry.shootTypeInterest ? ` about ${inquiry.shootTypeInterest}` : ""}:</p><p>${inquiry.message}</p>`,
      })
    )
  );
});

export const onNewsletterSubscriberCreated = onDocumentCreated(
  "newsletterSubscribers/{subscriberId}",
  async (event) => {
    const subscriber = event.data?.data() as NewsletterSubscriber | undefined;
    if (!subscriber || subscriber.status !== "pending" || !subscriber.confirmationToken) return;

    const confirmUrl = `${SITE_URL}/newsletter/confirm?id=${event.params.subscriberId}&token=${subscriber.confirmationToken}`;
    await sendEmail({
      to: subscriber.email,
      subject: "Confirm your Little Pixel Studios newsletter subscription",
      html: `<p>Hi${subscriber.name ? ` ${subscriber.name}` : ""},</p><p>Click below to confirm your subscription:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
    });
  }
);

// Replaces the admin dashboard's "Email alerts land in a later milestone" placeholder.
export const onSelectionCompleted = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data?.before.data() as Order | undefined;
  const after = event.data?.after.data() as Order | undefined;
  if (!before || !after) return;
  if (before.selectionState.status === "completed" || after.selectionState.status !== "completed") return;

  const adminEmails = await getAdminEmails();
  await Promise.all(
    adminEmails.map((to) =>
      sendEmail({
        to,
        subject: `${after.clientName} finished selecting photos`,
        html: `<p>${after.clientName} selected ${after.selectionState.selectedCount} of ${after.selectionState.totalCount} photos for "${after.shootType}". <a href="${SITE_URL}/admin/orders/${event.params.orderId}">Review the order</a>.</p>`,
      })
    )
  );
});
