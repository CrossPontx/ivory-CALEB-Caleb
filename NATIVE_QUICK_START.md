# Native SwiftUI Quick Start

## 🚀 Run Migration

```bash
./migrate-to-native.sh
```

## 📱 Xcode Setup (5 minutes)

### 1. Open Project
```bash
open ios/App/App.xcodeproj
```

### 2. Add Swift Files

Right-click `App` folder → **Add Files to "App"**

Select these files:
- ✅ IvoryApp.swift
- ✅ ContentView.swift
- ✅ WebView.swift
- ✅ WebViewModel.swift
- ✅ IAPManager.swift
- ✅ WatchConnectivityManager.swift
- ✅ CameraManager.swift
- ✅ ShareManager.swift
- ✅ HapticsManager.swift
- ✅ DeviceInfoManager.swift

**Important:** Check "Copy items if needed" and ensure target is "App"

### 3. Update AppDelegate.swift

The file is already updated! Just verify it looks like this:

```swift
import UIKit
import os.log

class AppDelegate: NSObject, UIApplicationDelegate {
    // ... (no @UIApplicationMain, no window property)
}
```

### 4. Build & Run

```
Cmd+Shift+K  (Clean)
Cmd+B        (Build)
Cmd+R        (Run)
```

## ✅ Test Checklist

- [ ] App launches
- [ ] Web content loads
- [ ] IAP: Load products
- [ ] IAP: Purchase
- [ ] Camera works
- [ ] Share works
- [ ] Haptics work

## 🔧 Common Issues

### "Bridge not available"
- Wait for page load to complete
- Check console for "✅ Native bridge injected"

### IAP not working
- Check product IDs in App Store Connect
- Add StoreKit configuration file for testing
- Check Xcode console for IAP logs (🔵, ✅, ❌)

### Camera not working
- Test on real device (not simulator)
- Check Info.plist permissions

## 📝 Using the Bridge

### TypeScript/React

```typescript
import { isNativeIOS, purchaseProduct, takePicture } from '@/lib/native-bridge';

// Check if native
if (isNativeIOS()) {
  // Purchase
  const result = await purchaseProduct('com.ivory.app.credits5');
  
  // Camera
  const photo = await takePicture({ source: 'prompt' });
  
  // Haptics
  hapticImpact('medium');
}
```

### Existing IAP Code

Your existing IAP code still works! The `lib/iap.ts` automatically detects and uses the native bridge:

```typescript
import { iapManager } from '@/lib/iap';

// Works with both Capacitor and native bridge
await iapManager.loadProducts();
await iapManager.purchase('com.ivory.app.credits5');
```

## 🎯 What Changed

### Removed
- ❌ Capacitor dependency (optional)
- ❌ Capacitor plugins
- ❌ Bridge complexity

### Added
- ✅ Native Swift/SwiftUI
- ✅ Direct WKWebView control
- ✅ Cleaner architecture
- ✅ Better performance

## 📚 Full Documentation

See `NATIVE_SWIFTUI_MIGRATION.md` for complete guide.

## 🎉 You're Done!

The app now runs on native Swift/SwiftUI with WKWebView. All features work exactly the same, but with better performance and full native control.
