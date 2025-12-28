#!/bin/bash

# IAP Fix - Rebuild iOS App
# Run this after making code changes

echo "🔧 Rebuilding iOS app with IAP fixes..."
echo ""

# Sync Capacitor
echo "1️⃣  Syncing Capacitor..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

echo "✅ Capacitor synced"
echo ""

# Open Xcode
echo "2️⃣  Opening Xcode..."
npx cap open ios

echo ""
echo "📋 Next steps in Xcode:"
echo "  1. Select 'App' target"
echo "  2. Go to 'Signing & Capabilities'"
echo "  3. Click '+ Capability'"
echo "  4. Add 'In-App Purchase'"
echo "  5. Select a real device (not simulator)"
echo "  6. Click Run (Cmd+R)"
echo ""
echo "📱 Testing:"
echo "  - Navigate to billing page"
echo "  - Check console for: 'Available IAP products: [...]'"
echo "  - Try to subscribe"
echo ""
echo "⚠️  Remember:"
echo "  - IAP only works on real devices"
echo "  - Products must be created in App Store Connect"
echo "  - Use sandbox tester account"
echo ""
