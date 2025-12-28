# IAP Plugin Fix - UNIMPLEMENTED Error

## Current Status: ⚠️ RUNTIME ERROR - Plugin Not Registered

The custom IAP plugin compiles successfully but returns `UNIMPLEMENTED` at runtime, indicating Capacitor cannot find the plugin.

## What Was Fixed ✅

### 1. Added Swift Files to Xcode Build Target
- Added `IAPPlugin.swift` to Compile Sources
- Added `WatchConnectivityPlugin.swift` to Compile Sources  
- Added `WatchConnectivityBridge.swift` to Compile Sources

### 2. Fixed Swift Compilation Errors
- Replaced `nil` with `NSNull()` in dictionary literals (lines 165, 171, 177)
- Swift dictionaries typed as `[String: Any]` cannot contain `nil` values

### 3. Cleaned Up Duplicate Files
- Removed duplicate files from `ios/App/` root directory
- Kept only the correct versions in `ios/App/App/` directory
- Updated Xcode project references to point to correct location

## File Locations (Correct)
```
ios/App/App/IAPPlugin.swift
ios/App/App/WatchConnectivityPlugin.swift
ios/App/App/WatchConnectivityBridge.swift
```

## Build Status
- ✅ App compiles successfully
- ✅ No Swift errors
- ✅ All plugins included in build target
- ✅ Files in correct location
- ❌ Plugin not found at runtime

## Current Problem: UNIMPLEMENTED Error

### Error Logs
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
⚡️  [log] - Available IAP products: []
⚡️  [error] - Product not found in available products
```

### Root Cause Analysis

The `UNIMPLEMENTED` error means Capacitor cannot find the `IAPPlugin` at runtime. This can happen when:

1. **Plugin not auto-discovered** - Capacitor 6+ should auto-discover plugins using `CAPBridgedPlugin`, but it's not working
2. **Missing from plugin registry** - The plugin may need explicit registration
3. **Target membership not set** - Files compile but aren't included in app bundle
4. **No products in App Store Connect** - Even if plugin works, StoreKit returns empty array without products

## Solution Path

### CRITICAL: Two Issues to Fix

#### Issue 1: Plugin Registration (Immediate)

The plugin exists but Capacitor can't find it. Try these fixes in order:

**Fix A: Verify Target Membership in Xcode**
1. Open Xcode: `yarn cap open ios`
2. Select `IAPPlugin.swift` in Project Navigator
3. Open File Inspector (right panel, first tab)
4. Check "Target Membership" section
5. Verify `App` checkbox is checked ✅
6. Repeat for `WatchConnectivityPlugin.swift` and `WatchConnectivityBridge.swift`

**Fix B: Clean Build and Reinstall**
```bash
# In Xcode
Product → Clean Build Folder (Cmd+Shift+K)

# Delete app from device completely
# Then rebuild and run
Product → Run (Cmd+R)
```

**Fix C: Verify Plugin in Binary**
After building, check if plugin is in the app binary:
```bash
# Find the built app
cd ios/App/build/Debug-iphoneos/

# Check if IAPPlugin symbols exist
nm -gU App.app/App | grep IAP

