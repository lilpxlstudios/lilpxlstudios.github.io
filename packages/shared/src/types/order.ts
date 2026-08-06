import { z } from "zod";

export const ORDER_STATUSES = [
  "inquiry",
  "booked",
  "shot_completed",
  "proofs_ready",
  "selection_in_progress",
  "selection_completed",
  "payment_pending",
  "paid",
  "invoiced",
  "delivered",
  "archived",
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Allowed forward transitions for the order state machine.
// Enforced by Cloud Functions (functions/src/triggers) — never trust client-set status writes.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  inquiry: ["booked", "archived"],
  booked: ["shot_completed", "archived"],
  shot_completed: ["proofs_ready", "archived"],
  proofs_ready: ["selection_in_progress", "archived"],
  selection_in_progress: ["selection_completed", "archived"],
  selection_completed: ["payment_pending", "archived"],
  payment_pending: ["paid", "archived"],
  paid: ["invoiced", "archived"],
  invoiced: ["delivered", "archived"],
  delivered: ["archived"],
  archived: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export const driveLinkSchema = z.object({
  url: z.string().url(),
  folderId: z.string(),
  attachedAt: z.number(),
  attachedBy: z.string(),
});
export type DriveLink = z.infer<typeof driveLinkSchema>;

export const selectionStateSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  selectedCount: z.number().int().nonnegative().default(0),
  totalCount: z.number().int().nonnegative().default(0),
  completedAt: z.number().nullable().default(null),
});
export type SelectionState = z.infer<typeof selectionStateSchema>;

export const orderSchema = z.object({
  id: z.string(),
  clientUid: z.string(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  shootType: z.string(),
  shootDate: z.number(),
  status: orderStatusSchema,
  proofsDriveLink: driveLinkSchema.nullable().default(null),
  deliveryDriveLink: driveLinkSchema.nullable().default(null),
  selectionState: selectionStateSchema,
  amountDue: z.number().nonnegative().default(0),
  currency: z.literal("INR").default("INR"),
  createdAt: z.number(),
  updatedAt: z.number(),
  createdBy: z.string(),
});
export type Order = z.infer<typeof orderSchema>;

export const proofSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  driveFileId: z.string(),
  thumbStoragePath: z.string(),
  thumbUrl: z.string().url().nullable(),
  selected: z.boolean().default(false),
  selectedAt: z.number().nullable().default(null),
  index: z.number().int().nonnegative(),
});
export type Proof = z.infer<typeof proofSchema>;

export const selectionExportSchema = z.object({
  id: z.string(),
  csvStoragePath: z.string(),
  selectedFileNames: z.array(z.string()),
  count: z.number().int().nonnegative(),
  generatedAt: z.number(),
});
export type SelectionExport = z.infer<typeof selectionExportSchema>;
