# Simple Onboarding Video Test Guide

## 🚨 The Issues We Found

1. **Simulator was running** - Can't reset while booted
2. **No iPhone 15 simulator** - Your system has iPhone 16e, iPhone 17, etc.
3. **Command line build issues** - Easier to use Xcode directly

## ✅ Simple Fix - Use Xcode Directly

### Step 1: Stop and Reset Simulator
1. **Quit iOS Simulator** completely (Simulator → Quit Simulator)
2. **Reset simulator data:**
   ```bash
   xcrun simctl erase all
   ```

### Step 2: Open in Xcode
1. **Open Xcode**
2. **Open project:** `ios/App/App.xcodeproj`
3. **Select any iPhone simulator** from your available list:
   - iPhone 16e
   - iPhone 17
   - iPhone 17 Pro
   - Any of the available ones

### Step 3: Build and Run
1. **Product → Clean Build Folder** (⇧⌘K)
2. **Product → Run** (⌘R)
3. **Open Xcode Console:** View → Debug Area → Activate Console

### Step 4: Watch for Debug Messages
Look for these messages in the Xcode Console:

```
🎬 OnboardingManager initialized
🎬 Getting hasSeenOnboardingVideo: false
🎬 Onboarding check - hasSeenOnboarding: false
🎬 First launch detected, showing onboarding video
✅ Found video file: ivory - Made with Clipchamp.mov
🎬 Loading video from: ivory - Made with Clipchamp.mov
🎬 Starting video playback
```

### Step 5: Check Visual Indicators
- **Red debug badge** in top-right should show "ONBOARDING"
- **Black screen** should appear
- **Video should start playing**

## 🐛 If Still No Video

### Check Debug Badge
- **"ONBOARDING"** = Video should be playing (check console for errors)
- **"WEBVIEW"** = Onboarding was skipped (UserDefaults cached)

### If Badge Shows "WEBVIEW"
The simulator still has cached data. Try:
1. **Delete app** from simulator (long press app icon → Delete App)
2. **Rebuild and run** in Xcode

### If Badge Shows "ONBOARDING" But No Video
Check Xcode Console for error messages like:
- `❌ Could not find onboarding video file in bundle`
- `❌ Video playback failed`

## 🎯 Most Likely Solution

Since your debug output showed everything is set up correctly, it's almost certainly a **simulator caching issue**. The complete simulator reset should fix it.

**Quick Steps:**
1. Quit Simulator completely
2. `xcrun simctl erase all`
3. Open Xcode → Open `ios/App/App.xcodeproj`
4. Select any iPhone simulator
5. Product → Clean Build Folder
6. Product → Run
7. Watch Xcode Console for debug messages

The video should appear immediately on first launch after the reset!