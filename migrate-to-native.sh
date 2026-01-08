#!/bin/bash

# Native SwiftUI Migration Script
# This script helps migrate from Capacitor to native Swift/SwiftUI

set -e

echo "🚀 Starting Native SwiftUI Migration..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build Next.js app
echo -e "${BLUE}📦 Step 1: Building Next.js app...${NC}"
yarn build
echo -e "${GREEN}✅ Next.js build complete${NC}"
echo ""

# Step 2: Sync to iOS (if keeping Capacitor temporarily)
echo -e "${BLUE}📱 Step 2: Syncing to iOS...${NC}"
if command -v cap &> /dev/null; then
    npx cap sync ios
    echo -e "${GREEN}✅ iOS sync complete${NC}"
else
    echo -e "${YELLOW}⚠️  Capacitor CLI not found, skipping sync${NC}"
fi
echo ""

# Step 3: List new Swift files
echo -e "${BLUE}📝 Step 3: New Swift files created:${NC}"
echo ""
echo "Core Files:"
echo "  ✓ ios/App/App/IvoryApp.swift"
echo "  ✓ ios/App/App/ContentView.swift"
echo "  ✓ ios/App/App/WebView.swift"
echo "  ✓ ios/App/App/WebViewModel.swift"
echo ""
echo "Managers:"
echo "  ✓ ios/App/App/IAPManager.swift"
echo "  ✓ ios/App/App/WatchConnectivityManager.swift"
echo "  ✓ ios/App/App/CameraManager.swift"
echo "  ✓ ios/App/App/ShareManager.swift"
echo "  ✓ ios/App/App/HapticsManager.swift"
echo "  ✓ ios/App/App/DeviceInfoManager.swift"
echo ""
echo "TypeScript Bridge:"
echo "  ✓ lib/native-bridge.ts"
echo "  ✓ lib/iap.ts (updated)"
echo ""

# Step 4: Instructions
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Open Xcode:"
echo "   ${BLUE}open ios/App/App.xcodeproj${NC}"
echo ""
echo "2. In Xcode, add new Swift files to project:"
echo "   - Right-click 'App' folder → Add Files to 'App'"
echo "   - Select all new .swift files"
echo "   - Check 'Copy items if needed'"
echo "   - Ensure target is 'App'"
echo ""
echo "3. Update AppDelegate.swift:"
echo "   - Remove @UIApplicationMain"
echo "   - Change class to: class AppDelegate: NSObject, UIApplicationDelegate"
echo "   - Remove window property"
echo ""
echo "4. Clean and build:"
echo "   - Product → Clean Build Folder (Cmd+Shift+K)"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "5. Run on device/simulator:"
echo "   - Product → Run (Cmd+R)"
echo ""
echo -e "${GREEN}✨ Migration files ready!${NC}"
echo ""
echo "📖 See NATIVE_SWIFTUI_MIGRATION.md for detailed guide"
echo ""

# Optional: Open Xcode
read -p "Open Xcode now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open ios/App/App.xcodeproj
    echo -e "${GREEN}✅ Xcode opened${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Ready to migrate!${NC}"
