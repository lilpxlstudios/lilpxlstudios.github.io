import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const title = "Little Pixel Studios | Premium Maternity & Baby Photography Chennai";
const description =
  "Little Pixel Studios in Chennai offers professional maternity, newborn baby, and family photography. Capture warm golden-hour beach photos in ECR and cozy indoor portraits.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | Little Pixel Studios",
  },
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Little Pixel Studios",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper-50 text-ink-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
