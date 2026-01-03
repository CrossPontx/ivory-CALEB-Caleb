#!/bin/bash

echo "🧪 IAP Fix Test Script"
echo "====================="
echo ""

# Check if capacitor config has server URL
echo "1️⃣ Checking iOS Capacitor config..."
if grep -q '"url"' ios/App/App/capacitor.config.json; then
    echo "❌ ERROR: Server URL still present in ios/App/App/capacitor.config.json"
    echo "   This will cause the app to load from Vercel instead of local bundle"
    exit 1
else
    echo "✅ No server URL in iOS config - app will load from local bundle"
fi

echo ""
echo "2️⃣ Checking if out directory has content..."
if [ ! -f "out/index.html" ]; then
    echo "❌ ERROR: out/index.html not found"
    exit 1
else
    echo "✅ out/index.html exists"
fi

echo ""
echo "3️⃣ Checking if IAPPlugin.swift exists..."
if [ ! -f "ios/App/App/IAPPlugin.swift" ]; then
    echo "❌ ERROR: IAPPlugin.swift not found"
    exit 1
else
    echo "✅ IAPPlugin.swift exists"
fi

echo ""
echo "4️⃣ Checking if IAPPlugin is in Xcode project..."
if grep -q "IAPPlugin.swift" ios/App/App.xcodeproj/project.pbxproj; then
    echo "✅ IAPPlugin.swift is in Xcode project"
else
    echo "❌ ERROR: IAPPlugin.swift not in Xcode project"
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Xcode: yarn cap:open:ios"
echo "2. Clean Build Folder: Shift+Cmd+K"
echo "3. Build: Cmd+B"
echo "4. Run on device: Cmd+R"
echo ""
echo "🔍 What to look for in Xcode console:"
echo "   ✅ GOOD: '⚡️ Loading app at capacitor://localhost'"
echo "   ✅ GOOD: '🟢 IAPPlugin: load() called'"
echo "   ❌ BAD:  '⚡️ Loading app at https://ivory-blond.vercel.app'"
echo ""
