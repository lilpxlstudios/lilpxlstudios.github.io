"use client";

import { useState } from "react";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "./siteConfig";

const NAV_LINKS = [
  { href: "/#portfolio", label: "Portfolio" },
  { href: "/#pricing", label: "Packages" },
  { href: "/#testimonials", label: "Reviews" },
  { href: "/#contact", label: "Contact Us" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg text-ink-900">
          Little Pixel <span className="text-accent-600">Studios</span>
        </Link>

        <nav className="hidden gap-6 text-sm text-ink-700 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-accent-600">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="transition hover:text-accent-600">
            Client login
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              "Hi this is I would like to book a slot for photoshoot"
            )}`}
            target="_blank"
            rel="noopener"
            className="hidden rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-paper-50 transition hover:bg-ink-700 sm:inline-flex"
          >
            Book Slot
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md border border-ink-100 md:hidden"
          >
            <span className="h-0.5 w-5 bg-ink-900" />
            <span className="h-0.5 w-5 bg-ink-900" />
            <span className="h-0.5 w-5 bg-ink-900" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-100 bg-paper-50 px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-ink-700"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="py-2 text-sm text-ink-700">
            Client login
          </Link>
        </nav>
      )}
    </header>
  );
}
