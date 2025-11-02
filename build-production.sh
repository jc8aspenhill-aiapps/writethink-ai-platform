#!/bin/bash

# WriteThink AI - Production Build Script for Cloudflare Pages

echo "🚀 Building WriteThink AI for production deployment..."

# Temporarily move API routes to avoid conflicts with static export
if [ -d "src/app/api" ]; then
    echo "📦 Temporarily moving API routes..."
    mv src/app/api src/app/api.bak
fi

# Build for production with static export
echo "🏗️ Building static export..."
NODE_ENV=production npm run build

# Restore API routes for local development
if [ -d "src/app/api.bak" ]; then
    echo "🔄 Restoring API routes..."
    mv src/app/api.bak src/app/api
fi

echo "✅ Production build complete!"
echo "📁 Static files are in the 'out' directory"
echo "🔧 Cloudflare Functions are in the 'functions' directory"