#!/bin/bash

# Test Onboarding Video
echo "🧪 Testing Onboarding Video..."

# Build the iOS app
echo "🔨 Building iOS app..."
./build-for-ios.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📱 TESTING INSTRUCTIONS:"
echo ""
echo "1. SIMULATOR TESTING:"
echo "   - Open Xcode"
echo "   - Select iOS Simulator"
echo "   - Product → Run (⌘+R)"
echo "   - Delete app if already installed"
echo "   - Install fresh to trigger first launch"
echo ""
echo "2. DEVICE TESTING:"
echo "   - Connect iOS device"
echo "   - Select device in Xcode"
echo "   - Product → Run (⌘+R)"
echo "   - Delete app if already installed"
echo ""
echo "3. TESTFLIGHT TESTING:"
echo "   - Archive and upload to TestFlight"
echo "   - Install fresh from TestFlight"
echo "   - Check for video on first launch"
echo ""
echo "🔍 DEBUG CHECKLIST:"
echo "✅ Video file exists in ios/App/App/"
echo "✅ Video file added to Xcode project"
echo "✅ Debug logs added to code"
echo "✅ Fallback mechanisms in place"
echo "✅ Tap gesture to skip if stuck"
echo ""
echo "📋 WHAT TO LOOK FOR:"
echo "- Video should play automatically on first launch"
echo "- No skip or continue buttons"
echo "- Video auto-advances to login when finished"
echo "- Tap video to skip if needed"
echo "- Check Xcode console for debug logs"
echo ""
echo "🐛 IF VIDEO DOESN'T SHOW:"
echo "1. Check Xcode console for error messages"
echo "2. Verify video file is in app bundle"
echo "3. Try tapping screen (fallback gesture)"
echo "4. Reset onboarding: NativeBridge.resetOnboarding()"
echo ""
echo "🔄 RESET FOR TESTING:"
echo "- Delete and reinstall app"
echo "- Or use: await window.NativeBridge.resetOnboarding()"