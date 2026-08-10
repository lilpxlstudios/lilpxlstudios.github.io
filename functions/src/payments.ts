import { createHmac, timingSafeEqual } from "node:crypto";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import "./admin";
import { canTransitionOrderStatus, type Order, type Payment } from "@lps/shared";

const razorpayWebhookSecret = defineSecret("RAZORPAY_WEBHOOK_SECRET");

function verifySignature(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

type RazorpayPaymentEntity = {
  id: string;
  order_id: string;
  amount: number;
};

type RazorpayWebhookPayload = {
  event: string;
  payload: { payment: { entity: RazorpayPaymentEntity } };
};

// Razorpay retries webhooks on non-2xx responses, so every code path below
// must be safe to re-run with the same event (idempotency via webhookEvents).
export const razorpayWebhook = onRequest(
  { region: "asia-south1", secrets: [razorpayWebhookSecret] },
  async (req, res) => {
    const signature = req.header("x-razorpay-signature");
    const valid = verifySignature(req.rawBody, signature, razorpayWebhookSecret.value());
    if (!valid) {
      logger.warn("razorpayWebhook: invalid signature");
      res.status(400).send("Invalid signature");
      return;
    }

    const body = req.body as RazorpayWebhookPayload;
    const { event } = body;
    if (event !== "payment.captured" && event !== "payment.failed") {
      res.status(200).send("Ignored");
      return;
    }

    const paymentEntity = body.payload.payment.entity;
    const eventId = `${event}_${paymentEntity.id}`;
    const db = getFirestore();

    const eventRef = db.collection("webhookEvents").doc(eventId);
    const alreadyProcessed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (snap.exists) return true;
      tx.set(eventRef, { event, paymentEntityId: paymentEntity.id, receivedAt: Date.now() });
      return false;
    });
    if (alreadyProcessed) {
      res.status(200).send("Already processed");
      return;
    }

    const paymentsQuery = await db
      .collection("payments")
      .where("razorpayOrderId", "==", paymentEntity.order_id)
      .limit(1)
      .get();
    if (paymentsQuery.empty) {
      logger.error("razorpayWebhook: no payment doc for razorpay order", paymentEntity.order_id);
      res.status(200).send("No matching payment");
      return;
    }
    const paymentDoc = paymentsQuery.docs[0]!;
    const payment = paymentDoc.data() as Payment;

    if (event === "payment.failed") {
      await paymentDoc.ref.update({ status: "failed" satisfies Payment["status"] });
      res.status(200).send("OK");
      return;
    }

    // payment.captured
    await paymentDoc.ref.update({
      status: "paid" satisfies Payment["status"],
      razorpayPaymentId: paymentEntity.id,
      verifiedAt: Date.now(),
    });

    const orderRef = db.collection("orders").doc(payment.orderId);
    await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) return;
      const order = orderSnap.data() as Order;
      if (!canTransitionOrderStatus(order.status, "paid")) return;
      tx.update(orderRef, { status: "paid", updatedAt: Date.now() });
    });

    res.status(200).send("OK");
  }
);
