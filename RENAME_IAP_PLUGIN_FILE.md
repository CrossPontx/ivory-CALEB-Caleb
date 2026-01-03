# Quick Fix: Rename IAPPlugin File in Xcode

## Problem
The file is named "IAPPlugin 2.swift" (with space and "2") which might be causing Capacitor discovery issues.

## Quick Fix (30 seconds)

### In Xcode:

1. **Select "IAPPlugin 2.swift"** in Project Navigator (it's already selected in your screenshot)

2. **Press Enter key** to rename

3. **Type**: `IAPPlugin.swift` (remove the " 2")

4. **Press Enter** to confirm

5. **Clean**: **Shift + Cmd + K**

6. **Build**: **Cmd + B**

7. **Run**: **Cmd + R**

## Check Console

You should now see:
```
🟢 IAPPlugin: load() called
✅ IAPPlugin: Device CAN make payments
✅ IAP initialized with 4 products
```

## If That Doesn't Work

The original `IAPPlugin.swift` file (without "2") still exists. Delete both and re-add:

1. **Delete "IAPPlugin 2.swift"** from Xcode (Move to Trash)
2. **Delete "IAPPlugin.swift"** from Finder:
   ```bash
   rm "ios/App/App/IAPPlugin.swift"
   ```
3. **Recreate the file** - I can provide the content
4. **Add to Xcode** properly

## Why This Might Fix It

- Capacitor might not like the space in the filename
- The "2" suffix might confuse the plugin discovery
- Xcode might not be compiling it correctly with that name

Try the rename first - it's the quickest solution!
