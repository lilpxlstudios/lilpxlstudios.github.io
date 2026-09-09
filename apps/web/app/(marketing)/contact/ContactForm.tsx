"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { submitInquiry } from "@/lib/inquiries";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shootTypeInterest, setShootTypeInterest] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      await submitInquiry({
        name,
        email,
        phone: phone || null,
        message,
        shootTypeInterest: shootTypeInterest || null,
      });
      track("Contact Form Submitted", { shootTypeInterest: shootTypeInterest || "none" });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return <p className="text-sm text-success-500">Thanks — we&apos;ll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="name" className="text-sm text-ink-700">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-400"
        />
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="email" className="text-sm text-ink-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-400"
        />
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="phone" className="text-sm text-ink-700">
          Phone (optional)
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-400"
        />
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="shootTypeInterest" className="text-sm text-ink-700">
          Shoot type (optional)
        </label>
        <input
          id="shootTypeInterest"
          value={shootTypeInterest}
          onChange={(e) => setShootTypeInterest(e.target.value)}
          placeholder="Wedding, portrait, event…"
          className="border border-ink-100 rounded-md px-3 py-2 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-400"
        />
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="message" className="text-sm text-ink-700">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-400"
        />
      </div>
      {error && <p className="text-sm text-danger-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-ink-700 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
