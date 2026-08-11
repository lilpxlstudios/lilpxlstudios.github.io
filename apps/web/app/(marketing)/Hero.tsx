"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "./siteConfig";

const SLIDES = [
  {
    src: "/images/hero/maternity_hero.png",
    alt: "Aesthetic outdoor maternity shoot at ECR beach during sunset",
    caption: "Maternity Shoots • Outdoor Golden Hour",
  },
  {
    src: "/images/hero/newborn_hero.png",
    alt: "Cozy sleeping baby newborn photo in woven basket",
    caption: "Newborn Sessions • Warm & Cozy Studio",
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
    <section className="border-b border-ink-100 bg-paper-100">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-ink-900 sm:text-5xl">
            Preserving Your Family&apos;s Sweetest Milestones
          </h1>
          <p className="max-w-md text-ink-500">
            Fine-art maternity, newborn, and family portrait photography based in Palavakkam,
            Chennai. Capturing natural warmth, connection, and timeless emotions.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition hover:bg-ink-700"
            >
              Explore Packages
            </a>
            <a
              href={whatsappLink("Hi Little Pixel Studios, I'd like to book a shoot!")}
              target="_blank"
              rel="noopener"
              className="rounded-md bg-[#25d366] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#128c7e]"
            >
              WhatsApp Booking
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-8">
            {TRUST_METRICS.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="font-[family-name:var(--font-display)] text-2xl text-accent-600">
                  {metric.value}
                </span>
                <span className="text-xs text-ink-500">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg">
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === slide ? 1 : 0 }}
            >
              <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-sm text-white">
                {s.caption}
              </div>
            </div>
          ))}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-2 w-2 rounded-full transition ${i === slide ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
