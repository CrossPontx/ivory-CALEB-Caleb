# Fix Subscribe Button - Quick Steps

## The Problem
```
Failed to load IAP products: {"code":"UNIMPLEMENTED"}
```

## The Solution (5 Minutes)

### 1. Open Xcode
```bash
cd ios/App && open App.xcworkspace
```

### 2. Add Plugin File
- Right-click **"App"** folder (blue icon)
- Select **"Add Files to 'App'..."**
- Choose **`App/IAPPlugin.swift`**
- **UNCHECK** "Copy items if needed"
- **CHECK** "Add to targets: App" ✅
- Click **"Add"**

### 3. Add StoreKit
- Click blue **"App"** project icon
- Select **"App"** target
- **"Frameworks, Libraries, and Embedded Content"**
- Click **"+"**
- Add **"StoreKit.framework"**

### 4. Clean & Build
- **Shift + Cmd + K** (Clean)
- **Cmd + B** (Build)

### 5. Run & Verify
- **Cmd + R** (Run on device)
- Check console for:
  ```
  🟢 IAPPlugin: load() called
  ✅ IAP initialized with 4 products
  ```

## Success Indicators

✅ Console shows plugin loaded
✅ Console shows 4 products
✅ Subscribe button responds
✅ Payment sheet appears

## If Still Broken

Run diagnostic:
```bash
./fix-iap-plugin.sh
```

## Full Documentation

- `APPLE_GUIDELINE_2_1_CRITICAL_FIX.md` - Complete guide
- `APPLE_GUIDELINE_2_1_PLUGIN_REGISTRATION_FIX.md` - Detailed steps
- `APPLE_GUIDELINE_2_1_TESTING_GUIDE.md` - Testing procedures

## This Fixes Apple Rejection

The Subscribe button is unresponsive because the IAP plugin isn't in the Xcode project. Adding it fixes everything.

**Time: 5 minutes**
**Difficulty: Easy**
**Impact: Fixes Apple rejection**
