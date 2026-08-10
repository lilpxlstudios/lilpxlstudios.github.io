"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireSession } from "@/lib/dal";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { buildSelectionCsv, canTransitionOrderStatus, type Order, type Proof } from "@lps/shared";

export type CompleteSelectionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; count: number };

export async function completeSelection(
  orderId: string,
  _prevState: CompleteSelectionState
): Promise<CompleteSelectionState> {
  const session = await requireSession();

  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const order = orderSnap.data() as Order;

  if (!session.admin && session.uid !== order.clientUid) {
    return { status: "error", message: "You don't have access to this order." };
  }
  if (order.selectionState.status === "completed") {
    return { status: "error", message: "Selection was already submitted." };
  }
  if (!canTransitionOrderStatus(order.status, "selection_completed")) {
    return { status: "error", message: `Can't complete selection from status "${order.status}".` };
  }

  const proofsSnap = await orderRef.collection("proofs").where("selected", "==", true).get();
  const selectedProofs = proofsSnap.docs.map((doc) => doc.data() as Proof);

  const csv = buildSelectionCsv(selectedProofs);
  const now = Date.now();
  const storagePath = `orders/${orderId}/exports/selection-${now}.csv`;
  await adminStorage.bucket().file(storagePath).save(Buffer.from(csv, "utf-8"), {
    metadata: { contentType: "text/csv" },
  });

  const exportRef = orderRef.collection("selectionExports").doc();
  await exportRef.set({
    id: exportRef.id,
    csvStoragePath: storagePath,
    selectedFileNames: selectedProofs.map((p) => p.fileName),
    count: selectedProofs.length,
    generatedAt: now,
  });

  await orderRef.update({
    status: "selection_completed",
    "selectionState.status": "completed",
    "selectionState.selectedCount": selectedProofs.length,
    "selectionState.completedAt": now,
    updatedAt: now,
  });

  revalidatePath(`/portal/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { status: "success", count: selectedProofs.length };
}

export type FormState = { status: "idle" } | { status: "error"; message: string };

// Deliberate override of the forward-only status machine — the studio owner
// may need to let a client revise their picks after submitting.
export async function reopenSelection(orderId: string): Promise<FormState> {
  await requireAdmin();

  const orderRef = adminDb.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const order = snap.data() as Order;
  if (order.status !== "selection_completed") {
    return { status: "error", message: "Selection isn't completed, nothing to reopen." };
  }

  await orderRef.update({
    status: "selection_in_progress",
    "selectionState.status": "in_progress",
    "selectionState.completedAt": null,
    updatedAt: Date.now(),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/portal/orders/${orderId}`);
  return { status: "idle" };
}
