"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "./Reveal";

type Category = "all" | "western" | "traditional" | "outdoor";

const TABS: { value: Category; label: string }[] = [
  { value: "all", label: "All Portfolios" },
  { value: "western", label: "Western" },
  { value: "traditional", label: "Traditional" },
  { value: "outdoor", label: "Outdoor" },
];

const CATEGORY_LABEL: Record<Exclude<Category, "all">, string> = {
  western: "Western",
  traditional: "Traditional",
  outdoor: "Outdoor",
};

const ITEMS: { src: string; alt: string; category: Exclude<Category, "all">; title: string }[] = [
  {
    src: "/images/portfolio/western/western-01.jpg",
    alt: "Maternity portrait with dramatic flowing purple tulle wings, fine-art studio lighting",
    category: "western",
    title: "Butterfly Wings Editorial",
  },
  {
    src: "/images/portfolio/western/western-02.jpg",
    alt: "Maternity portrait in a lavender gown with tulle swept mid-air, studio",
    category: "western",
    title: "Lavender Flight",
  },
  {
    src: "/images/portfolio/outdoor/outdoor-01.jpg",
    alt: "Mother and son sharing a golden-hour moment outdoors",
    category: "outdoor",
    title: "Golden Hour Bond",
  },
  {
    src: "/images/portfolio/traditional/traditional-01.jpg",
    alt: "Traditional maternity portrait of a couple, pink silk saree, soft curtains",
    category: "traditional",
    title: "Silk & Sunshine",
  },
  {
    src: "/images/portfolio/western/western-03.jpg",
    alt: "Overhead maternity portrait with flowers styled into flowing dark hair",
    category: "western",
    title: "Floral Crown Portrait",
  },
  {
    src: "/images/portfolio/outdoor/outdoor-02.jpg",
    alt: "Maternity portrait beside flowing white drapes at sunset",
    category: "outdoor",
    title: "Sunset Vows",
  },
  {
    src: "/images/portfolio/western/western-04.jpg",
    alt: "Wide fine-art maternity portrait with lavender tulle billowing outward",
    category: "western",
    title: "Ethereal Tulle",
  },
  {
    src: "/images/portfolio/traditional/traditional-02.jpg",
    alt: "Traditional maternity portrait in a green and pink silk saree, painterly backdrop",
    category: "traditional",
    title: "Heirloom Portrait",
  },
  {
    src: "/images/portfolio/outdoor/outdoor-03.jpg",
    alt: "Couple walking hand in hand along the beach at golden hour",
    category: "outdoor",
    title: "Seaside Stroll",
  },
  {
    src: "/images/portfolio/western/western-05.jpg",
    alt: "Maternity portrait in flowing emerald satin, moody studio light",
    category: "western",
    title: "Emerald Silk",
  },
  {
    src: "/images/portfolio/western/western-06.jpg",
    alt: "Maternity portrait in a black gown on a tufted leather sofa",
    category: "western",
    title: "Noir Elegance",
  },
  {
    src: "/images/portfolio/outdoor/outdoor-04.jpg",
    alt: "Couple reading a mock newspaper announcing their pregnancy in a meadow",
    category: "outdoor",
    title: "Meadow Announcement",
  },
  {
    src: "/images/portfolio/western/western-07.jpg",
    alt: "Couple portrait, maternity in red gown with partner in black suit",
    category: "western",
    title: "Scarlet & Black",
  },
  {
    src: "/images/portfolio/western/western-08.jpg",
    alt: "Couple portrait in dark, moody studio lighting",
    category: "western",
    title: "Midnight Romance",
  },
  {
    src: "/images/portfolio/western/western-09.jpg",
    alt: "Maternity portrait in a purple gown against a floral backdrop",
    category: "western",
    title: "Plum Blossom",
  },
  {
    src: "/images/portfolio/outdoor/outdoor-05.jpg",
    alt: "Close-up maternity detail with sonogram print and flowers",
    category: "outdoor",
    title: "Little Beginnings",
  },
  {
    src: "/images/portfolio/western/western-10.jpg",
    alt: "Maternity portrait in a lilac ballgown, all-white studio setting",
    category: "western",
    title: "Lilac Gown",
  },
  {
    src: "/images/portfolio/western/western-11.jpg",
    alt: "Couple portrait, maternity in a lilac ballgown seated together",
    category: "western",
    title: "Tender Embrace",
  },
  {
    src: "/images/portfolio/western/western-12.jpg",
    alt: "Maternity portrait in a black gown, joyful expression",
    category: "western",
    title: "Effortless Grace",
  },
  {
    src: "/images/portfolio/western/western-13.jpg",
    alt: "Maternity portrait draped in flowing crimson fabric",
    category: "western",
    title: "Crimson Drape",
  },
];

export function Portfolio() {
  const [category, setCategory] = useState<Category>("all");
  const visible = category === "all" ? ITEMS : ITEMS.filter((item) => item.category === category);

  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
          Portfolio
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink-900 sm:text-5xl">
          Our Portfolios
        </h2>
        <div className="h-0.5 w-12 bg-accent-500" />
        <p className="max-w-lg text-ink-500">
          Browse through our specialized portrait sessions tailored to capture each phase of your
          journey.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              category === tab.value
                ? "bg-ink-900 text-paper-50 shadow-sm"
                : "bg-paper-100 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <Reveal key={item.src} delay={(i % 3) * 100}>
            <div className="group relative aspect-square overflow-hidden rounded-xl shadow-sm ring-1 ring-ink-900/5">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/5 to-transparent p-4 text-white opacity-90 transition group-hover:opacity-100">
                <span className="text-xs uppercase tracking-[0.2em] text-accent-400">
                  {CATEGORY_LABEL[item.category]}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-lg">{item.title}</h3>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
