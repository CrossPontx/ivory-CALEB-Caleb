#!/bin/bash

# Debug Video Issue - Comprehensive Check
echo "🔍 COMPREHENSIVE VIDEO DEBUG CHECK"
echo "=================================="

# 1. Check video file existence and properties
echo ""
echo "📁 1. VIDEO FILE CHECK:"
echo "----------------------"

if [ -f "public/ivory - Made with Clipchamp.mov" ]; then
    echo "✅ Source video exists in public/"
    ls -lh "public/ivory - Made with Clipchamp.mov"
    
    # Check file type
    file "public/ivory - Made with Clipchamp.mov"
    
    # Check if it's a valid video
    if command -v ffprobe &> /dev/null; then
        echo "📹 Video properties:"
        ffprobe -v quiet -print_format json -show_format -show_streams "public/ivory - Made with Clipchamp.mov" | head -20
    fi
else
    echo "❌ Source video NOT found in public/"
fi

if [ -f "ios/App/App/ivory - Made with Clipchamp.mov" ]; then
    echo "✅ iOS video exists in ios/App/App/"
    ls -lh "ios/App/App/ivory - Made with Clipchamp.mov"
else
    echo "❌ iOS video NOT found in ios/App/App/"
    echo "Copying from public..."
    if [ -f "public/ivory - Made with Clipchamp.mov" ]; then
        cp "public/ivory - Made with Clipchamp.mov" "ios/App/App/"
        echo "✅ Video copied"
    fi
fi

# 2. Check Xcode project references
echo ""
echo "🔧 2. XCODE PROJECT CHECK:"
echo "-------------------------"

if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
    if grep -q "ivory.*Made.*with.*Clipchamp" "ios/App/App.xcodeproj/project.pbxproj"; then
        echo "✅ Video file referenced in Xcode project"
        echo "References found:"
        grep -n "ivory.*Made.*with.*Clipchamp" "ios/App/App.xcodeproj/project.pbxproj" | head -3
    else
        echo "❌ Video file NOT referenced in Xcode project"
        echo ""
        echo "🚨 CRITICAL: You must manually add the video to Xcode:"
        echo "1. Open ios/App/App.xcworkspace in Xcode"
        echo "2. Right-click 'App' folder → 'Add Files to App'"
        echo "3. Select 'ivory - Made with Clipchamp.mov'"
        echo "4. Ensure 'Add to target: App' is checked"
        echo "5. Click 'Add'"
    fi
else
    echo "❌ Xcode project file not found"
fi

# 3. Check for alternative video files
echo ""
echo "🎬 3. ALTERNATIVE VIDEO FILES:"
echo "-----------------------------"
find . -name "*.mov" -o -name "*.mp4" | grep -v node_modules | head -10

# 4. Check iOS app structure
echo ""
echo "📱 4. IOS APP STRUCTURE:"
echo "-----------------------"
echo "Files in ios/App/App/:"
ls -la "ios/App/App/" | grep -E "\.(mov|mp4|swift)$" | head -10

# 5. Check for build issues
echo ""
echo "🔨 5. BUILD CHECK:"
echo "-----------------"
if [ -f "ios/App/App.xcworkspace" ]; then
    echo "✅ Xcode workspace exists"
    
    # Try a quick build check
    echo "Checking if project builds..."
    xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' -quiet clean build 2>&1 | grep -E "(error|warning|FAILED)" | head -5
    
    if [ $? -eq 0 ]; then
        echo "✅ Project builds successfully"
    else
        echo "⚠️  Build issues detected (check above)"
    fi
else
    echo "❌ Xcode workspace not found"
fi

# 6. Check UserDefaults simulation
echo ""
echo "💾 6. USERDEFAULTS SIMULATION:"
echo "-----------------------------"
echo "Simulating first launch check..."
echo "hasSeenOnboardingVideo would be: false (first launch)"
echo "This should trigger onboarding video display"

# 7. Check bundle simulation
echo ""
echo "📦 7. BUNDLE SIMULATION:"
echo "-----------------------"
echo "Simulating bundle.main.url check..."
if [ -f "ios/App/App/ivory - Made with Clipchamp.mov" ]; then
    echo "✅ Bundle.main.url would find: ivory - Made with Clipchamp.mov"
else
    echo "❌ Bundle.main.url would return nil (file not in bundle)"
fi

# 8. Provide specific debug steps
echo ""
echo "🐛 8. NEXT DEBUG STEPS:"
echo "----------------------"
echo ""
echo "A. IMMEDIATE FIXES:"
echo "   1. Ensure video file is added to Xcode project (MOST IMPORTANT)"
echo "   2. Clean build folder: Product → Clean Build Folder"
echo "   3. Reset simulator: xcrun simctl erase all"
echo ""
echo "B. DEBUG IN XCODE:"
echo "   1. Open Xcode Console (View → Debug Area → Activate Console)"
echo "   2. Run app and look for these messages:"
echo "      - '🎬 OnboardingManager initialized'"
echo "      - '🎬 Getting hasSeenOnboardingVideo: false'"
echo "      - '🎬 First launch detected, showing onboarding video'"
echo "      - '✅ Found video file: ivory - Made with Clipchamp.mov'"
echo ""
echo "C. IF STILL NO VIDEO:"
echo "   1. Check if debug indicator shows 'ONBOARDING' or 'WEBVIEW'"
echo "   2. Look for error messages in console"
echo "   3. Verify video file is actually in app bundle"
echo ""
echo "D. MANUAL VERIFICATION:"
echo "   1. Build app"
echo "   2. Right-click app in simulator → Show Package Contents"
echo "   3. Look for video file in bundle"

echo ""
echo "🎯 MOST LIKELY ISSUE: Video file not added to Xcode project"
echo "This is a MANUAL step that must be done in Xcode interface"