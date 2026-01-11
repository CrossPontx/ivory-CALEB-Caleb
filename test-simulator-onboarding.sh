#!/bin/bash

# Test Onboarding Video in iOS Simulator
echo "📱 Testing Onboarding Video in iOS Simulator..."

# Check if we're set up for simulator testing
echo "🔍 Checking simulator setup..."

# Verify video file exists
if [ ! -f "ios/App/App/ivory - Made with Clipchamp.mov" ]; then
    echo "❌ Video file missing, copying from public..."
    cp "public/ivory - Made with Clipchamp.mov" "ios/App/App/"
fi

# Build for simulator
echo "🔨 Building for iOS Simulator..."
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📱 SIMULATOR TESTING STEPS:"
echo ""
echo "1. Open Xcode"
echo "2. Select iOS Simulator (iPhone 15 or similar)"
echo "3. Product → Run (⌘+R)"
echo ""
echo "🔍 DEBUGGING IN SIMULATOR:"
echo "1. Open Xcode Console (View → Debug Area → Activate Console)"
echo "2. Look for these debug messages:"
echo "   - '🎬 Onboarding check - hasSeenOnboarding: false'"
echo "   - '🎬 First launch detected, showing onboarding video'"
echo "   - '🎬 Loading video from: ivory - Made with Clipchamp.mov'"
echo ""
echo "3. If you see 'ONBOARDING' in red debug indicator, video should show"
echo "4. If you see 'WEBVIEW' in red debug indicator, onboarding was skipped"
echo ""
echo "🐛 COMMON SIMULATOR ISSUES:"
echo "- Simulator may have cached app data (reset simulator)"
echo "- Video file not included in bundle (check Xcode project)"
echo "- UserDefaults persisting between runs"
echo ""
echo "🔄 RESET SIMULATOR FOR FRESH TEST:"
echo "1. Device → Erase All Content and Settings"
echo "2. Or delete app: Long press app icon → Delete App"
echo "3. Rebuild and run"
echo ""
echo "🧪 MANUAL RESET ONBOARDING:"
echo "1. Run app once"
echo "2. Open Safari in simulator"
echo "3. Go to localhost:3000"
echo "4. Open browser console (Develop → Simulator → Safari)"
echo "5. Run: await window.NativeBridge.resetOnboarding()"
echo "6. Close and reopen native app"