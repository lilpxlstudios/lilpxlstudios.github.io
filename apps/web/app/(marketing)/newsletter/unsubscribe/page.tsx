import type { Metadata } from "next";
import { unsubscribeNewsletter } from "@/lib/actions/marketing";

export const metadata: Metadata = { title: "Unsubscribe" };

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;
  const result =
    !id || !token
      ? { status: "error" as const, message: "This unsubscribe link is missing information." }
      : await unsubscribeNewsletter(id, token);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        {result.status === "success" ? "You're unsubscribed" : "Something went wrong"}
      </h1>
      <p className="text-ink-500 text-sm max-w-sm">
        {result.status === "success"
          ? "You won't receive any more Little Pixel Studios newsletter emails."
          : result.message}
      </p>
    </div>
  );
}
