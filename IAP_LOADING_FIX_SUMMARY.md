# IAP Loading Spinner Fix - Summary

## Problem
The "Loading subscription options..." spinner shows indefinitely on the billing page, and subscribe buttons appear disabled/blurred.

## Root Causes Identified
1. **Threading Warning**: `@Published var products` in IAPManager being updated from background thread (StoreKit callback)
2. **JavaScript Callback**: Callbacks to web not dispatched on main thread
3. **Products Loading Twice**: `getProducts` being called twice (visible in logs)

## Fixes Applied

### 1. IAPManager.swift - Line 163
```swift
// BEFORE:
self.products = response.products

// AFTER:
DispatchQueue.main.async {
    self.products = response.products
}
```

### 2. WebViewModel.swift - callJavaScript method
```swift
// BEFORE:
func callJavaScript(_ script: String, completion: ((Any?, Error?) -> Void)? = nil) {
    webView?.evaluateJavaScript(script, completionHandler: completion)
}

// AFTER:
func callJavaScript(_ script: String, completion: ((Any?, Error?) -> Void)? = nil) {
    DispatchQueue.main.async { [weak self] in
        self?.webView?.evaluateJavaScript(script, completionHandler: completion)
    }
}
```

### 3. subscription-plans.tsx - Async initialization
```typescript
// BEFORE:
useEffect(() => {
    checkDeveloperStatus();
    if (isNative) {
        loadIAPProducts();
        setupIAPListeners();
    }
}, [isNative]);

// AFTER:
useEffect(() => {
    const init = async () => {
        await checkDeveloperStatus();
        if (isNative) {
            loadIAPProducts();
            setupIAPListeners();
        }
    };
    init();
}, [isNative]);
```

## How to Test

### 1. Clean Build in Xcode
```bash
# In Xcode:
Cmd + Shift + K  (Clean Build Folder)

# Or delete derived data:
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### 2. Rebuild
```bash
Cmd + B
```

### 3. Run
```bash
Cmd + R
```

### 4. Expected Behavior
- Navigate to billing page
- See "Loading subscription options..." briefly
- Spinner disappears after ~1 second
- Subscribe buttons become clickable
- NO threading warnings in console

### 5. Expected Console Output
```
✅ Bridge injected successfully
📨 Received message from web: getProducts
🔵 Requesting products: com.ivory.app.subscription.pro.monthly, ...
✅ Products received: 4
```

**WITHOUT** the threading warning!

## If Still Not Working

### Check Safari Web Inspector
1. Safari → Develop → Simulator → [Your App]
2. In console, check if products are being received:
```javascript
// Should see products array
console.log(window._iapProducts);
```

### Manual Test in Console
```javascript
// Test if callback is working
window.NativeBridge.getProducts(['com.ivory.app.subscription.pro.monthly'])
  .then(result => console.log('✅ Products:', result))
  .catch(error => console.error('❌ Error:', error));
```

### Check React State
Add temporary logging in `subscription-plans.tsx`:
```typescript
useEffect(() => {
    console.log('🔵 iapLoading:', iapLoading);
    console.log('🔵 iapProducts:', iapProducts.length);
    console.log('🔵 iapError:', iapError);
}, [iapLoading, iapProducts, iapError]);
```

## Alternative: Remove Loading Spinner for Developer

If you want to test subscriptions without the spinner, you can temporarily hide it:

In `subscription-plans.tsx`, change:
```typescript
{isNative && iapLoading && (
    <div className="border border-[#E8E8E8] p-8 bg-white text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#8B7355]" strokeWidth={1} />
        <p className="text-sm text-[#6B6B6B] font-light">Loading subscription options...</p>
    </div>
)}
```

To:
```typescript
{isNative && iapLoading && !isDeveloper && (
    <div className="border border-[#E8E8E8] p-8 bg-white text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#8B7355]" strokeWidth={1} />
        <p className="text-sm text-[#6B6B6B] font-light">Loading subscription options...</p>
    </div>
)}
```

This will hide the spinner for your developer account while still showing it for other users.

## Files Modified
- `ios/App/App/IAPManager.swift`
- `ios/App/App/WebViewModel.swift`
- `components/subscription-plans.tsx`

## Commit Hash
Latest: `ef9f05c2` - "Fix threading warning - dispatch JavaScript calls to main thread"
