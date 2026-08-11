"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { PACKAGE_OPTIONS, type Onboarding } from "@lps/shared";

const packageValues = PACKAGE_OPTIONS.map((p) => p.value) as [string, ...string[]];

const onboardingSchema = z.object({
  packagePreference: z.enum(packageValues).optional(),
  preferredShootDate: z.string().optional(),
  notes: z.string().optional(),
});

export type OnboardingState = { status: "idle" } | { status: "error"; message: string };

export async function submitOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await requireSession();

  const parsed = onboardingSchema.safeParse({
    packagePreference: formData.get("packagePreference") || undefined,
    preferredShootDate: formData.get("preferredShootDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const packageLabel = parsed.data.packagePreference
    ? (PACKAGE_OPTIONS.find((p) => p.value === parsed.data.packagePreference)?.label ?? null)
    : null;

  const onboarding: Onboarding = {
    packagePreference: packageLabel,
    preferredShootDate: parsed.data.preferredShootDate
      ? new Date(parsed.data.preferredShootDate).getTime()
      : null,
    notes: parsed.data.notes || null,
    completedAt: Date.now(),
    skippedAt: null,
  };

  await adminDb.collection("users").doc(session.uid).update({ onboarding, updatedAt: Date.now() });

  revalidatePath("/portal");
  redirect("/portal");
}

export async function skipOnboarding(): Promise<void> {
  const session = await requireSession();

  const onboarding: Onboarding = {
    packagePreference: null,
    preferredShootDate: null,
    notes: null,
    completedAt: null,
    skippedAt: Date.now(),
  };

  await adminDb.collection("users").doc(session.uid).update({ onboarding, updatedAt: Date.now() });

  revalidatePath("/portal");
  redirect("/portal");
}
