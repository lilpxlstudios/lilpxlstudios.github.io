"use client";

import { useState } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import { PACKAGE_OPTIONS, type Inquiry } from "@lps/shared";
import { studioContact } from "./siteConfig";
import { Reveal } from "./Reveal";

const inputClass =
  "rounded-md border border-ink-100 px-3 py-2 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-400";

export function BookingSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shootType, setShootType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const ref = doc(collection(clientDb, "inquiries"));
      const shootTypeLabel = PACKAGE_OPTIONS.find((s) => s.value === shootType)?.label ?? null;
      const message = [
        date ? `Approximate session date / due date: ${date}` : null,
        notes || null,
      ]
        .filter(Boolean)
        .join("\n\n");

      // Field set must exactly match firestore.rules' `hasOnly([...])` allowlist
      // for public creates — no `id` field (the doc ID carries that).
      const inquiry: Omit<Inquiry, "id"> = {
        name,
        email,
        phone: phone || null,
        message: message || "(no additional notes)",
        shootTypeInterest: shootTypeLabel,
        submittedAt: Date.now(),
        status: "new",
      };
      await setDoc(ref, inquiry);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto mb-10 flex max-w-lg flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
          Get In Touch
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink-900 sm:text-5xl">
          Start Your Photo Journey
        </h2>
        <div className="h-0.5 w-12 bg-accent-500" />
      </Reveal>

      <Reveal delay={150} className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6 rounded-2xl border border-ink-100 bg-paper-50 p-6 shadow-sm sm:p-8">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink-900">
              Reach Us Directly
            </h3>
            <p className="mt-2 text-ink-500">
              Have questions about packages, props, or locations? Drop us a line and we will get
              back to you within 24 hours.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-accent-600">☎</span>
              <div>
                <div className="text-xs text-ink-500">Phone & WhatsApp</div>
                <a href={studioContact.phoneHref} className="text-ink-900">
                  {studioContact.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-600">📍</span>
              <div>
                <div className="text-xs text-ink-500">Studio Location</div>
                <p className="text-ink-900">{studioContact.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-600">📷</span>
              <div>
                <div className="text-xs text-ink-500">Instagram</div>
                <a href={studioContact.instagramUrl} target="_blank" rel="noopener" className="text-ink-900">
                  {studioContact.instagramHandle}
                </a>
              </div>
            </div>
          </div>

          <a
            href={studioContact.mapsUrl}
            target="_blank"
            rel="noopener"
            className="mt-2 flex w-fit items-center gap-2 rounded-md border border-accent-500 px-4 py-2 text-sm text-accent-600 transition hover:-translate-y-0.5 hover:bg-accent-400/10"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-paper-50 p-6 shadow-sm sm:p-8">
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink-900">
            Submit an Inquiry
          </h3>

          {sent ? (
            <p className="mt-6 text-success-500">Thanks — we&apos;ll be in touch soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="booking-name" className="text-sm text-ink-700">
                    Full Name
                  </label>
                  <input
                    id="booking-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="booking-phone" className="text-sm text-ink-700">
                    Phone Number
                  </label>
                  <input
                    id="booking-phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your WhatsApp Number"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="booking-email" className="text-sm text-ink-700">
                  Email
                </label>
                <input
                  id="booking-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="booking-shoot" className="text-sm text-ink-700">
                  Desired Shoot Type
                </label>
                <select
                  id="booking-shoot"
                  required
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select Session Type
                  </option>
                  {PACKAGE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="booking-date" className="text-sm text-ink-700">
                  Approximate Session Date / Due Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="booking-notes" className="text-sm text-ink-700">
                  Special Notes (e.g. details, themes, locations)
                </label>
                <textarea
                  id="booking-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your baby's due date, preferred props, or ECR beach locations..."
                  className={inputClass}
                />
              </div>

              {error && <p className="text-sm text-danger-500">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-ink-900 px-4 py-3.5 text-sm font-medium text-paper-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-ink-700 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
              >
                {pending ? "Sending…" : "Send Booking Request"}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
