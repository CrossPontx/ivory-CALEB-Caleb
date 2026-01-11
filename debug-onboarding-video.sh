#!/bin/bash

# Debug Onboarding Video Issues
echo "🔍 Debugging Onboarding Video Setup..."

# Check if video file exists in source
echo "📁 Checking source video file..."
if [ -f "public/ivory - Made with Clipchamp.mov" ]; then
    echo "✅ Source video found: public/ivory - Made with Clipchamp.mov"
    ls -lh "public/ivory - Made with Clipchamp.mov"
else
    echo "❌ Source video NOT found in public/"
    echo "Available files in public/:"
    ls -la public/ | grep -E "\.(mov|mp4|avi)$" || echo "No video files found"
fi

echo ""

# Check if video file exists in iOS app
echo "📱 Checking iOS app video file..."
if [ -f "ios/App/App/ivory - Made with Clipchamp.mov" ]; then
    echo "✅ iOS video found: ios/App/App/ivory - Made with Clipchamp.mov"
    ls -lh "ios/App/App/ivory - Made with Clipchamp.mov"
else
    echo "❌ iOS video NOT found in ios/App/App/"
    echo "Available files in ios/App/App/:"
    ls -la "ios/App/App/" | grep -E "\.(mov|mp4|avi)$" || echo "No video files found"
fi

echo ""

# Check Xcode project file for video reference
echo "🔧 Checking Xcode project..."
if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
    if grep -q "ivory.*Made.*with.*Clipchamp" "ios/App/App.xcodeproj/project.pbxproj"; then
        echo "✅ Video file referenced in Xcode project"
    else
        echo "❌ Video file NOT referenced in Xcode project"
        echo "⚠️  You need to manually add the video file to Xcode:"
        echo "   1. Open ios/App/App.xcworkspace in Xcode"
        echo "   2. Right-click 'App' folder → 'Add Files to App'"
        echo "   3. Select 'ivory - Made with Clipchamp.mov'"
        echo "   4. Ensure 'Add to target: App' is checked"
    fi
else
    echo "❌ Xcode project file not found"
fi

echo ""

# Copy video if missing
if [ ! -f "ios/App/App/ivory - Made with Clipchamp.mov" ] && [ -f "public/ivory - Made with Clipchamp.mov" ]; then
    echo "📋 Copying video to iOS app..."
    cp "public/ivory - Made with Clipchamp.mov" "ios/App/App/"
    if [ $? -eq 0 ]; then
        echo "✅ Video copied successfully"
    else
        echo "❌ Failed to copy video"
    fi
fi

echo ""

# Check for alternative video names
echo "🔍 Checking for alternative video files..."
find . -name "*.mov" -o -name "*.mp4" | grep -v node_modules | head -10

echo ""

# Provide fix instructions
echo "🛠️  FIX INSTRUCTIONS:"
echo "1. Ensure video file exists in ios/App/App/"
echo "2. Add video file to Xcode project manually"
echo "3. Clean and rebuild iOS project"
echo "4. Test on device/simulator"
echo ""
echo "📱 TESTING:"
echo "- Delete app from device/simulator"
echo "- Reinstall to trigger first launch"
echo "- Check Xcode console for debug logs"
echo ""
echo "🔄 RESET ONBOARDING (for testing):"
echo "- In web console: await window.NativeBridge.resetOnboarding()"
echo "- Or delete and reinstall app"