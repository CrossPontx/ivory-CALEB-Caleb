#!/bin/bash

echo "🏗️  Building Next.js App for iOS"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Build Next.js with static export
echo "📦 Building Next.js app..."
yarn build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "This is likely due to API routes being evaluated at build time."
    echo "For iOS, we need a static export."
    echo ""
    echo "Options:"
    echo "1. Use the test page (already working with IAP)"
    echo "2. Fix environment variable issues in API routes"
    echo "3. Create a minimal build without problematic routes"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Sync to iOS
echo "📱 Syncing to iOS..."
yarn cap:sync

echo ""
echo "⚠️  IMPORTANT: After sync, you must:"
echo "1. Check ios/App/App/capacitor.config.json"
echo "2. Remove 'server' section if it was added back"
echo "3. Verify 'IAPPlugin' is in packageClassList"
echo ""
echo "Then in Xcode:"
echo "- Clean (Shift+Cmd+K)"
echo "- Build (Cmd+B)"
echo "- Run (Cmd+R)"
echo ""
