#!/bin/bash

echo "🔍 ONBOARDING DEBUG TEST"
echo "========================"

echo ""
echo "📱 1. CHECKING SWIFT FILES:"
echo "----------------------------"
echo "✅ OnboardingVideoView.swift:"
ls -la "ios/App/App/OnboardingVideoView.swift" 2>/dev/null || echo "❌ File not found"

echo "✅ OnboardingManager.swift:"
ls -la "ios/App/App/OnboardingManager.swift" 2>/dev/null || echo "❌ File not found"

echo "✅ ContentView.swift:"
ls -la "ios/App/App/ContentView.swift" 2>/dev/null || echo "❌ File not found"

echo ""
echo "🎬 2. CHECKING VIDEO FILE:"
echo "--------------------------"
echo "✅ Video in ios/App/App/:"
ls -la "ios/App/App/ivory - Made with Clipchamp.mov" 2>/dev/null || echo "❌ Video not found in ios/App/App/"

echo ""
echo "🔧 3. XCODE PROJECT CHECK:"
echo "---------------------------"
if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
    echo "✅ Xcode project found"
    
    # Check if video is referenced
    if grep -q "ivory - Made with Clipchamp.mov" "ios/App/App.xcodeproj/project.pbxproj"; then
        echo "✅ Video file is referenced in Xcode project"
    else
        echo "❌ Video file NOT referenced in Xcode project"
    fi
    
    # Check if Swift files are referenced
    if grep -q "OnboardingVideoView.swift" "ios/App/App.xcodeproj/project.pbxproj"; then
        echo "✅ OnboardingVideoView.swift is referenced in Xcode project"
    else
        echo "❌ OnboardingVideoView.swift NOT referenced in Xcode project"
    fi
    
    if grep -q "OnboardingManager.swift" "ios/App/App.xcodeproj/project.pbxproj"; then
        echo "✅ OnboardingManager.swift is referenced in Xcode project"
    else
        echo "❌ OnboardingManager.swift NOT referenced in Xcode project"
    fi
else
    echo "❌ Xcode project not found"
fi

echo ""
echo "🐛 4. NEXT STEPS:"
echo "-----------------"
echo "A. BUILD AND TEST:"
echo "   1. Open Xcode: open ios/App/App.xcodeproj"
echo "   2. Clean build folder: Product → Clean Build Folder"
echo "   3. Build and run on simulator"
echo "   4. Check Xcode console for debug messages:"
echo "      - '🎬 ContentView init called'"
echo "      - '🎬 ContentView onAppear called'"
echo "      - '🎬 OnboardingManager initialized'"
echo "      - '🎬 Getting hasSeenOnboardingVideo: false'"
echo ""
echo "B. IF NO DEBUG MESSAGES:"
echo "   1. Verify both Swift files are added to App target in Xcode"
echo "   2. Check if files compile without errors"
echo "   3. Reset simulator: xcrun simctl erase all"
echo ""
echo "C. IF DEBUG MESSAGES APPEAR BUT NO VIDEO:"
echo "   1. Look for video loading messages"
echo "   2. Check if debug indicator shows 'ONBOARDING' or 'WEBVIEW'"
echo "   3. Verify video file is in app bundle"

echo ""
echo "🎯 MOST LIKELY ISSUES:"
echo "----------------------"
echo "1. Swift files not added to Xcode project target"
echo "2. Video file not included in app bundle"
echo "3. UserDefaults already set (reset with: xcrun simctl erase all)"