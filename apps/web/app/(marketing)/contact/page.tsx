import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 sm:py-28 max-w-lg mx-auto text-center">
      <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
        Contact
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink-900">
        Get in touch
      </h1>
      <div className="h-0.5 w-12 bg-accent-500" />
      <p className="text-ink-500 text-sm mb-4">
        Tell us about your shoot and we&apos;ll get back to you.
      </p>
      <ContactForm />
    </div>
  );
}
