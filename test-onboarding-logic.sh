#!/bin/bash

# Test Onboarding Logic
echo "🧪 TESTING ONBOARDING LOGIC"
echo "============================"

echo ""
echo "📱 SIMULATOR RESET & TEST:"
echo "--------------------------"

# Reset simulator to ensure clean state
echo "1. Resetting iOS Simulator..."
xcrun simctl erase all
echo "✅ Simulator reset complete"

echo ""
echo "2. Building project..."
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build -quiet

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎬 EXPECTED BEHAVIOR:"
echo "--------------------"
echo "When you run the app now, you should see:"
echo ""
echo "1. App launches"
echo "2. Black screen appears"
echo "3. Video starts playing automatically"
echo "4. Debug indicator shows 'ONBOARDING' (red badge)"
echo "5. Console shows debug messages"
echo ""
echo "🔍 DEBUG MESSAGES TO LOOK FOR:"
echo "------------------------------"
echo "🎬 OnboardingManager initialized"
echo "🎬 Getting hasSeenOnboardingVideo: false"
echo "🎬 Onboarding check - hasSeenOnboarding: false"
echo "🎬 First launch detected, showing onboarding video"
echo "✅ Found video file: ivory - Made with Clipchamp.mov"
echo "🎬 Loading video from: ivory - Made with Clipchamp.mov"
echo "🎬 Starting video playback"
echo ""
echo "❌ ERROR MESSAGES THAT INDICATE PROBLEMS:"
echo "-----------------------------------------"
echo "❌ Could not find onboarding video file in bundle"
echo "❌ Video playback failed"
echo "🎬 User has seen onboarding, skipping video"
echo ""
echo "🚀 NEXT STEPS:"
echo "-------------"
echo "1. Open Xcode"
echo "2. Select iOS Simulator (iPhone 15)"
echo "3. Product → Run (⌘+R)"
echo "4. Watch Xcode Console for debug messages"
echo "5. Look for red debug indicator in top-right"
echo ""
echo "If you see 'WEBVIEW' instead of 'ONBOARDING':"
echo "- The onboarding was skipped"
echo "- Check console for error messages"
echo "- UserDefaults might have cached data"
echo ""
echo "If you see 'ONBOARDING' but no video:"
echo "- Video file might not be in app bundle"
echo "- Check console for video loading errors"
echo "- Video format might be incompatible"