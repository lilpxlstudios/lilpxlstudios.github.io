"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { User } from "@lps/shared";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});

export type CreateClientState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; resetLink: string; email: string };

export async function createClient(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  await requireAdmin();

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }
  const { name, email, phone } = parsed.data;

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
    createdAt: now,
    updatedAt: now,
  };
  await adminDb.collection("users").doc(uid).set(profile);

  const resetLink = await adminAuth.generatePasswordResetLink(email);

  revalidatePath("/admin/clients");
  return { status: "success", resetLink, email };
}
