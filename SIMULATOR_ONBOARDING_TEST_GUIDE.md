# iOS Simulator Onboarding Video Test Guide

## 🎯 Quick Test Steps

### 1. Reset Simulator (Important!)
```bash
# Reset iOS Simulator to fresh state
xcrun simctl erase all
```

### 2. Build and Run
```bash
# Build for simulator
./test-simulator-onboarding.sh
```

### 3. Check Debug Logs
Open Xcode Console and look for these messages:
- `🎬 Onboarding check - hasSeenOnboarding: false`
- `🎬 First launch detected, showing onboarding video`
- `🎬 Loading video from: ivory - Made with Clipchamp.mov`

## 🔍 Debug Indicators

### Visual Debug Indicator
In debug builds, you'll see a red badge in the top-right:
- **"ONBOARDING"** = Video should be showing
- **"WEBVIEW"** = Onboarding was skipped

### Console Messages
```
🎬 OnboardingManager initialized
🎬 Getting hasSeenOnboardingVideo: false
🎬 Onboarding check - hasSeenOnboarding: false
🎬 First launch detected, showing onboarding video
✅ Found video file: ivory - Made with Clipchamp.mov
🎬 Loading video from: ivory - Made with Clipchamp.mov
🎬 Starting video playback
```

## 🧪 Manual Testing

### Add Test Button (Temporary)
Add this to your home page for testing:

```tsx
// Add to app/home/page.tsx imports
import { TestOnboardingButton } from "@/test-onboarding-button"

// Add before closing </div> in return statement
<TestOnboardingButton />
```

### Test Button Actions
1. **"🎬 Test Onboarding"** - Resets onboarding state
2. **"🔍 Check Status"** - Shows debug info in console

## 🐛 Common Issues & Solutions

### Issue: Video Not Showing
**Symptoms:** App goes straight to web view
**Solutions:**
1. Check if video file is in Xcode project
2. Reset simulator: `xcrun simctl erase all`
3. Check console for error messages
4. Verify UserDefaults is clean

### Issue: Video File Not Found
**Symptoms:** Console shows "❌ Could not find onboarding video file"
**Solutions:**
1. Verify file exists: `ls -la ios/App/App/*.mov`
2. Add file to Xcode project manually
3. Clean and rebuild project

### Issue: Video Loads But Doesn't Play
**Symptoms:** Black screen with loading indicator
**Solutions:**
1. Tap anywhere on screen (fallback gesture)
2. Check video file format (should be .mov)
3. Wait for 30-second timeout

## 📱 Simulator-Specific Notes

### Simulator Limitations
- Video playback may be slower than device
- Audio might not work in simulator
- Some video formats may not play

### Simulator Reset Commands
```bash
# Reset all simulators
xcrun simctl erase all

# Reset specific simulator
xcrun simctl erase "iPhone 15"

# List available simulators
xcrun simctl list devices
```

## 🔄 Testing Workflow

### Fresh Install Test
1. `xcrun simctl erase all`
2. Build and run in Xcode
3. Should see onboarding video immediately

### Repeat Test
1. Use test button to reset onboarding
2. Close app completely
3. Reopen app
4. Should see video again

### UserDefaults Check
```bash
# Check UserDefaults in simulator
xcrun simctl get_app_container booted com.yourapp.bundle data
# Look for Library/Preferences/*.plist
```

## 📋 Checklist

Before testing, verify:
- [ ] Video file exists in `ios/App/App/`
- [ ] Video file added to Xcode project
- [ ] Simulator is reset to clean state
- [ ] Debug logs are enabled
- [ ] Console is open in Xcode

## 🎬 Expected Behavior

### First Launch
1. App opens
2. Black screen appears
3. Video starts playing automatically
4. No skip/continue buttons
5. Video auto-advances to login when finished
6. Tap anywhere to skip if needed

### Subsequent Launches
1. App opens directly to web view
2. No video shown
3. Debug indicator shows "WEBVIEW"

## 🚨 If Still Not Working

1. **Check Xcode Project:**
   - Open `ios/App/App.xcworkspace`
   - Verify `ivory - Made with Clipchamp.mov` is in project
   - Check it's added to App target

2. **Verify File Path:**
   ```bash
   find ios/App -name "*.mov" -type f
   ```

3. **Check Bundle Contents:**
   - Build app
   - Check if video is in app bundle
   - Look for build errors

4. **Alternative Video Names:**
   The code tries these names:
   - `ivory - Made with Clipchamp.mov`
   - `onboarding-video.mov`
   - `ivory_onboarding.mov`

## 📞 Debug Support

If video still doesn't show, check:
1. Xcode console output
2. Video file size (should be ~9.2MB)
3. Simulator storage space
4. Video file permissions

The implementation includes multiple fallbacks and should work reliably once the video file is properly added to the Xcode project.