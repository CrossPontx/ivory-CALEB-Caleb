#!/bin/bash

echo "🔧 Fixing IAP Plugin Registration"
echo "=================================="
echo ""

# Step 1: Remove the duplicate file
echo "Step 1: Removing 'IAPPlugin 2.swift'..."
if [ -f "ios/App/App/IAPPlugin 2.swift" ]; then
    rm "ios/App/App/IAPPlugin 2.swift"
    echo "✅ Removed 'IAPPlugin 2.swift'"
else
    echo "ℹ️  'IAPPlugin 2.swift' not found"
fi

# Step 2: Verify original exists
echo ""
echo "Step 2: Checking for 'IAPPlugin.swift'..."
if [ -f "ios/App/App/IAPPlugin.swift" ]; then
    echo "✅ 'IAPPlugin.swift' exists"
else
    echo "❌ 'IAPPlugin.swift' NOT found!"
    echo "   The original file is missing. You'll need to recreate it."
    exit 1
fi

# Step 3: Clean Xcode project file
echo ""
echo "Step 3: Cleaning Xcode project references..."
# Remove references to "IAPPlugin 2" from project file
if grep -q "IAPPlugin 2" ios/App/App.xcodeproj/project.pbxproj; then
    # Backup first
    cp ios/App/App.xcodeproj/project.pbxproj ios/App/App.xcodeproj/project.pbxproj.backup
    
    # Remove lines containing "IAPPlugin 2"
    sed -i '' '/IAPPlugin 2/d' ios/App/App.xcodeproj/project.pbxproj
    
    echo "✅ Removed 'IAPPlugin 2' references from Xcode project"
else
    echo "ℹ️  No 'IAPPlugin 2' references found in project"
fi

# Step 4: Clean derived data
echo ""
echo "Step 4: Cleaning derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
echo "✅ Derived data cleaned"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode: open ios/App/App.xcodeproj"
echo "2. In Project Navigator, verify 'IAPPlugin.swift' is there (no '2')"
echo "3. If NOT there:"
echo "   - Right-click 'App' folder"
echo "   - 'Add Files to App...'"
echo "   - Select 'IAPPlugin.swift'"
echo "   - UNCHECK 'Copy items'"
echo "   - CHECK 'Add to targets: App'"
echo "4. Clean: Shift+Cmd+K"
echo "5. Build: Cmd+B"
echo "6. Run: Cmd+R"
echo ""
echo "Expected console output:"
echo "  🟢 IAPPlugin: load() called"
echo "  ✅ IAP initialized with 4 products"
