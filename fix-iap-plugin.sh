#!/bin/bash

# Fix IAP Plugin Registration
# This script helps diagnose and provides instructions to fix the UNIMPLEMENTED error

echo "🔍 IAP Plugin Registration Diagnostic"
echo "======================================"
echo ""

# Check if IAPPlugin.swift exists
if [ -f "ios/App/App/IAPPlugin.swift" ]; then
    echo "✅ IAPPlugin.swift file exists"
else
    echo "❌ IAPPlugin.swift file NOT found"
    echo "   Expected location: ios/App/App/IAPPlugin.swift"
    exit 1
fi

# Check if it's in the Xcode project
if grep -q "IAPPlugin" ios/App/App.xcodeproj/project.pbxproj; then
    echo "✅ IAPPlugin.swift is in Xcode project"
else
    echo "❌ IAPPlugin.swift is NOT in Xcode project"
    echo ""
    echo "🔧 FIX REQUIRED:"
    echo "   The plugin file exists but is not added to the Xcode project."
    echo "   This is why you're getting the UNIMPLEMENTED error."
    echo ""
    echo "📋 Steps to fix:"
    echo "   1. Open Xcode:"
    echo "      cd ios/App && open App.xcworkspace"
    echo ""
    echo "   2. In Xcode Project Navigator:"
    echo "      - Right-click on 'App' folder (blue icon)"
    echo "      - Select 'Add Files to \"App\"...'"
    echo "      - Navigate to: ios/App/App/IAPPlugin.swift"
    echo "      - UNCHECK 'Copy items if needed'"
    echo "      - CHECK 'Add to targets: App'"
    echo "      - Click 'Add'"
    echo ""
    echo "   3. Add StoreKit framework:"
    echo "      - Click on blue 'App' project icon"
    echo "      - Select 'App' target"
    echo "      - Go to 'Frameworks, Libraries, and Embedded Content'"
    echo "      - Click '+' button"
    echo "      - Search for 'StoreKit'"
    echo "      - Add 'StoreKit.framework'"
    echo ""
    echo "   4. Clean and rebuild:"
    echo "      - Product → Clean Build Folder (Shift+Cmd+K)"
    echo "      - Product → Build (Cmd+B)"
    echo ""
    echo "   5. Run on device and check console for:"
    echo "      🟢 IAPPlugin: load() called"
    echo "      ✅ IAPPlugin: Device CAN make payments"
    echo ""
    echo "📖 Full instructions: APPLE_GUIDELINE_2_1_PLUGIN_REGISTRATION_FIX.md"
    exit 1
fi

# Check if StoreKit is linked
if grep -q "StoreKit.framework" ios/App/App.xcodeproj/project.pbxproj; then
    echo "✅ StoreKit framework is linked"
else
    echo "⚠️  StoreKit framework may not be linked"
    echo "   Add it in Xcode: Target → Frameworks, Libraries, and Embedded Content"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "If you're still getting UNIMPLEMENTED error:"
echo "1. Clean build folder in Xcode (Shift+Cmd+K)"
echo "2. Delete derived data: rm -rf ~/Library/Developer/Xcode/DerivedData/App-*"
echo "3. Rebuild and run on device"
echo "4. Check console logs for plugin initialization"
