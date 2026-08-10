import type { Metadata } from "next";
import { confirmNewsletterSubscription } from "@/lib/actions/marketing";

export const metadata: Metadata = { title: "Confirm subscription" };

export default async function ConfirmSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;
  const result =
    !id || !token
      ? { status: "error" as const, message: "This confirmation link is missing information." }
      : await confirmNewsletterSubscription(id, token);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        {result.status === "success" ? "Subscription confirmed" : "Something went wrong"}
      </h1>
      <p className="text-ink-500 text-sm max-w-sm">
        {result.status === "success"
          ? "You're on the list — thanks for subscribing to Little Pixel Studios updates."
          : result.message}
      </p>
    </div>
  );
}
