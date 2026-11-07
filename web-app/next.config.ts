import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev-only Next.js indicator away from the sidebar account menu (bottom-left).
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
