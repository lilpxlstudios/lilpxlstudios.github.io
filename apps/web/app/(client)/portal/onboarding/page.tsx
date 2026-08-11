import type { Metadata } from "next";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { OnboardingForm } from "./OnboardingForm";
import type { User } from "@lps/shared";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const session = await requireSession();
  const snap = await adminDb.collection("users").doc(session.uid).get();
  const user = snap.data() as User | undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl">Welcome{user?.displayName ? `, ${user.displayName}` : ""}</h1>
        <p className="text-ink-500 text-sm mt-1">
          A couple of quick questions to help us prepare for your session — everything here is
          optional.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