# Should see output like:
# _OBJC_CLASS_$_IAPPlugin
# _OBJC_METACLASS_$_IAPPlugin
```

**Fix D: Check Capacitor Logs**
In Xcode console when app launches, look for:
```
⚡️  Capacitor: Loading plugins...
⚡️  Capacitor: Found plugin: IAPPlugin
```

If you don't see this, the plugin isn't being discovered.

**Fix E: Explicit Registration (Last Resort)**
If auto-discovery fails, manually register in `ios/App/App/AppDelegate.swift`:

```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // This shouldn't be needed with CAPBridgedPlugin, but try if auto-discovery fails
        // Note: Capacitor 6+ should auto-register plugins
        return true
    }
}
```

#### Issue 2: Create Products in App Store Connect (Required)

Even after fixing plugin registration, you need products in App Store Connect for StoreKit to return data:

**Step 1: Create Subscription Groups**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to Features → In-App Purchases
4. Click "+" → Auto-Renewable Subscription
5. Create Subscription Group: "Client Subscriptions"

**Step 2: Add Pro Monthly Subscription**
- Reference Name: `Pro Monthly`
- Product ID: `com.ivory.app.subscription.pro.monthly`
- Subscription Duration: 1 month
- Price: $19.99 USD (Tier 20)
- Localization (English US):
  - Display Name: "Pro Monthly"
  - Description: "15 credits per month"

**Step 3: Create Second Subscription Group**
- Create Subscription Group: "Business Subscriptions"

**Step 4: Add Business Monthly Subscription**
- Reference Name: `Business Monthly`
- Product ID: `com.ivory.app.subscription.business.monthly`
- Subscription Duration: 1 month
- Price: $59.99 USD (Tier 60)
- Localization (English US):
  - Display Name: "Business Monthly"
  - Description: "40 credits + unlimited bookings"

**Step 5: Wait for Sync**
- Products take 15-30 minutes to sync to sandbox environment
- You'll know they're ready when StoreKit returns them in the products array

### Alternative: Use Community Plugin

If custom plugin continues to fail after all fixes, switch to the maintained community plugin:

```bash
# Install community plugin
yarn add @capacitor-community/in-app-purchases
yarn cap sync ios
```

Update `lib/iap.ts` to use `InAppPurchases` instead of `IAPPlugin`:
```typescript
import { InAppPurchases } from '@capacitor-community/in-app-purchases';

// Replace registerPlugin call with:
const IAP = InAppPurchases;
```

## Testing Checklist

### Plugin Registration
- [ ] Plugin files have Target Membership checked in Xcode
- [ ] Clean build performed (Cmd+Shift+K)
- [ ] App deleted and reinstalled on device
- [ ] Plugin symbols found in binary (`nm -gU` command)
- [ ] Capacitor logs show plugin discovery

### App Store Connect
- [ ] Products created in App Store Connect
- [ ] Products synced to sandbox (wait 15-30 min)
- [ ] Testing with sandbox Apple ID
- [ ] Testing on physical device (not simulator)
- [ ] App signed with correct provisioning profile

### Functionality
- [ ] No UNIMPLEMENTED error in logs
- [ ] Products array is not empty
- [ ] Can initiate purchase
- [ ] Receipt validation works
- [ ] Credits are awarded correctly

## Debug Commands

**Check if plugin is in the binary:**
```bash
nm -gU ios/App/build/Debug-iphoneos/App.app/App | grep IAP
```

**Check Capacitor plugin discovery:**
Look in Xcode console for:
```
⚡️  Capacitor: Loading plugins...
⚡️  Capacitor: Found plugin: IAPPlugin
```

**Test StoreKit connectivity:**
```swift
// In Xcode, add temporary code to test StoreKit directly
let request = SKProductsRequest(productIdentifiers: ["com.ivory.app.subscription.pro.monthly"])
request.delegate = self
request.start()
```

## Next Action Required

**IMMEDIATE:** 
1. Verify Target Membership in Xcode for all three Swift files
2. Clean build and reinstall app
3. Check Xcode console for plugin discovery logs

**AFTER PLUGIN WORKS:** 
1. Create products in App Store Connect
2. Wait 15-30 minutes for sync
3. Test subscription flow with sandbox account

## Expected Outcome

Once fixed, you should see:
```
⚡️  [log] - Available IAP products: [
  {
    productId: "com.ivory.app.subscription.pro.monthly",
    title: "Pro Monthly",
    price: 19.99,
    priceString: "$19.99"
  },
  {
    productId: "com.ivory.app.subscription.business.monthly",
    title: "Business Monthly",
    price: 59.99,
    priceString: "$59.99"
  }
]
```

Instead of:
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
⚡️  [log] - Available IAP products: []
```
