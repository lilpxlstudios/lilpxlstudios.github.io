import Link from "next/link";
import { NewsletterSignup } from "./NewsletterSignup";
import { MarketingHeader } from "./MarketingHeader";
import { StructuredData } from "./StructuredData";
import { studioContact } from "./siteConfig";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <footer className="relative bg-ink-900 text-paper-100">
        <div
          aria-hidden
          className="h-px w-full bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-paper-50">
              Little Pixel <span className="text-accent-400">Studios</span>
            </span>
            <p className="text-sm leading-relaxed text-ink-300">
              Timeless fine-art maternity and newborn photography services in Chennai. Capturing
              the start of your child&apos;s legacy.
            </p>
            <div className="flex gap-4 text-sm">
              <a href={studioContact.instagramUrl} target="_blank" rel="noopener" className="transition hover:text-accent-400">
                Instagram
              </a>
              <a
                href={`https://wa.me/${studioContact.phoneHref.replace("tel:+", "")}`}
                target="_blank"
                rel="noopener"
                className="transition hover:text-accent-400"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-paper-50">
              Quick Links
            </h4>
            <Link href="/#portfolio" className="text-ink-300 transition hover:text-accent-400">
              Portfolios
            </Link>
            <Link href="/#pricing" className="text-ink-300 transition hover:text-accent-400">
              Packages
            </Link>
            <Link href="/#contact" className="text-ink-300 transition hover:text-accent-400">
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-paper-50">
              Stay In The Loop
            </h4>
            <NewsletterSignup />
          </div>
        </div>
        <div className="border-t border-ink-700 px-6 py-5 text-center text-xs text-ink-300">
          © {new Date().getFullYear()} Little Pixel Studios. All Rights Reserved. Palavakkam,
          Chennai.
        </div>
      </footer>
    </>
  );
}
