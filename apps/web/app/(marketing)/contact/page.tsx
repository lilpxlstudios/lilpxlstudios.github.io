import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-16 max-w-lg mx-auto text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Get in touch</h1>
      <p className="text-ink-500 text-sm">Tell us about your shoot and we&apos;ll get back to you.</p>
      <ContactForm />
    </div>
  );
}
