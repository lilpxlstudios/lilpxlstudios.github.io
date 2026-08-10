"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import { createPaymentOrder } from "@/lib/actions/payments";
import type { Order, OrderStatus } from "@lps/shared";

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme?: { color: string };
  handler: () => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayCheckout = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load checkout script.")));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load checkout script."));
    document.body.appendChild(script);
  });
}

const POST_PAYMENT_STATUSES: OrderStatus[] = ["paid", "invoiced", "delivered", "archived"];

export function PaymentPanel({ orderId, initialOrder }: { orderId: string; initialOrder: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(clientDb, "orders", orderId), (snap) => {
      if (snap.exists()) setOrder(snap.data() as Order);
    });
    return unsubscribe;
  }, [orderId]);

  if (POST_PAYMENT_STATUSES.includes(order.status)) {
    return (
      <div className="flex flex-col gap-1 border-t border-ink-100 pt-6">
        <p className="text-sm text-ink-700 font-medium">Payment</p>
        <p className="text-sm text-success-600">
          Paid — ₹{order.amountDue.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }

  if (order.status !== "payment_pending") {
    return null;
  }

  async function handlePay() {
    setError(null);
    setPending(true);
    try {
      const result = await createPaymentOrder(orderId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      await loadCheckoutScript();
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        setError("Couldn't load the payment window. Check your connection and try again.");
        return;
      }
      const checkout = new RazorpayCtor({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: result.name,
        description: result.description,
        order_id: result.razorpayOrderId,
        prefill: result.prefill,
        theme: { color: "#171717" },
        handler: () => setConfirming(true),
        modal: { ondismiss: () => setPending(false) },
      });
      checkout.open();
    } catch {
      setError("Something went wrong starting the payment. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-ink-100 pt-6">
      <p className="text-sm text-ink-700 font-medium">Payment</p>
      <p className="text-sm text-ink-500">
        ₹{order.amountDue.toLocaleString("en-IN")} due for {order.shootType}.
      </p>
      {confirming ? (
        <p className="text-sm text-ink-500">Confirming your payment…</p>
      ) : (
        <button
          type="button"
          onClick={handlePay}
          disabled={pending}
          className="self-start bg-accent-600 text-paper-50 rounded-md px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Opening…" : "Pay now"}
        </button>
      )}
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}
