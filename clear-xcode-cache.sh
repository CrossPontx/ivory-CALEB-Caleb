#!/bin/bash

# Complete Xcode Cache Clear Script
# Fixes persistent threading warnings and build issues

echo "🧹 Starting complete Xcode cache clear..."
echo ""

# Step 1: Kill Xcode processes
echo "1️⃣ Killing Xcode processes..."
killall Xcode 2>/dev/null
killall Simulator 2>/dev/null
sleep 2
echo "✅ Xcode processes terminated"
echo ""

# Step 2: Delete derived data
echo "2️⃣ Deleting derived data..."
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
    rm -rf ~/Library/Developer/Xcode/DerivedData
    echo "✅ Derived data deleted"
else
    echo "⚠️  No derived data found"
fi
echo ""

# Step 3: Delete module cache
echo "3️⃣ Deleting module cache..."
if [ -d ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex ]; then
    rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex
    echo "✅ Module cache deleted"
else
    echo "⚠️  No module cache found"
fi
echo ""

# Step 4: Delete build folder
echo "4️⃣ Deleting build folder..."
if [ -d ~/Library/Developer/Xcode/Build ]; then
    rm -rf ~/Library/Developer/Xcode/Build
    echo "✅ Build folder deleted"
else
    echo "⚠️  No build folder found"
fi
echo ""

# Step 5: Delete Xcode caches
echo "5️⃣ Deleting Xcode caches..."
if [ -d ~/Library/Caches/com.apple.dt.Xcode ]; then
    rm -rf ~/Library/Caches/com.apple.dt.Xcode
    echo "✅ Xcode caches deleted"
else
    echo "⚠️  No Xcode caches found"
fi
echo ""

# Step 6: Clean project build artifacts
echo "6️⃣ Cleaning project build artifacts..."
cd "$(dirname "$0")/ios/App"

if [ -d build ]; then
    rm -rf build
    echo "✅ Project build folder deleted"
fi

if [ -d DerivedData ]; then
    rm -rf DerivedData
    echo "✅ Project derived data deleted"
fi

if [ -d .build ]; then
    rm -rf .build
    echo "✅ Swift build folder deleted"
fi

if [ -d .swiftpm ]; then
    rm -rf .swiftpm
    echo "✅ Swift PM folder deleted"
fi
echo ""

# Step 7: Delete Swift PM caches
echo "7️⃣ Deleting Swift Package Manager caches..."
if [ -d ~/Library/Caches/org.swift.swiftpm ]; then
    rm -rf ~/Library/Caches/org.swift.swiftpm
    echo "✅ Swift PM caches deleted"
else
    echo "⚠️  No Swift PM caches found"
fi
echo ""

# Step 8: Check for duplicate Swift files
echo "8️⃣ Checking for duplicate Swift files..."
cd "$(dirname "$0")"
DUPLICATES=$(find ios/App -maxdepth 1 -name "*.swift" 2>/dev/null)
if [ -n "$DUPLICATES" ]; then
    echo "⚠️  Found Swift files in wrong location:"
    echo "$DUPLICATES"
    echo ""
    echo "These should be in ios/App/App/ not ios/App/"
    echo "Delete them manually if they're duplicates"
else
    echo "✅ No duplicate Swift files found"
fi
echo ""

# Done
echo "✨ Cache clear complete!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/App/App.xcworkspace"
echo "2. Wait for indexing to complete"
echo "3. Product → Clean Build Folder (Cmd + Shift + K)"
echo "4. Product → Build (Cmd + B)"
echo "5. Product → Run (Cmd + R)"
echo ""
echo "The threading warning should be gone! 🎉"
