#!/bin/bash

# Setup Onboarding Video for iOS
# This script helps set up the onboarding video in the iOS project

echo "🎬 Setting up onboarding video for iOS..."

# Check if video file exists
if [ ! -f "public/ivory - Made with Clipchamp.mov" ]; then
    echo "❌ Video file not found at public/ivory - Made with Clipchamp.mov"
    echo "Please make sure the video file is in the public directory"
    exit 1
fi

# Copy video to iOS app bundle
echo "📁 Copying video to iOS app bundle..."
cp "public/ivory - Made with Clipchamp.mov" "ios/App/App/"

if [ $? -eq 0 ]; then
    echo "✅ Video copied successfully"
else
    echo "❌ Failed to copy video"
    exit 1
fi

echo ""
echo "🔧 Manual Xcode Setup Required:"
echo "1. Open ios/App/App.xcworkspace in Xcode"
echo "2. Right-click on the 'App' folder in the project navigator"
echo "3. Select 'Add Files to App'"
echo "4. Navigate to ios/App/App/ and select 'ivory - Made with Clipchamp.mov'"
echo "5. Make sure 'Add to target: App' is checked"
echo "6. Click 'Add'"
echo ""
echo "📱 Testing the Onboarding:"
echo "- The video will show only on first app launch"
echo "- To test again, you can call NativeBridge.resetOnboarding() from the web console"
echo "- Or delete and reinstall the app"
echo ""
echo "🎯 Features:"
echo "- Video plays automatically on first launch"
echo "- Skip button appears after 3 seconds"
echo "- Continue button appears when video finishes"
echo "- Video pauses when app goes to background"
echo "- Video resumes when app becomes active"
echo "- Only shows on native iOS, not on web"
echo ""
echo "✅ Setup complete! Remember to add the video file to Xcode project manually."