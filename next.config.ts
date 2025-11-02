import type { NextConfig } from "next";

// Dual setup for development and production:
// - Development: Uses Next.js API routes at /api/claude/ (requires trailing slash)
// - Production: Uses Cloudflare Functions at /functions/api/claude.js (static export)
const nextConfig: NextConfig = {
  // Static export configuration for Cloudflare Pages
  output: 'export',
  trailingSlash: true, // Required for Cloudflare compatibility
  images: {
    unoptimized: true // Required for static export
  }
};

export default nextConfig;
