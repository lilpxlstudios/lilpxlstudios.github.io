import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Little Pixel Studios | Premium Maternity & Baby Photography Chennai",
    template: "%s | Little Pixel Studios",
  },
  description:
    "Little Pixel Studios in Chennai offers professional maternity, newborn baby, and family photography. Capture warm golden-hour beach photos in ECR and cozy indoor portraits.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper-50 text-ink-900">
        {children}
      </body>
    </html>
  );
}
