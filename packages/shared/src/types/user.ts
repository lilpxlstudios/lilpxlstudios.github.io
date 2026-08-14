import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "client"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Display-only mirror of the Firebase Auth custom claim.
// Security rules and Cloud Functions must trust the `admin` custom claim on the ID token,
// never this Firestore field — a client cannot write their own claim, but this doc is
// convenient for admin-side UI listing/search.
// Filled in by the client themselves on first login — supplements whatever
// the studio captured at booking time. Deliberately short: package interest,
// preferred date, and a free-text note. Nothing more personal than that.
export const onboardingSchema = z.object({
  packagePreference: z.string().nullable().default(null),
  preferredShootDate: z.number().nullable().default(null),
  notes: z.string().nullable().default(null),
  completedAt: z.number().nullable().default(null),
  skippedAt: z.number().nullable().default(null),
});
export type Onboarding = z.infer<typeof onboardingSchema>;

export const userSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().default(null),
  role: userRoleSchema,
  onboarding: onboardingSchema.nullable().default(null),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable().default(null),
});
export type User = z.infer<typeof userSchema>;
