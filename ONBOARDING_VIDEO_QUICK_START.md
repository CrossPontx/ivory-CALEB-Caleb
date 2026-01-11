# Onboarding Video - Quick Start Guide

## 🚀 Quick Setup

1. **Run the setup script:**
   ```bash
   ./setup-onboarding-video.sh
   ```

2. **Add video to Xcode (REQUIRED):**
   - Open `ios/App/App.xcworkspace`
   - Right-click 'App' folder → 'Add Files to App'
   - Select `ios/App/App/ivory - Made with Clipchamp.mov`
   - Ensure 'Add to target: App' is checked

3. **Build and test:**
   ```bash
   ./test-onboarding-video.sh
   ```

## 🧪 Testing

### Debug the Setup
```bash
./debug-onboarding-video.sh
```

### First Time Testing
- Delete app from device/simulator
- Install fresh app → Video plays automatically
- **No skip/continue buttons** - video auto-advances to login

### Reset for Testing
```javascript
// In web console
await window.NativeBridge.resetOnboarding();
// Then restart app
```

### Alternative Reset
- Delete app and reinstall

## ✨ User Experience

- **0s**: Video starts playing automatically
- **Tap**: Tap anywhere on video to skip to login
- **End**: Auto-advances to login when video finishes
- **Background**: Video pauses
- **Foreground**: Video resumes
- **Timeout**: Auto-advances after 30 seconds max

## 🔧 Key Files

- `OnboardingVideoView.swift` - Video player (no buttons)
- `OnboardingManager.swift` - State management
- `ContentView.swift` - Integration logic
- Video: `ivory - Made with Clipchamp.mov` (9.2MB)

## ⚠️ Important Notes

- **iOS Only**: Web version unaffected
- **Manual Step**: Must add video file to Xcode project
- **One Time**: Shows only on first app launch
- **Performance**: Loads from local bundle (no network)
- **Fallbacks**: Tap to skip, timeout protection, error handling

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Video not playing | Check Xcode console logs |
| Video not showing | Run debug script, check file in bundle |
| App crashes | Verify video file format (.mov) |
| TestFlight issues | Delete and reinstall, check logs |
| Video stuck | Tap anywhere on screen to skip |

## 📱 TestFlight Specific

- Video should work in TestFlight builds
- If not showing: delete app and reinstall fresh
- Check device storage (video is 9.2MB)
- Verify video file is included in archive

## 🔍 Debug Features

- Debug indicator shows "ONBOARDING" vs "WEBVIEW" (debug builds only)
- Console logs for all video events
- Tap gesture fallback if video gets stuck
- 30-second timeout protection
- Error handling for playback failures

## 📱 Ready to Ship

Once the video file is added to Xcode project, the feature is ready for production deployment with robust fallbacks.