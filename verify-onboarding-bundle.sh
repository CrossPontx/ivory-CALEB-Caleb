#!/bin/bash

echo "📦 VERIFY ONBOARDING IN APP BUNDLE"
echo "==================================="

# Find the most recent app bundle in simulator
APP_PATH=$(find ~/Library/Developer/CoreSimulator/Devices -name "*.app" -path "*/Ivory*" -type d | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ No app bundle found. Build and run the app first."
    echo ""
    echo "STEPS:"
    echo "1. Open Xcode: open ios/App/App.xcodeproj"
    echo "2. Build and run on simulator"
    echo "3. Then run this script again"
    exit 1
fi

echo "✅ Found app bundle: $APP_PATH"
echo ""

echo "📁 BUNDLE CONTENTS:"
echo "-------------------"
ls -la "$APP_PATH" | grep -E "(ivory|onboarding|\.mov|\.mp4)" || echo "No video files found"

echo ""
echo "🎬 VIDEO FILE CHECK:"
echo "--------------------"
if [ -f "$APP_PATH/ivory - Made with Clipchamp.mov" ]; then
    echo "✅ Video file found in bundle"
    ls -la "$APP_PATH/ivory - Made with Clipchamp.mov"
else
    echo "❌ Video file NOT found in bundle"
    echo ""
    echo "POSSIBLE SOLUTIONS:"
    echo "1. Ensure video file is added to Xcode project"
    echo "2. Check that video file is added to App target"
    echo "3. Clean build folder and rebuild"
fi

echo ""
echo "🔍 SWIFT FILES CHECK:"
echo "---------------------"
echo "Note: Swift files are compiled into the binary, not visible as separate files"

echo ""
echo "🐛 IF VIDEO NOT IN BUNDLE:"
echo "--------------------------"
echo "1. Open Xcode project"
echo "2. Select 'ivory - Made with Clipchamp.mov' in project navigator"
echo "3. Check 'Target Membership' in File Inspector"
echo "4. Ensure 'App' target is checked"
echo "5. Clean build folder and rebuild"