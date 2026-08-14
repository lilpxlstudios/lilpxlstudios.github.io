import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  // pdfkit reads its standard-font metrics (.afm files) from disk at runtime;
  // Next's output tracing doesn't pick them up automatically since they're
  // loaded via a dynamic path, not a static import — without this, PDF
  // generation (tax invoices, order invoices) 500s in production with
  // ENOENT on pdfkit/js/data/Helvetica.afm.
  outputFileTracingIncludes: {
    "/admin/**": ["./node_modules/pdfkit/js/data/**/*"],
  },
};

export default nextConfig;
