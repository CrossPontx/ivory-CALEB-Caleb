# IAP Plugin Registration Fix - CRITICAL

## Issue
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
⚡️  [log] - ✅ IAP initialized with 0 products
```

The `UNIMPLEMENTED` error means **the IAP plugin is not registered with Capacitor**. The Swift file exists but isn't included in the Xcode project.

## Root Cause
The `IAPPlugin.swift` file exists in the filesystem but is not added to the Xcode project target, so Capacitor can't discover it.

## Fix Steps

### Step 1: Add Plugin to Xcode Project

1. **Open Xcode Project**
   ```bash
   cd ios/App
   open App.xcworkspace
   ```

2. **Add IAPPlugin.swift to Project**
   - In Xcode, right-click on the `App` folder (blue icon) in the Project Navigator
   - Select "Add Files to 'App'..."
   - Navigate to: `ios/App/App/IAPPlugin.swift`
   - **IMPORTANT**: Check these options:
     - ✅ "Copy items if needed" (UNCHECK this - file is already in place)
     - ✅ "Create groups" (should be selected)
     - ✅ "Add to targets: App" (MUST be checked)
   - Click "Add"

3. **Verify Plugin is Added**
   - In Project Navigator, you should see `IAPPlugin.swift` under the App folder
   - Click on `IAPPlugin.swift`
   - In the right panel (File Inspector), verify:
     - Target Membership shows "App" is checked ✅

### Step 2: Verify Plugin Conforms to CAPBridgedPlugin

The plugin already has the correct protocol:

```swift
@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IAPPlugin"
    public let jsName = "IAPPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishTransaction", returnType: CAPPluginReturnPromise)
    ]
    // ...
}
```

This is correct - Capacitor will auto-discover it once it's in the project.

### Step 3: Add StoreKit Framework

1. **Select App Target**
   - In Xcode, click on the blue "App" project icon at the top of Project Navigator
   - Select the "App" target (under TARGETS)

2. **Add StoreKit Framework**
   - Click on "Frameworks, Libraries, and Embedded Content" section
   - Click the "+" button
   - Search for "StoreKit"
   - Select "StoreKit.framework"
   - Click "Add"
   - Verify it shows as "Do Not Embed"

### Step 4: Clean and Rebuild

1. **Clean Build Folder**
   - In Xcode menu: Product → Clean Build Folder
   - Or press: Shift + Cmd + K

2. **Delete Derived Data**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```

3. **Rebuild**
   - In Xcode menu: Product → Build
   - Or press: Cmd + B

### Step 5: Verify Plugin Registration

1. **Run on Device**
   - Connect iPhone
   - Select your device in Xcode
   - Press Cmd + R to run

2. **Check Console Logs**
   Look for these logs:
   ```
   🟢 IAPPlugin: load() called - Plugin is initializing
   🟢 IAPPlugin: Added as payment queue observer
   ✅ IAPPlugin: Device CAN make payments
   ```

   If you see these, the plugin is registered! ✅

3. **Check for Products**
   ```
   🔵 IAPPlugin: getProducts() called
   🔵 IAPPlugin: Requesting 4 products
   ✅ IAPPlugin: Products request succeeded
   📦 com.ivory.app.subscription.pro.monthly: Pro Monthly - $19.99
   ```

## Alternative: Manual Plugin Registration (If Auto-Discovery Fails)

If auto-discovery doesn't work, manually register the plugin:

### Option A: Register in AppDelegate

**File**: `ios/App/App/AppDelegate.swift`

```swift
import UIKit
import Capacitor
import os.log

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private let logger = OSLog(subsystem: "com.ivory.app", category: "AppDelegate")

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        os_log("🟢 AppDelegate: Application did finish launching", log: logger, type: .info)
        
        // Manually register IAP plugin
        os_log("🔵 AppDelegate: Manually registering IAPPlugin", log: logger, type: .info)
        
        return true
    }
    
    // ... rest of AppDelegate
}
```

### Option B: Create capacitor.config.json Plugin Entry

**File**: `capacitor.config.ts`

Add to the config:

```typescript
const config: CapacitorConfig = {
  appId: 'com.ivory.app',
  appName: "Ivory's Choice",
  webDir: 'out',
  // ... existing config
  plugins: {
    // ... existing plugins
    IAPPlugin: {
      // Plugin will be auto-discovered
    }
  }
};
```

## Verification Checklist

After adding the plugin to Xcode:

- [ ] IAPPlugin.swift appears in Xcode Project Navigator
- [ ] IAPPlugin.swift has "App" checked in Target Membership
- [ ] StoreKit.framework is added to project
- [ ] Project builds without errors
- [ ] Console shows `🟢 IAPPlugin: load() called`
- [ ] Console shows `✅ IAPPlugin: Device CAN make payments`
- [ ] Console shows `✅ IAPPlugin: Products request succeeded`
- [ ] Console shows product listings with prices

## Expected Console Output After Fix

### Before Fix:
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
⚡️  [log] - ✅ IAP initialized with 0 products
```

### After Fix:
```
🟢 IAPPlugin: load() called - Plugin is initializing
🟢 IAPPlugin: Added as payment queue observer
✅ IAPPlugin: Device CAN make payments
🔵 IAPPlugin: getProducts() called
🔵 IAPPlugin: Requesting 4 products: com.ivory.app.subscription.pro.monthly, ...
🔵 IAPPlugin: Starting products request...
✅ IAPPlugin: Products request succeeded
✅ IAPPlugin: Received 4 valid products
📦 IAPPlugin: Product - com.ivory.app.subscription.pro.monthly | Pro Monthly | $19.99
📦 IAPPlugin: Product - com.ivory.app.subscription.business.monthly | Business Monthly | $59.99
✅ IAP initialized with 4 products
```

## Common Issues

### Issue: "Cannot find 'IAPPlugin' in scope"
**Solution**: Make sure IAPPlugin.swift is added to the App target

### Issue: "Use of undeclared type 'SKProduct'"
**Solution**: Add StoreKit framework to the project

### Issue: Still getting UNIMPLEMENTED error
**Solution**: 
1. Clean build folder
2. Delete derived data
3. Restart Xcode
4. Rebuild project

### Issue: Plugin loads but no products
**Solution**: This is a different issue - check App Store Connect configuration

## Quick Test Command

After fixing, run this to verify:

```bash
# Clean and rebuild
cd ios/App
xcodebuild clean -workspace App.xcworkspace -scheme App
xcodebuild build -workspace App.xcworkspace -scheme App

# Look for IAPPlugin in build output
xcodebuild build -workspace App.xcworkspace -scheme App 2>&1 | grep -i "iapplugin"
```

## Video Guide

If you need visual guidance:
1. Open Xcode
2. Show Project Navigator (Cmd + 1)
3. Right-click "App" folder
4. "Add Files to 'App'..."
5. Select IAPPlugin.swift
6. Ensure "Add to targets: App" is checked
7. Click Add
8. Clean and rebuild

## Next Steps After Fix

1. ✅ Add IAPPlugin.swift to Xcode project
2. ✅ Add StoreKit framework
3. ✅ Clean and rebuild
4. ✅ Run on device
5. ✅ Verify console logs show plugin loaded
6. ✅ Test subscribe button
7. ✅ Verify payment sheet appears
8. ✅ Complete test purchase

## Support

If the plugin still doesn't register after these steps:
1. Check Xcode build logs for errors
2. Verify Swift version compatibility
3. Check iOS deployment target (should be 13.0+)
4. Verify bundle identifier matches: com.ivory.app
