import type { NextConfig } from "next";

// Dual setup for development and production:
// - Development: Uses Next.js API routes at /api/claude/ (requires trailing slash)
// - Production: Uses Cloudflare Functions at /functions/api/claude.js (static export)
const nextConfig: NextConfig = {
  // Enable static export for Cloudflare Pages (only in production)
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true, // Required for both Next.js API routes and Cloudflare compatibility
  images: {
    unoptimized: true // Required for static export
  }
};

export default nextConfig;
