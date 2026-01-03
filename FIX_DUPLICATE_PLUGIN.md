# Fix Duplicate IAP Plugin File

## Problem
You have TWO IAPPlugin files:
- `IAPPlugin.swift` (original, not in Xcode project)
- `IAPPlugin 2.swift` (duplicate, in Xcode project)

Xcode created "IAPPlugin 2.swift" when you added the file because it detected a duplicate. The plugin still returns `UNIMPLEMENTED` because the duplicate might not be properly configured.

## Solution: Remove Duplicate and Add Original

### Step 1: Remove the Duplicate from Xcode

1. **In Xcode Project Navigator**:
   - Find **"IAPPlugin 2.swift"** (it's currently selected/highlighted in blue)
   - Right-click on it
   - Select **"Delete"**
   - Choose **"Move to Trash"** (not just "Remove Reference")

### Step 2: Add the Original File

1. **Right-click on "App" folder** (yellow folder icon)
2. Select **"Add Files to 'App'..."**
3. Navigate to and select **`IAPPlugin.swift`** (without the "2")
4. **CRITICAL - Check these options**:
   - ❌ **UNCHECK** "Copy items if needed"
   - ✅ **CHECK** "Create groups"
   - ✅ **CHECK** "Add to targets: App"
5. Click **"Add"**

### Step 3: Verify Target Membership

1. Click on **`IAPPlugin.swift`** in Project Navigator
2. In the **File Inspector** (right panel):
   - Verify **"Target Membership"** shows **"App"** is checked ✅
   - Verify **"Type"** shows **"Default - Swift Source"**

### Step 4: Clean and Rebuild

1. **Clean Build Folder**:
   - Menu: **Product → Clean Build Folder**
   - Or: **Shift + Cmd + K**

2. **Delete Derived Data**:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```

3. **Rebuild**:
   - Menu: **Product → Build**
   - Or: **Cmd + B**

### Step 5: Run and Verify

1. **Run on device**: **Cmd + R**

2. **Check console** - you should now see:
   ```
   🟢 IAPPlugin: load() called - Plugin is initializing
   🟢 IAPPlugin: Added as payment queue observer
   ✅ IAPPlugin: Device CAN make payments
   🔵 IAPPlugin: getProducts() called
   🔵 IAPPlugin: Requesting 4 products
   ✅ IAPPlugin: Products request succeeded
   📦 Product - com.ivory.app.subscription.pro.monthly | Pro Monthly | $19.99
   ```

## Why This Happened

When you added `IAPPlugin.swift` to Xcode, it detected that a file with that name already existed in the project (even though it wasn't visible), so it created "IAPPlugin 2.swift" as a duplicate.

## Alternative: Rename in Xcode

If you want to keep the current file:

1. Select **"IAPPlugin 2.swift"** in Xcode
2. Press **Enter** to rename
3. Change name to **"IAPPlugin.swift"** (remove the " 2")
4. Press **Enter** to confirm
5. Clean and rebuild

## Verification

After fixing, run:
```bash
grep -i "IAPPlugin" ios/App/App.xcodeproj/project.pbxproj | grep -v "IAPPlugin 2"
```

Should show references to `IAPPlugin.swift` (without the "2").

## Expected Result

Console should show:
- ✅ Plugin loads successfully
- ✅ 4 products loaded
- ✅ Subscribe button works
- ✅ Payment sheet appears
