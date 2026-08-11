"use client";

import { useMemo, useState } from "react";
import { whatsappLink } from "./siteConfig";

type Location = "studio" | "outdoor" | "both";

const MATERNITY_BASE_PRICE = 14000;
const PACKAGE_LABEL = "Maternity Session";

const LOCATIONS: { value: Location; label: string; price: number }[] = [
  { value: "studio", label: "Cozy Indoor Studio (Palavakkam)", price: 0 },
  { value: "outdoor", label: "ECR Beach Outdoor (+ ₹2,000)", price: 2000 },
  { value: "both", label: "Both Studio & Beach (+ ₹3,500)", price: 3500 },
];

const ADDONS = [
  { key: "makeup", label: "Professional Makeup & Hair Artist", price: 2500 },
  { key: "gowns", label: "Luxury Gown / Outfit Access", price: 1500 },
  { key: "album", label: "Physical Premium Matte Photo Album (20 Pages)", price: 3000 },
] as const;

const BASE_INCLUSIONS = [
  "2 curated looks / outfit changes",
  "20 Fine-art edited soft copies",
  "Private online viewing gallery",
  "Cozy studio setting",
];

export function PricingCalculator() {
  const [location, setLocation] = useState<Location>("studio");
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  function toggleAddon(key: string) {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const { totalPrice, inclusions } = useMemo(() => {
    const locationPrice = LOCATIONS.find((l) => l.value === location)!.price;
    const addonsPrice = ADDONS.reduce((sum, a) => (addons[a.key] ? sum + a.price : sum), 0);

    const inclusions = [...BASE_INCLUSIONS];
    if (location === "outdoor") inclusions.push("ECR Golden Hour beach location");
    if (location === "both") inclusions.push("Both studio & beach locations included");
    if (addons.makeup) inclusions.push("Professional makeup artist session");
    if (addons.gowns) inclusions.push("Premium gown & outfit access");
    if (addons.album) inclusions.push("Physical premium photo album (20 pages)");

    return { totalPrice: MATERNITY_BASE_PRICE + locationPrice + addonsPrice, inclusions };
  }, [location, addons]);

  const whatsappHref = whatsappLink(
    `Hi Little Pixel Studios! I built a custom package on your website:
- Package: ${PACKAGE_LABEL}
- Location: ${location.toUpperCase()}
- Professional Makeup: ${addons.makeup ? "Yes" : "No"}
- Outfit Gowns Rental: ${addons.gowns ? "Yes" : "No"}
- Matte Photo Album: ${addons.album ? "Yes" : "No"}
- Estimated Price: ₹${totalPrice.toLocaleString("en-IN")}

I would like to discuss slots availability!`
  );

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-ink-900 sm:text-4xl">
          Interactive Package Customizer
        </h2>
        <div className="h-0.5 w-12 bg-accent-500" />
        <p className="max-w-lg text-ink-500">
          Select your preferences below to build a customized photography package with
          transparent pricing instantly.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-paper-50 p-6 shadow-sm sm:p-8">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-ink-900">
            Configure Your Package
          </h3>
          <div className="mt-2 mb-6 h-px w-10 bg-accent-500" />

          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-accent-500 bg-accent-400/10 px-4 py-4">
              <span className="text-sm font-medium text-ink-900">{PACKAGE_LABEL}</span>
              <span className="ml-2 text-xs text-ink-500">
                Starts from ₹{MATERNITY_BASE_PRICE.toLocaleString("en-IN")} for two looks
              </span>
            </div>

            <div>
              <label htmlFor="pricing-location" className="text-sm font-medium text-ink-700">
                1. Select Location Preference
              </label>
              <select
                id="pricing-location"
                value={location}
                onChange={(e) => setLocation(e.target.value as Location)}
                className="mt-3 w-full rounded-md border border-ink-100 px-3 py-2 text-sm"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">
                2. Add Premium Customizations
              </label>
              <div className="mt-3 flex flex-col gap-2">
                {ADDONS.map((addon) => (
                  <label
                    key={addon.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-ink-100 px-3 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!addons[addon.key]}
                        onChange={() => toggleAddon(addon.key)}
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
          </div>
        </div>

        <div className="flex flex-col rounded-2xl bg-ink-900 p-6 text-paper-50 shadow-lg sm:p-8">
          <span className="text-sm text-ink-300">Your Custom Estimate</span>
          <span className="font-[family-name:var(--font-display)] text-lg text-accent-400">
            {PACKAGE_LABEL}
          </span>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-2xl text-accent-400">₹</span>
            <span className="font-[family-name:var(--font-display)] text-4xl">
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

          <div className="mt-8 flex flex-col gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener"
              className="rounded-md bg-accent-500 px-4 py-3 text-center text-sm font-medium text-ink-950 transition hover:bg-accent-400"
            >
              Book This Custom Package
            </a>
            <p className="text-xs text-ink-300">
              *Final pricing may vary slightly based on scheduling and location entry fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
