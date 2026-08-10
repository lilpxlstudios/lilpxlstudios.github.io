"use server";

import Razorpay from "razorpay";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Order, Payment } from "@lps/shared";

export type CreatePaymentOrderResult =
  | { status: "error"; message: string }
  | {
      status: "success";
      keyId: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      prefill: { name: string; email: string };
    };

// Full amountDue only — deposit/balance splits are schema-ready (Payment.purpose)
// but not exposed in the UI yet.
export async function createPaymentOrder(orderId: string): Promise<CreatePaymentOrderResult> {
  const session = await requireSession();

  const orderRef = adminDb.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const order = snap.data() as Order;

  if (order.clientUid !== session.uid && !session.admin) {
    return { status: "error", message: "Not authorized." };
  }
  if (order.status !== "payment_pending") {
    return { status: "error", message: "This order isn't awaiting payment." };
  }
  if (order.amountDue <= 0) {
    return { status: "error", message: "No amount due on this order." };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { status: "error", message: "Payments aren't configured yet." };
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const amountInPaise = Math.round(order.amountDue * 100);

  const rpOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: order.currency,
    receipt: order.id,
    notes: { orderId: order.id, clientUid: order.clientUid },
  });

  const paymentRef = adminDb.collection("payments").doc();
  const payment: Payment = {
    id: paymentRef.id,
    orderId: order.id,
    clientUid: order.clientUid,
    razorpayOrderId: rpOrder.id,
    razorpayPaymentId: null,
    razorpaySignature: null,
    amount: order.amountDue,
    currency: order.currency,
    purpose: "full",
    status: "created",
    createdAt: Date.now(),
    verifiedAt: null,
  };
  await paymentRef.set(payment);

  return {
    status: "success",
    keyId,
    razorpayOrderId: rpOrder.id,
    amount: amountInPaise,
    currency: order.currency,
    name: "Little Pixel Studios",
    description: `${order.shootType} — ${order.id}`,
    prefill: { name: order.clientName, email: order.clientEmail },
  };
}
