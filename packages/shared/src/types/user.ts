import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "client"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Display-only mirror of the Firebase Auth custom claim.
// Security rules and Cloud Functions must trust the `admin` custom claim on the ID token,
// never this Firestore field — a client cannot write their own claim, but this doc is
// convenient for admin-side UI listing/search.
export const userSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().default(null),
  role: userRoleSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type User = z.infer<typeof userSchema>;
