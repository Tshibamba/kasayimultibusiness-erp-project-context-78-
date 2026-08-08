import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit charge ses métriques de polices (.afm) via fs au runtime
  serverExternalPackages: ["pdfkit"],
  // Build standalone pour Docker / VPS
  output: "standalone",
};

export default nextConfig;
