import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For server-side functionality with API routes
  serverExternalPackages: ['@anthropic-ai/sdk']
};

export default nextConfig;
