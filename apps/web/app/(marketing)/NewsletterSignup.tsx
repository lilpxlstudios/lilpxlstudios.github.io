"use client";

import { useState } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import type { NewsletterSubscriber } from "@lps/shared";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const ref = doc(collection(clientDb, "newsletterSubscribers"));
      // Field set must exactly match firestore.rules' `hasOnly([...])` allowlist
      // for public creates — no `id` field (the doc ID carries that).
      const subscriber: Omit<NewsletterSubscriber, "id"> = {
        email,
        name: null,
        optInAt: Date.now(),
        optInSource: "website_footer",
        doubleOptInConfirmed: false,
        confirmationToken: crypto.randomUUID(),
        status: "pending",
        unsubscribedAt: null,
      };
      await setDoc(ref, subscriber);
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="text-sm text-ink-500">Check your inbox to confirm your subscription.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-ink-100 rounded-md px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "…" : "Subscribe"}
      </button>
      {error && <p className="text-sm text-danger-500 w-full">{error}</p>}
    </form>
  );
}
