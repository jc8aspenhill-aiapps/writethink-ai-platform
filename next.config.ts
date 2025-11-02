import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Cloudflare Pages if needed
  // output: 'export',
  // trailingSlash: true,
  
  // For server-side functionality with API routes, keep as default
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk']
  }
};

export default nextConfig;
