"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email";
import { PACKAGE_OPTIONS, type Order, type User } from "@lps/shared";

// Not deployed to littlepixelstudios.com yet (DNS not cut over) — point this
// at the live domain once it is, same convention as functions/src/marketing.ts.
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

const packageValues = PACKAGE_OPTIONS.map((p) => p.value) as [string, ...string[]];

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  shootType: z.enum(packageValues, { message: "Select a package" }),
  shootDate: z.string().min(1, "Shoot date is required"),
  amountDue: z.coerce.number().nonnegative().default(0),
});

export type CreateClientState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; resetLink: string; email: string; orderId: string; emailSent: boolean };

function firstLoginEmailHtml(name: string, resetLink: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1d1916;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">Welcome to Little Pixel Studios</h1>
      <p style="font-size: 15px; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Your client account is ready. Use the link below to set your password and sign in —
        from there you'll be able to view your order, select your photos once proofs are ready,
        and download your final gallery.
      </p>
      <p style="margin: 24px 0;">
        <a href="${resetLink}" style="background: #bd9d28; color: #0a0a0b; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
          Set your password
        </a>
      </p>
      <p style="font-size: 13px; color: #6b6b72;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="word-break: break-all;">${resetLink}</span>
      </p>
    </div>
  `;
}

export async function createClient(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const session = await requireAdmin();

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    shootType: formData.get("shootType"),
    shootDate: formData.get("shootDate"),
    amountDue: formData.get("amountDue") || 0,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }
  const { name, email, phone, shootType, shootDate, amountDue } = parsed.data;

  const tempPassword = randomBytes(18).toString("base64url");

  let uid: string;
  try {
    const existing = await adminAuth.getUserByEmail(email).catch(() => null);
    if (existing) {
      return { status: "error", message: "A user with this email already exists." };
    }
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
      displayName: name,
      emailVerified: false,
    });
    uid = userRecord.uid;
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Could not create user." };
  }

  const now = Date.now();
  const profile: User = {
    uid,
    displayName: name,
    email,
    phone: phone ?? null,
    role: "client",
    onboarding: null,
    createdAt: now,
    updatedAt: now,
  };
  await adminDb.collection("users").doc(uid).set(profile);

  const shootTypeLabel = PACKAGE_OPTIONS.find((p) => p.value === shootType)!.label;

  const orderRef = adminDb.collection("orders").doc();
  const order: Order = {
    id: orderRef.id,
    clientUid: uid,
    clientName: name,
    clientEmail: email,
    shootType: shootTypeLabel,
    shootDate: new Date(shootDate).getTime(),
    status: "inquiry",
    proofsDriveLink: null,
    deliveryDriveLink: null,
    selectionState: { status: "not_started", selectedCount: 0, totalCount: 0, completedAt: null },
    amountDue,
    currency: "INR",
    createdAt: now,
    updatedAt: now,
    createdBy: session.uid,
  };
  await orderRef.set(order);

  const resetLink = await adminAuth.generatePasswordResetLink(email, {
    url: `${SITE_URL}/login`,
  });

  const { ok: emailSent } = await sendEmail({
    to: email,
    subject: "Welcome to Little Pixel Studios — set your password",
    html: firstLoginEmailHtml(name, resetLink),
  });

  revalidatePath("/admin/clients");
  return { status: "success", resetLink, email, orderId: orderRef.id, emailSent };
}
