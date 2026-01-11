#!/bin/bash

# Verify Bundle Contents
echo "📦 VERIFYING APP BUNDLE CONTENTS"
echo "================================"

# Build the app first
echo "🔨 Building app..."
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build -quiet

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Find the built app
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "*.app" -path "*/Build/Products/Debug-iphonesimulator/*" | grep -E "(App|Ivory)" | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ Could not find built app"
    echo "Looking in DerivedData..."
    find ~/Library/Developer/Xcode/DerivedData -name "*.app" | head -5
    exit 1
fi

echo "📱 Found app at: $APP_PATH"

echo ""
echo "📁 APP BUNDLE CONTENTS:"
echo "----------------------"

# List all files in the app bundle
echo "All files in bundle:"
find "$APP_PATH" -type f | head -20

echo ""
echo "🎬 VIDEO FILES IN BUNDLE:"
echo "------------------------"

# Look specifically for video files
VIDEO_FILES=$(find "$APP_PATH" -name "*.mov" -o -name "*.mp4")

if [ -n "$VIDEO_FILES" ]; then
    echo "✅ Video files found in bundle:"
    echo "$VIDEO_FILES"
    
    # Check file sizes
    for file in $VIDEO_FILES; do
        echo "File: $(basename "$file")"
        ls -lh "$file"
    done
else
    echo "❌ No video files found in app bundle"
    echo ""
    echo "🚨 PROBLEM: Video file is not being included in the app bundle"
    echo ""
    echo "SOLUTIONS:"
    echo "1. Open Xcode project"
    echo "2. Check if video file is added to 'App' target"
    echo "3. Right-click video file → 'Show File Inspector'"
    echo "4. Ensure 'Target Membership' includes 'App'"
    echo "5. Clean and rebuild project"
fi

echo ""
echo "🔍 BUNDLE STRUCTURE:"
echo "-------------------"
ls -la "$APP_PATH" | head -10

echo ""
echo "📋 VERIFICATION COMPLETE"
echo "If video file is in bundle but still not playing:"
echo "1. Check video format compatibility"
echo "2. Check console logs for playback errors"
echo "3. Verify UserDefaults is clean (first launch)"