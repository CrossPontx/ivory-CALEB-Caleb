#!/bin/bash

# Test Simulator Reset and Debug
echo "🧪 SIMULATOR RESET & DEBUG TEST"
echo "==============================="

echo ""
echo "1. 🔄 RESETTING SIMULATOR..."
echo "----------------------------"
xcrun simctl erase all
echo "✅ Simulator reset complete"

echo ""
echo "2. 🔨 BUILDING PROJECT..."
echo "------------------------"
xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build -quiet

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    echo "Trying alternative build..."
    cd ios/App
    xcodebuild -project App.xcodeproj -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build -quiet
    cd ../..
fi

echo ""
echo "3. 📱 WHAT TO DO NEXT:"
echo "---------------------"
echo "1. Open Xcode"
echo "2. Open ios/App/App.xcodeproj"
echo "3. Select iPhone 15 Simulator"
echo "4. Product → Run (⌘+R)"
echo "5. Watch for debug messages in console"
echo ""
echo "🔍 EXPECTED DEBUG MESSAGES:"
echo "---------------------------"
echo "🎬 OnboardingManager initialized"
echo "🎬 Getting hasSeenOnboardingVideo: false"
echo "🎬 Onboarding check - hasSeenOnboarding: false"
echo "🎬 First launch detected, showing onboarding video"
echo "✅ Found video file: ivory - Made with Clipchamp.mov"
echo "🎬 Loading video from: ivory - Made with Clipchamp.mov"
echo "🎬 Starting video playback"
echo ""
echo "👀 VISUAL INDICATORS:"
echo "--------------------"
echo "- Red debug badge should show 'ONBOARDING'"
echo "- Black screen should appear"
echo "- Video should start playing"
echo ""
echo "❌ IF NO VIDEO APPEARS:"
echo "----------------------"
echo "1. Check if debug badge shows 'WEBVIEW' instead"
echo "2. Look for error messages in Xcode console"
echo "3. Check if UserDefaults has cached data"
echo "4. Verify video file is in app bundle"
echo ""
echo "🚨 CRITICAL: Make sure to check Xcode Console output!"