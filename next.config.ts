import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) does dynamic file reads for its worker/font
  // data that break when Next.js bundles it for Server Actions/Route Handlers.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
