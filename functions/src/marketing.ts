import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import "./admin";
import { sendEmail, getAdminEmails, escapeHtml, resendApiKey } from "./email";
import type { Inquiry, NewsletterSubscriber, Order } from "@lps/shared";

// Not deployed to a real domain yet (M7) — point this at littlepixelstudios.com
// once the site is live.
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

// Kept in sync manually with apps/web/app/(marketing)/siteConfig.ts's
// studioContact.phoneDisplay — functions/ doesn't share app code with apps/web.
const STUDIO_PHONE_DISPLAY = "+91 97911 43983";

export const onInquiryCreated = onDocumentCreated(
  { document: "inquiries/{inquiryId}", secrets: [resendApiKey] },
  async (event) => {
    const inquiry = event.data?.data() as Inquiry | undefined;
    if (!inquiry) return;

    const name = escapeHtml(inquiry.name);
    const email = escapeHtml(inquiry.email);
    const phone = inquiry.phone ? escapeHtml(inquiry.phone) : null;
    const shootTypeInterest = inquiry.shootTypeInterest ? escapeHtml(inquiry.shootTypeInterest) : null;
    const message = escapeHtml(inquiry.message);

    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) {
      logger.warn("onInquiryCreated: no admin users to notify");
    }

    await Promise.all([
      ...adminEmails.map((to) =>
        sendEmail({
          to,
          subject: `New inquiry from ${name}`,
          html: `<p><strong>${name}</strong> (${email}${phone ? `, ${phone}` : ""}) submitted a new inquiry${shootTypeInterest ? ` about ${shootTypeInterest}` : ""}:</p><p>${message}</p>`,
        })
      ),
      sendEmail({
        to: inquiry.email,
        subject: "We received your inquiry — Little Pixel Studios",
        html: `<p>Hi ${name},</p><p>Thanks for reaching out to Little Pixel Studios${shootTypeInterest ? ` about ${shootTypeInterest}` : ""}. We've received your message and will get back to you within 24 hours.</p><p>In the meantime, feel free to reach us directly on WhatsApp at ${STUDIO_PHONE_DISPLAY}.</p>`,
      }),
    ]);
  }
);

export const onNewsletterSubscriberCreated = onDocumentCreated(
  { document: "newsletterSubscribers/{subscriberId}", secrets: [resendApiKey] },
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
export const onSelectionCompleted = onDocumentUpdated(
  { document: "orders/{orderId}", secrets: [resendApiKey] },
  async (event) => {
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
  }
);
