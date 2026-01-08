# Xcode Setup Checklist

## Pre-Flight

- [ ] Run `./migrate-to-native.sh`
- [ ] Next.js build completed (`yarn build`)
- [ ] All Swift files created in `ios/App/App/`

## Xcode Setup

### 1. Open Project
```bash
open ios/App/App.xcodeproj
```

### 2. Add Swift Files

- [ ] Right-click `App` folder in Project Navigator
- [ ] Select **"Add Files to 'App'"**
- [ ] Navigate to `ios/App/App/`
- [ ] Select these 10 files:
  - [ ] IvoryApp.swift
  - [ ] ContentView.swift
  - [ ] WebView.swift
  - [ ] WebViewModel.swift
  - [ ] IAPManager.swift
  - [ ] WatchConnectivityManager.swift
  - [ ] CameraManager.swift
  - [ ] ShareManager.swift
  - [ ] HapticsManager.swift
  - [ ] DeviceInfoManager.swift
- [ ] Check **"Copy items if needed"**
- [ ] Ensure **"Add to targets: App"** is checked
- [ ] Click **Add**

### 3. Verify Files Added

In Project Navigator, expand `App` folder:
- [ ] All 10 new Swift files visible
- [ ] Files have blue icon (not gray)
- [ ] Files are in `App` group

### 4. Check AppDelegate.swift

- [ ] File is updated (no `@UIApplicationMain`)
- [ ] Class is `NSObject, UIApplicationDelegate`
- [ ] No `window` property
- [ ] Imports `UIKit` and `os.log`

### 5. Build Settings

- [ ] Select project in Navigator
- [ ] Select `App` target
- [ ] Build Settings tab
- [ ] Search for "Swift Language Version"
- [ ] Verify: **Swift 5** or later

### 6. Info.plist Permissions

- [ ] Camera Usage Description exists
- [ ] Photo Library Usage Description exists
- [ ] URL Schemes configured (for OAuth)

### 7. Signing & Capabilities

- [ ] Team selected
- [ ] Bundle Identifier: `com.ivory.app`
- [ ] Capabilities:
  - [ ] In-App Purchase
  - [ ] Associated Domains (for Universal Links)
  - [ ] Push Notifications (if used)

### 8. Clean Build

- [ ] Product → Clean Build Folder (`Cmd+Shift+K`)
- [ ] Wait for completion

### 9. Build

- [ ] Product → Build (`Cmd+B`)
- [ ] Wait for build to complete
- [ ] Check for errors (should be 0)
- [ ] Check for warnings (review if any)

### 10. Select Device

- [ ] Select device/simulator from dropdown
- [ ] Recommended: Real device for full testing

### 11. Run

- [ ] Product → Run (`Cmd+R`)
- [ ] App should launch
- [ ] Web content should load

## Testing Checklist

### Basic Functionality

- [ ] App launches without crash
- [ ] Splash screen shows
- [ ] Web content loads
- [ ] Navigation works
- [ ] No console errors

### Native Bridge

- [ ] Open Safari Web Inspector
- [ ] Connect to app
- [ ] Check console for: "✅ Native bridge injected"
- [ ] Test: `window.NativeBridge` exists

### IAP Testing

- [ ] Load products: `iapManager.loadProducts()`
- [ ] Products returned (check console)
- [ ] Initiate purchase
- [ ] Purchase flow completes
- [ ] Receipt validation works

### Camera Testing

- [ ] Tap camera button
- [ ] Permission prompt appears (first time)
- [ ] Camera opens
- [ ] Take photo
- [ ] Photo appears in app

### Share Testing

- [ ] Tap share button
- [ ] Native share sheet appears
- [ ] Can select share destination
- [ ] Share completes

### Haptics Testing

- [ ] Tap buttons
- [ ] Feel haptic feedback
- [ ] Different styles work

### Watch Testing (if paired)

- [ ] Watch app installed
- [ ] Send data to watch
- [ ] Watch receives data
- [ ] Bidirectional communication works

## Xcode Console Checks

### Look for these logs:

**App Launch:**
```
🟢 AppDelegate: Application did finish launching (Native SwiftUI)
✅ IAPManager initialized
✅ Watch session activated
```

**Bridge Injection:**
```
✅ Bridge injected successfully
```

**IAP:**
```
🔵 IAPPlugin: Requesting products...
✅ Products received: X
📦 Product - com.ivory.app.credits5 | ...
```

### Red Flags (should NOT see):

```
❌ Failed to inject bridge
❌ Cannot make payments
❌ Products request FAILED
❌ Watch not supported
```

## Common Issues & Fixes

### Issue: Build Fails

**Error:** "Cannot find 'IvoryApp' in scope"

**Fix:**
- Ensure IvoryApp.swift is added to target
- Check file is in correct location
- Clean build folder and rebuild

### Issue: Bridge Not Available

**Error:** `window.NativeBridge` is undefined

**Fix:**
- Check Xcode console for injection errors
- Ensure WebView finished loading
- Check JavaScript console for errors

### Issue: IAP Not Working

**Error:** "Cannot make payments"

**Fix:**
- Check device settings (Restrictions)
- Verify product IDs in App Store Connect
- Add StoreKit configuration file
- Use sandbox test account

### Issue: Camera Permission Denied

**Error:** Camera doesn't open

**Fix:**
- Check Info.plist has camera permission
- Reset permissions: Settings → Privacy → Camera
- Uninstall and reinstall app

### Issue: Files Not Building

**Error:** Files are gray in Xcode

**Fix:**
- Select file in Navigator
- File Inspector (right panel)
- Check "Target Membership: App"

## Performance Checks

### Memory Usage

- [ ] Open Instruments (Cmd+I)
- [ ] Select "Leaks" template
- [ ] Run app
- [ ] Check for memory leaks (should be 0)

### Launch Time

- [ ] Open Instruments
- [ ] Select "Time Profiler"
- [ ] Run app
- [ ] Check launch time (should be <2s)

### Network

- [ ] Open Network tab in Xcode
- [ ] Run app
- [ ] Verify web content loads
- [ ] Check for failed requests

## Final Verification

- [ ] All tests pass
- [ ] No crashes
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] All features work
- [ ] Ready for TestFlight

## Next Steps

- [ ] Test on multiple devices
- [ ] Test on different iOS versions
- [ ] Submit to TestFlight
- [ ] Gather feedback
- [ ] Submit to App Store

## Notes

**Xcode Version:** _____________

**iOS Version:** _____________

**Device:** _____________

**Issues Found:** _____________

**Resolution:** _____________

---

✅ **Checklist Complete!**

Your native SwiftUI app is ready for testing and deployment.
