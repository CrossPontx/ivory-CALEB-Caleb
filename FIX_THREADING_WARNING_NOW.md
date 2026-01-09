# Fix Threading Warning - Quick Start

## The Problem
```
Publishing changes from background threads is not allowed
```

## The Solution (2 minutes)

### Option 1: Automated Script
```bash
./clear-xcode-cache.sh
```

Then in Xcode:
1. Wait for indexing
2. Cmd + Shift + K (Clean)
3. Cmd + B (Build)
4. Cmd + R (Run)

### Option 2: Manual (if script doesn't work)
```bash
# 1. Quit Xcode
killall Xcode

# 2. Delete caches
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Developer/Xcode/Build
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# 3. Clean project
cd ios/App
rm -rf build/ DerivedData/ .build/

# 4. Reopen
open App.xcworkspace
```

## Why This Works

Your code fixes are now complete:
- ✅ `IAPManager.swift` line 158-163: Main thread dispatch for products
- ✅ `WebView.swift` lines 63-74: Main thread dispatch for isLoading
- ✅ `WebViewModel.swift` callJavaScript: Main thread dispatch
- ✅ `subscription-plans.tsx`: Async initialization

The cache clear forces Xcode to rebuild with all the updated code.

## Expected Result

**BEFORE:**
```
✅ Products received: 4
Publishing changes from background threads is not allowed ❌
```

**AFTER:**
```
✅ Products received: 4
```

No warning! 🎉

## If Still Not Working

Check for duplicate files:
```bash
find ios/App -name "*.swift" -maxdepth 1
```

Should be empty. All Swift files should be in `ios/App/App/` not `ios/App/`.

## Files
- `XCODE_CACHE_FIX.md` - Detailed explanation
- `IAP_LOADING_FIX_SUMMARY.md` - Complete fix documentation
- `clear-xcode-cache.sh` - Automated cache clear script
