# IAP Quick Debug Guide

## Current Issue
App compiles ✅ but shows `UNIMPLEMENTED` error at runtime ❌

## Quick Fix Steps (Try in Order)

### 1. Verify Target Membership (2 minutes)
```
1. Open Xcode: yarn cap open ios
2. Click on IAPPlugin.swift in left panel
3. Look at right panel → File Inspector tab
4. Find "Target Membership" section
5. Make sure "App" has a checkmark ✅
6. Repeat for WatchConnectivityPlugin.swift
7. Repeat for WatchConnectivityBridge.swift
```

### 2. Clean Build (1 minute)
```
In Xcode:
- Product → Clean Build Folder (Cmd+Shift+K)
- Delete app from your iPhone
- Product → Run (Cmd+R)
```

### 3. Check Console Logs
Look for one of these:

**✅ SUCCESS:**
```
⚡️  Capacitor: Found plugin: IAPPlugin
⚡️  [log] - Available IAP products: []
```
(Empty array is OK - means plugin works, just no products yet)

**❌ STILL BROKEN:**
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
```

### 4. If Still Broken: Check Binary
```bash
cd ios/App/build/Debug-iphoneos/
nm -gU App.app/App | grep IAP
```

Should see:
```
_OBJC_CLASS_$_IAPPlugin
_OBJC_METACLASS_$_IAPPlugin
```

If you see nothing, the plugin isn't in the binary.

## After Plugin Works

### Create Products in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Your App → Features → In-App Purchases
3. Click "+" → Auto-Renewable Subscription
4. Create two subscription groups:
   - "Client Subscriptions"
   - "Business Subscriptions"

5. Add products:
   - `com.ivory.app.subscription.pro.monthly` - $19.99/month
   - `com.ivory.app.subscription.business.monthly` - $59.99/month

6. Wait 15-30 minutes for sync

7. Test again - products array should have items

## Expected Final Result

```
⚡️  [log] - Available IAP products: [
  { productId: "com.ivory.app.subscription.pro.monthly", price: 19.99 },
  { productId: "com.ivory.app.subscription.business.monthly", price: 59.99 }
]
```

## If Nothing Works

Use community plugin instead:
```bash
yarn add @capacitor-community/in-app-purchases
yarn cap sync ios
```

Then update `lib/iap.ts` to use `InAppPurchases` instead of `IAPPlugin`.
