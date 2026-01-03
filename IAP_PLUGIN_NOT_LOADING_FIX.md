# IAP Plugin Not Loading - Complete Fix

## Symptoms
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
```

**AND** no native Swift logs from IAPPlugin:
- ❌ No `🟢 IAPPlugin: load() called`
- ❌ No `🟢 IAPPlugin: Added as payment queue observer`
- ❌ No `✅ IAPPlugin: Device CAN make payments`

This means **the plugin class is not being instantiated at all**.

## Root Causes

1. **Filename issue**: "IAPPlugin 2.swift" (with space and "2")
2. **Duplicate files**: Both `IAPPlugin.swift` and `IAPPlugin 2.swift` exist
3. **Build configuration**: Plugin might not be compiled correctly

## Complete Fix

### Option 1: Clean Slate (RECOMMENDED)

1. **Remove ALL IAPPlugin files from Xcode**:
   - In Xcode, select "IAPPlugin 2.swift"
   - Right-click → Delete → Move to Trash
   - If you see "IAPPlugin.swift" in Xcode, delete that too

2. **Delete files from filesystem**:
   ```bash
   cd ios/App/App
   rm -f "IAPPlugin.swift"
   rm -f "IAPPlugin 2.swift"
   ```

3. **Recreate the file with correct content**:
   ```bash
   # I'll provide the command to recreate it
   ```

4. **Add to Xcode properly**:
   - Right-click "App" folder
   - "Add Files to 'App'..."
   - Select the new `IAPPlugin.swift`
   - UNCHECK "Copy items"
   - CHECK "Add to targets: App"

### Option 2: Rename and Fix (FASTER)

1. **In Xcode**:
   - Select "IAPPlugin 2.swift"
   - Press **Enter** to rename
   - Change to: `IAPPlugin.swift`
   - Press **Enter**

2. **Delete the duplicate from filesystem**:
   ```bash
   # If there's still an "IAPPlugin.swift" file (the old one)
   cd ios/App/App
   ls -la | grep IAP
   # If you see two files, keep only the one Xcode is using
   ```

3. **Verify in Xcode**:
   - Click on `IAPPlugin.swift`
   - File Inspector (right panel)
   - Target Membership: "App" should be checked ✅

4. **Clean and Rebuild**:
   ```bash
   # In Xcode
   Product → Clean Build Folder (Shift+Cmd+K)
   
   # In Terminal
   cd ios/App
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   
   # Back in Xcode
   Product → Build (Cmd+B)
   ```

### Option 3: Manual Registration (If Auto-Discovery Fails)

If the plugin still doesn't load after the above, manually register it in AppDelegate:

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
        
        // This forces the plugin to be registered
        _ = IAPPlugin.self
        
        return true
    }
    
    // ... rest of AppDelegate
}
```

## Verification Steps

### Step 1: Check File in Xcode
- [ ] Only ONE IAPPlugin file in Project Navigator
- [ ] Named "IAPPlugin.swift" (no "2", no space)
- [ ] Has "App" checked in Target Membership
- [ ] Shows as "Swift Source" file type

### Step 2: Check Build
```bash
cd ios/App
xcodebuild build -workspace App.xcworkspace -scheme App 2>&1 | grep -i iapplugin
```

Should show:
```
CompileSwift normal arm64 .../IAPPlugin.swift
```

### Step 3: Check Console After Running
Should see these logs IN ORDER:
```
🟢 AppDelegate: Application did finish launching
🟢 IAPPlugin: load() called - Plugin is initializing
🟢 IAPPlugin: Added as payment queue observer
✅ IAPPlugin: Device CAN make payments
```

If you see AppDelegate log but NOT IAPPlugin logs, the plugin isn't being discovered.

## Debugging

### Check if plugin is compiled:
```bash
cd ios/App
xcodebuild build -workspace App.xcworkspace -scheme App -showBuildSettings | grep SWIFT_ACTIVE_COMPILATION_CONDITIONS
```

### Check if plugin is in binary:
```bash
cd ios/App
# After building
nm -gU DerivedData/App-*/Build/Products/Debug-iphoneos/App.app/App | grep IAPPlugin
```

Should show symbols like:
```
_OBJC_CLASS_$_IAPPlugin
_OBJC_METACLASS_$_IAPPlugin
```

### Force plugin discovery:
Add to `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  // ... existing config
  plugins: {
    IAPPlugin: {
      // This tells Capacitor to look for this plugin
    }
  }
};
```

## Common Issues

### Issue: "IAPPlugin 2.swift" keeps appearing
**Solution**: Xcode is caching. Delete derived data and restart Xcode.

### Issue: No native logs at all
**Solution**: Plugin not being compiled. Check Target Membership.

### Issue: "Use of undeclared type 'IAPPlugin'"
**Solution**: File not in project or not compiling. Re-add to Xcode.

### Issue: Still getting UNIMPLEMENTED
**Solution**: Try manual registration in AppDelegate (Option 3 above).

## Expected Timeline

- Rename file: **30 seconds**
- Clean and rebuild: **2 minutes**
- Test: **1 minute**
- **Total: ~3-4 minutes**

## Success Criteria

✅ Console shows: `🟢 IAPPlugin: load() called`
✅ Console shows: `✅ IAP initialized with 4 products`
✅ No more `UNIMPLEMENTED` errors
✅ Subscribe button works
✅ Payment sheet appears

## If Still Not Working

1. **Restart Xcode completely**
2. **Delete the app from device**
3. **Clean build folder**
4. **Delete derived data**
5. **Rebuild and reinstall**

Sometimes Xcode caches old plugin configurations and needs a full restart.

## Nuclear Option

If nothing works:

1. Close Xcode
2. Delete all IAP plugin files
3. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
4. Restart Mac (clears all caches)
5. Recreate IAPPlugin.swift from scratch
6. Add to Xcode
7. Build and run

This should force a completely clean build.
