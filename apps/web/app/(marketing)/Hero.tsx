"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { whatsappLink } from "./siteConfig";

const SLIDES = [
  {
    src: "/images/hero/hero-western.jpg",
    alt: "Fine-art maternity portrait in a flowing purple gown, studio lighting",
    caption: "Western Maternity • Fine-Art Studio",
  },
  {
    src: "/images/hero/hero-traditional.jpg",
    alt: "Traditional maternity portrait of a couple in saree and kurta",
    caption: "Traditional Maternity • Timeless Elegance",
  },
  {
    src: "/images/hero/hero-outdoor.jpg",
    alt: "Outdoor maternity portrait at golden hour with family",
    caption: "Outdoor Maternity • Golden Hour Sessions",
  },
];

const TRUST_METRICS = [
  { value: "500+", label: "Happy Families" },
  { value: "ECR", label: "Golden Hour Beach Shoots" },
];

export function Hero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-gradient-to-b from-paper-100 to-paper-50">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
            Chennai
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.08] tracking-tight text-ink-900 sm:text-6xl">
            Preserving Your Family&apos;s Sweetest Milestones
          </h1>
          <p className="max-w-md text-base text-ink-500 sm:text-lg">
            Fine-art maternity, newborn, and family portrait photography based in
            Chennai. Capturing natural warmth, connection, and timeless emotions.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="rounded-md bg-ink-900 px-7 py-3.5 text-sm font-medium text-paper-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-ink-700 hover:shadow-md"
            >
              Explore Packages
            </a>
            <a
              href={whatsappLink("Hi Little Pixel Studios, I'd like to book a shoot!")}
              target="_blank"
              rel="noopener"
              className="rounded-md bg-[#25d366] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1fb959] hover:shadow-md"
            >
              WhatsApp Booking
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-10">
            {TRUST_METRICS.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="font-[family-name:var(--font-display)] text-3xl text-accent-600">
                  {metric.value}
                </span>
                <span className="text-xs uppercase tracking-wide text-ink-500">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-ink-900/5">
          {SLIDES.map((s, i) => (
            <div
              key={s.caption}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === slide ? 1 : 0 }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 560px, 90vw"
                className="object-cover"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-sm text-white">
                {s.caption}
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.caption}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
