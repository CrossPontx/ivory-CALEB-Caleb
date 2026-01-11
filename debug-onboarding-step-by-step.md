# Step-by-Step Onboarding Debug Guide

## 🎯 The Issue
Your debug output shows everything is set up correctly, but you're still not seeing the video. This is likely a **UserDefaults caching issue** in the simulator.

## 🔧 Step-by-Step Fix

### Step 1: Complete Simulator Reset
```bash
./test-simulator-reset.sh
```

### Step 2: Open Xcode and Check Console
1. Open Xcode
2. Open `ios/App/App.xcodeproj` (NOT workspace)
3. View → Debug Area → Activate Console
4. Select iPhone 15 Simulator
5. Product → Run (⌘+R)

### Step 3: Watch for Debug Messages
You should see these messages in order:

```
🎬 OnboardingManager initialized
🎬 Getting hasSeenOnboardingVideo: false
🎬 Onboarding check - hasSeenOnboarding: false
🎬 First launch detected, showing onboarding video
✅ Found video file: ivory - Made with Clipchamp.mov
🎬 Loading video from: ivory - Made with Clipchamp.mov
🎬 Starting video playback
```

### Step 4: Check Visual Indicators
- **Red debug badge** in top-right should show "ONBOARDING"
- **Black screen** should appear
- **Video should start playing**

## 🐛 Troubleshooting

### If Debug Badge Shows "WEBVIEW"
This means onboarding was skipped. Look for:
```
🎬 Getting hasSeenOnboardingVideo: true
🎬 User has seen onboarding, skipping video
```

**Fix:** UserDefaults has cached data
1. Delete app from simulator
2. Reset simulator again: `xcrun simctl erase all`
3. Rebuild and run

### If Debug Badge Shows "ONBOARDING" But No Video
This means onboarding is triggered but video isn't loading. Look for:
```
❌ Could not find onboarding video file in bundle
```

**Fix:** Video file not in app bundle
1. Check if video file is added to Xcode project target
2. Clean build folder: Product → Clean Build Folder
3. Rebuild

### If No Debug Messages at All
This means the Swift code isn't running. Check:
1. Are you running the native iOS app or web version?
2. Is the simulator actually running the built app?
3. Check for build errors

## 🎬 Expected Behavior (Once Working)

### First Launch:
1. App opens
2. Black screen appears immediately
3. Video starts playing automatically
4. No buttons or controls
5. Video plays to completion
6. Automatically advances to login

### If User Leaves During Video:
1. Video pauses and saves progress
2. When they return, video resumes from exact position
3. Progress persists across app launches

### After Video Completes:
1. Goes directly to login/signup
2. Never shows video again
3. Debug badge shows "WEBVIEW" on future launches

## 🚨 Most Likely Issue

Based on your debug output, the most likely issue is **simulator UserDefaults caching**. The simulator thinks the user has already seen the onboarding video.

**Quick Fix:**
1. `xcrun simctl erase all`
2. Rebuild and run
3. Should work immediately

## 📞 If Still Not Working

If you've tried everything above and still no video:

1. **Check Xcode Console Output** - This is the most important step
2. **Verify the debug badge** - Shows "ONBOARDING" vs "WEBVIEW"
3. **Try on a real device** - Sometimes simulator has video playback issues
4. **Check video file format** - Should be .mov QuickTime format (which yours is)

The implementation is solid and your setup is correct. It's almost certainly a simulator caching issue that a complete reset will fix.