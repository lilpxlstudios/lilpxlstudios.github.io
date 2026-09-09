"use client";

import { useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { whatsappLink } from "./siteConfig";
import { Reveal } from "./Reveal";

type PackageKey = "western" | "traditional" | "outdoor" | "familyBaby";

type FixedPackage = {
  key: PackageKey;
  label: string;
  tileNote: string;
  kind: "fixed";
  price: number;
  inclusions: string[];
};

type CustomPackage = {
  key: PackageKey;
  label: string;
  tileNote: string;
  kind: "custom";
  startingPrice: number;
};

const PACKAGES: (FixedPackage | CustomPackage)[] = [
  {
    key: "western",
    label: "Western",
    tileNote: "₹16,000",
    kind: "fixed",
    price: 16000,
    inclusions: [
      "2 Western looks",
      "20 Fine-art edited soft copies",
      "Private online viewing gallery",
      "Cozy studio setting",
    ],
  },
  {
    key: "traditional",
    label: "Traditional",
    tileNote: "₹21,000",
    kind: "fixed",
    price: 21000,
    inclusions: [
      "1 Western look + 1 Saree look",
      "20 Fine-art edited soft copies",
      "Private online viewing gallery",
      "Cozy studio setting",
    ],
  },
  {
    key: "outdoor",
    label: "Outdoor",
    tileNote: "From ₹25,000",
    kind: "custom",
    startingPrice: 25000,
  },
  {
    key: "familyBaby",
    label: "Family & Baby",
    tileNote: "From ₹18,000",
    kind: "custom",
    startingPrice: 18000,
  },
];

const ADDONS = [
  { key: "makeup", label: "Professional Makeup & Hair Artist", price: 2500 },
  { key: "gowns", label: "Luxury Gown / Outfit Access", price: 1500 },
  { key: "album", label: "Physical Premium Matte Photo Album (20 Pages)", price: 5000 },
] as const;

export function PricingCalculator() {
  const [packageKey, setPackageKey] = useState<PackageKey>("western");
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  function selectPackage(key: PackageKey) {
    setPackageKey(key);
    setAddons({});
    track("Pricing Package Selected", { package: key });
  }

  function toggleAddon(key: string) {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const selected = PACKAGES.find((p) => p.key === packageKey)!;

  const { totalPrice, inclusions } = useMemo(() => {
    if (selected.kind === "custom") {
      return { totalPrice: selected.startingPrice, inclusions: ["Fully customized to your requirements"] };
    }
    const addonsPrice = ADDONS.reduce((sum, a) => (addons[a.key] ? sum + a.price : sum), 0);
    const inclusions = [...selected.inclusions];
    if (addons.makeup) inclusions.push("Professional makeup artist session");
    if (addons.gowns) inclusions.push("Premium gown & outfit access");
    if (addons.album) inclusions.push("Physical premium photo album (20 pages)");
    return { totalPrice: selected.price + addonsPrice, inclusions };
  }, [selected, addons]);

  const whatsappHref = whatsappLink(
    selected.kind === "custom"
      ? `Hi Little Pixel Studios! I'm interested in the ${selected.label} package (starting from ₹${totalPrice.toLocaleString(
          "en-IN"
        )}) and would like a custom quote.`
      : `Hi Little Pixel Studios! I built a custom package on your website:
- Package: ${selected.label}
- Professional Makeup: ${addons.makeup ? "Yes" : "No"}
- Outfit Gowns Rental: ${addons.gowns ? "Yes" : "No"}
- Matte Photo Album: ${addons.album ? "Yes" : "No"}
- Estimated Price: ₹${totalPrice.toLocaleString("en-IN")}

I would like to discuss slots availability!`
  );

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
          Packages
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink-900 sm:text-5xl">
          Interactive Package Customizer
        </h2>
        <div className="h-0.5 w-12 bg-accent-500" />
        <p className="max-w-lg text-ink-500">
          Select your preferences below to build a customized photography package with
          transparent pricing instantly.
        </p>
      </Reveal>

      <Reveal delay={150} className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-paper-50 p-6 shadow-sm sm:p-8">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-ink-900">
            Configure Your Package
          </h3>
          <div className="mt-2 mb-6 h-px w-10 bg-accent-500" />

          <div className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-medium text-ink-700">1. Select Package</label>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.key}
                    type="button"
                    onClick={() => selectPackage(pkg.key)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-4 text-center transition-all ${
                      packageKey === pkg.key
                        ? "border-accent-500 bg-accent-400/10 shadow-sm ring-1 ring-accent-500/30"
                        : "border-ink-100 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-sm font-medium text-ink-900">{pkg.label}</span>
                    <span className="text-xs text-ink-500">{pkg.tileNote}</span>
                  </button>
                ))}
              </div>
            </div>

            {selected.kind === "custom" ? (
              <p className="text-sm text-ink-500">
                This is a fully customized package — message us on WhatsApp with your
                requirements and we&apos;ll put together an exact quote.
              </p>
            ) : (
              <div>
                <label className="text-sm font-medium text-ink-700">
                  2. Add Premium Customizations
                </label>
                <div className="mt-3 flex flex-col gap-2">
                  {ADDONS.map((addon) => (
                    <label
                      key={addon.key}
                      className="flex items-center justify-between gap-3 rounded-md border border-ink-100 px-3 py-2.5 text-sm transition hover:border-ink-300"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!addons[addon.key]}
                          onChange={() => toggleAddon(addon.key)}
                          className="accent-accent-500"
                        />
                        {addon.label}
                      </span>
                      <span className="whitespace-nowrap text-ink-500">
                        + ₹{addon.price.toLocaleString("en-IN")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-ink-900 p-6 text-paper-50 shadow-lg sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl"
          />
          <span className="text-sm text-ink-300">Your Custom Estimate</span>
          <span className="font-[family-name:var(--font-display)] text-xl text-accent-400">
            {selected.label}
          </span>

          <div className="mt-6 flex items-baseline gap-1">
            {selected.kind === "custom" && <span className="text-sm text-ink-300">From</span>}
            <span className="text-2xl text-accent-400">₹</span>
            <span className="font-[family-name:var(--font-display)] text-5xl">
              {totalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-6">
            <h4 className="text-sm text-ink-300">Includes:</h4>
            <ul className="mt-2 flex flex-col gap-2 text-sm">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-accent-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-8 flex flex-col gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener"
              onClick={() => track("Pricing WhatsApp CTA Clicked", { package: packageKey })}
              className="rounded-md bg-accent-500 px-4 py-3.5 text-center text-sm font-medium text-ink-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-md"
            >
              {selected.kind === "custom" ? "Enquire About This Package" : "Book This Custom Package"}
            </a>
            <p className="text-xs text-ink-300">
              *Final pricing may vary slightly based on scheduling and location entry fees.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
