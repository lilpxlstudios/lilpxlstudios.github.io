import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // pdfkit must stay external (not bundled/inlined) — it reads its standard-font
  // metrics (.afm files) from disk at runtime via `__dirname`, and once Next
  // inlines its code into an SSR chunk that path stops resolving to anything
  // real, since the file tracer can no longer see pdfkit as a package with its
  // own directory to copy alongside. Without this, PDF generation (tax
  // invoices, order invoices) 500s in production with ENOENT on
  // pdfkit/js/data/Helvetica.afm. Same reasoning as `sharp` below.
  serverExternalPackages: ["sharp", "pdfkit"],
};

// withBotId adds the proxy rewrites BotID needs to verify /api/inquiries.
export default withBotId(nextConfig);
