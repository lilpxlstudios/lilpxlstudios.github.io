"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const REVIEWS = [
  {
    name: "Karthi Keyini",
    meta: "Maternity Shoot • Google Review",
    text: "Don't know where to start, the entire experience working with them was wonderful! The best decision we made was choosing them for our maternity shoot. One can't find people who are such passionate and involved in what they do. Wonderful priceless captures and edits by them. Huge shoutout for their patience, timely captures, friendly approach, listening, accepting and delivering what we exactly have in mind.",
  },
  {
    name: "Bharani Deepan K.",
    meta: "Maternity Session • Google Review",
    text: "We recently had a maternity photoshoot with the team from Little Pixel, and it was an absolutely wonderful experience! The photographers were highly professional yet incredibly friendly, which made the entire session so comfortable and enjoyable. They helped with my wife's makeup, and the result was so natural—we absolutely loved it. It was an extended session because they were committed to ensuring the best possible outcome.",
  },
  {
    name: "Reena Bhargavi",
    meta: "Maternity & Styling • Google Review",
    text: "I am writing this review with immense satisfaction after my maternity photoshoot with the Little Pixel team. They are incredibly passionate about their work and put in tremendous effort to create truly magical and memorable photographs. They took care of everything—from conceptualizing the shoot to selecting the dress, jewelry, makeup, and styling. Throughout the session, they ensured we were comfortable, even extending the shoot time.",
  },
  {
    name: "Hannah Serin",
    meta: "Family Shoot • Google Review",
    text: "We had a wonderful experience with Littlepixel Studios! I randomly came across their page on Instagram for a mini Christmas photoshoot, and I'm so glad we chose them. Their studio setup was absolutely amazing – so aesthetic and exactly what we were hoping for! They made us feel comfortable throughout the shoot, and they captured every moment beautifully.",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const review = REVIEWS[index]!;

  function go(delta: number) {
    setIndex((i) => (i + delta + REVIEWS.length) % REVIEWS.length);
  }

  return (
    <section id="testimonials" className="bg-paper-100">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
            Reviews
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink-900 sm:text-5xl">
            Loved by Chennai Parents
          </h2>
          <div className="h-0.5 w-12 bg-accent-500" />
          <p className="max-w-lg text-ink-500">
            Real experiences shared by mothers and fathers who trusted Little Pixel Studios.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mt-10 rounded-2xl bg-paper-50 p-8 text-center shadow-md ring-1 ring-ink-900/5 sm:p-12">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 select-none font-[family-name:var(--font-display)] text-7xl text-accent-400/30"
            >
              &ldquo;
            </span>
            <div className="flex justify-center gap-1 text-accent-500" aria-hidden>
              {"★★★★★"}
            </div>
            <p className="mt-5 text-lg leading-relaxed text-ink-700">{review.text}</p>
            <div className="mt-6">
              <h4 className="font-medium text-ink-900">{review.name}</h4>
              <span className="text-sm text-ink-500">{review.meta}</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            aria-label="Previous review"
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-700 transition hover:border-accent-500 hover:text-accent-600"
          >
            ←
          </button>
          <div className="flex gap-2">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                aria-label={`Show review ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent-500" : "w-1.5 bg-ink-100"
                }`}
              />
            ))}
          </div>
          <button
            aria-label="Next review"
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-700 transition hover:border-accent-500 hover:text-accent-600"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
