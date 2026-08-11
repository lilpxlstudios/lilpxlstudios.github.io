"use client";

import { useState } from "react";

type Category = "all" | "maternity" | "newborn" | "toddlers";

const TABS: { value: Category; label: string }[] = [
  { value: "all", label: "All Portfolios" },
  { value: "maternity", label: "Maternity" },
  { value: "newborn", label: "Newborns" },
  { value: "toddlers", label: "Toddlers & Family" },
];

const ITEMS: { src: string; alt: string; category: Exclude<Category, "all">; title: string; label: string }[] = [
  {
    src: "/images/portfolio/wix_port_1.jpg",
    alt: "Elegant maternity photography outdoor ECR beach Chennai",
    category: "maternity",
    label: "Maternity",
    title: "Outdoor Golden Hour",
  },
  {
    src: "/images/portfolio/wix_port_2.jpg",
    alt: "Aesthetic fine art newborn baby portrait photoshoot Chennai",
    category: "newborn",
    label: "Newborn",
    title: "Cozy Nest Prop Session",
  },
  {
    src: "/images/portfolio/wix_port_3.jpg",
    alt: "Traditional Indian Maternity Shoot in Chennai",
    category: "maternity",
    label: "Maternity",
    title: "Indoor Traditional Portraits",
  },
  {
    src: "/images/portfolio/wix_port_4.jpg",
    alt: "Kids Cake Smash Photoshoot in studio Chennai",
    category: "toddlers",
    label: "Toddlers",
    title: "1st Birthday Cake Smash",
  },
  {
    src: "/images/portfolio/wix_port_5.jpg",
    alt: "Family portrait photography outdoor",
    category: "toddlers",
    label: "Family",
    title: "Generational Portraits",
  },
  {
    src: "/images/portfolio/wix_port_6.jpg",
    alt: "Newborn baby swaddled photography",
    category: "newborn",
    label: "Newborn",
    title: "Pure White Swaddle Session",
  },
];

export function Portfolio() {
  const [category, setCategory] = useState<Category>("all");
  const visible = category === "all" ? ITEMS : ITEMS.filter((item) => item.category === category);

  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-ink-900 sm:text-4xl">
          Our Portfolios
        </h2>
        <div className="h-0.5 w-12 bg-accent-500" />
        <p className="max-w-lg text-ink-500">
          Browse through our specialized portrait sessions tailored to capture each phase of your
          journey.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              category === tab.value
                ? "bg-ink-900 text-paper-50"
                : "bg-paper-100 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <div key={item.src} className="group relative aspect-[3/4] overflow-hidden rounded-xl">
            <img
              src={item.src}
              alt={item.alt}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 text-white">
              <span className="text-xs uppercase tracking-wide text-accent-400">{item.label}</span>
              <h3 className="font-[family-name:var(--font-display)] text-lg">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
