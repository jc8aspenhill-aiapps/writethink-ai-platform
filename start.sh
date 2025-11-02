#!/bin/bash

# WriteThink AI - Development Startup Script

echo "🚀 Starting WriteThink AI Platform..."

# Check if .env.local exists and has API key
if [ ! -f ".env.local" ] || ! grep -q "CLAUDE_API_KEY=" .env.local || grep -q "your_claude_api_key_here" .env.local; then
    echo "⚠️  API Key Setup Required!"
    echo "Please add your Claude API key to .env.local:"
    echo "CLAUDE_API_KEY=your_actual_api_key_here"
    echo ""
    echo "Get your API key from: https://console.anthropic.com/"
    echo ""
    read -p "Press enter to continue anyway (app will show errors without valid API key)..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting development server..."
echo "App will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev