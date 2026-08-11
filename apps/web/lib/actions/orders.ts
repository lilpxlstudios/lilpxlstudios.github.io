"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { checkDriveFolderAccess } from "@/lib/googleDrive";
import {
  ORDER_STATUSES,
  PACKAGE_OPTIONS,
  canTransitionOrderStatus,
  type Order,
  type OrderStatus,
} from "@lps/shared";

const packageValues = PACKAGE_OPTIONS.map((p) => p.value) as [string, ...string[]];

const createOrderSchema = z.object({
  clientUid: z.string().min(1),
  shootType: z.enum(packageValues, { message: "Select a package" }),
  shootDate: z.string().min(1, "Shoot date is required"),
  amountDue: z.coerce.number().nonnegative().default(0),
});

export type FormState = { status: "idle" } | { status: "error"; message: string };

export async function createOrder(
  clientUid: string,
  clientName: string,
  clientEmail: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAdmin();

  const parsed = createOrderSchema.safeParse({
    clientUid,
    shootType: formData.get("shootType"),
    shootDate: formData.get("shootDate"),
    amountDue: formData.get("amountDue") || 0,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }

  const shootTypeLabel = PACKAGE_OPTIONS.find((p) => p.value === parsed.data.shootType)!.label;

  const now = Date.now();
  const orderRef = adminDb.collection("orders").doc();
  const order: Order = {
    id: orderRef.id,
    clientUid: parsed.data.clientUid,
    clientName,
    clientEmail,
    shootType: shootTypeLabel,
    shootDate: new Date(parsed.data.shootDate).getTime(),
    status: "inquiry",
    proofsDriveLink: null,
    deliveryDriveLink: null,
    selectionState: { status: "not_started", selectedCount: 0, totalCount: 0, completedAt: null },
    amountDue: parsed.data.amountDue,
    currency: "INR",
    createdAt: now,
    updatedAt: now,
    createdBy: session.uid,
  };
  await orderRef.set(order);

  revalidatePath(`/admin/clients/${clientUid}`);
  redirect(`/admin/orders/${orderRef.id}`);
}

const statusSchema = z.enum(ORDER_STATUSES);

export async function updateOrderStatus(
  orderId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) {
    return { status: "error", message: "Invalid status." };
  }
  const newStatus: OrderStatus = parsed.data;

  const orderRef = adminDb.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const current = snap.data() as Order;

  if (!canTransitionOrderStatus(current.status, newStatus)) {
    return {
      status: "error",
      message: `Can't move from "${current.status}" to "${newStatus}".`,
    };
  }

  await orderRef.update({ status: newStatus, updatedAt: Date.now() });
  revalidatePath(`/admin/orders/${orderId}`);
  return { status: "idle" };
}

export type DriveLinkState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; folderName: string };

export async function attachDriveLink(
  orderId: string,
  linkType: "proofs" | "delivery",
  _prevState: DriveLinkState,
  formData: FormData
): Promise<DriveLinkState> {
  const session = await requireAdmin();

  const url = String(formData.get("url") ?? "").trim();
  if (!url) {
    return { status: "error", message: "Paste a Google Drive folder link." };
  }

  const check = await checkDriveFolderAccess(url);
  if (!check.ok) {
    return { status: "error", message: check.error };
  }

  const field = linkType === "proofs" ? "proofsDriveLink" : "deliveryDriveLink";
  const orderRef = adminDb.collection("orders").doc(orderId);
  await orderRef.update({
    [field]: {
      url,
      folderId: check.folderId,
      attachedAt: Date.now(),
      attachedBy: session.uid,
    },
    updatedAt: Date.now(),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { status: "success", folderName: check.name };
}

const amountSchema = z.coerce.number().nonnegative();

export async function updateAmountDue(
  orderId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = amountSchema.safeParse(formData.get("amountDue"));
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid amount." };
  }

  await adminDb.collection("orders").doc(orderId).update({
    amountDue: parsed.data,
    updatedAt: Date.now(),
  });
  revalidatePath(`/admin/orders/${orderId}`);
  return { status: "idle" };
}
