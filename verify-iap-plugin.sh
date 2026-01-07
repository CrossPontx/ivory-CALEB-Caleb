#!/bin/bash

echo "🔍 Verifying IAP Plugin Setup..."
echo ""

# Check if IAPPlugin.swift exists
if [ -f "ios/App/App/IAPPlugin.swift" ]; then
    echo "✅ IAPPlugin.swift exists"
else
    echo "❌ IAPPlugin.swift NOT FOUND"
    exit 1
fi

# Check for @objc annotation
if grep -q "@objc(IAPPlugin)" ios/App/App/IAPPlugin.swift; then
    echo "✅ @objc(IAPPlugin) annotation found"
else
    echo "❌ @objc(IAPPlugin) annotation missing"
fi

# Check for CAPBridgedPlugin protocol
if grep -q "CAPBridgedPlugin" ios/App/App/IAPPlugin.swift; then
    echo "✅ CAPBridgedPlugin protocol implemented"
else
    echo "❌ CAPBridgedPlugin protocol missing"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Open ios/App/App.xcworkspace in Xcode"
echo "2. Select the App target"
echo "3. Go to Build Phases > Compile Sources"
echo "4. Verify IAPPlugin.swift is in the list"
echo "5. If not, click + and add it"
echo "6. Clean Build Folder (Cmd+Shift+K)"
echo "7. Build and Run"
echo ""
echo "🔍 To check if plugin is loaded, look for these logs:"
echo "   - '🟢 IAPPlugin: load() called'"
echo "   - '✅ IAPPlugin: Device CAN make payments'"
