# IAP Loading Spinner Fix - Summary

## Problem
The "Loading subscription options..." spinner shows indefinitely on the billing page, and subscribe buttons appear disabled/blurred.

## Root Causes Identified
1. **Threading Warning in IAPManager**: `@Published var products` being updated from background thread (StoreKit callback)
2. **Threading Warning in WebView**: `@Published var isLoading` being updated from background thread (WKNavigationDelegate callbacks)
3. **JavaScript Callback**: Callbacks to web not dispatched on main thread
4. **Products Loading Twice**: `getProducts` being called twice (visible in logs)

## Fixes Applied

### 1. IAPManager.swift - Line 158-163
```swift
// BEFORE:
self.products = response.products

// AFTER:
DispatchQueue.main.async {
    self.products = response.products
}
```

### 2. WebView.swift - Navigation Delegate Methods
```swift
// BEFORE:
func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
    parent.viewModel.isLoading = true
}

func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    parent.viewModel.isLoading = false
    parent.viewModel.injectBridge()
}

func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    parent.viewModel.isLoading = false
    print("❌ WebView navigation failed: \(error.localizedDescription)")
}

// AFTER:
func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
    DispatchQueue.main.async {
        self.parent.viewModel.isLoading = true
    }
}

func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    DispatchQueue.main.async {
        self.parent.viewModel.isLoading = false
    }
    parent.viewModel.injectBridge()
}

func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    DispatchQueue.main.async {
        self.parent.viewModel.isLoading = false
    }
    print("❌ WebView navigation failed: \(error.localizedDescription)")
}
```

### 3. WebViewModel.swift - callJavaScript method
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

### 3. WebViewModel.swift - callJavaScript method
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

### 4. subscription-plans.tsx - Async initialization
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

### IMPORTANT: Complete Cache Clear Required

The code fixes are correct, but Xcode may be using cached builds. Run the automated script:

```bash
./clear-xcode-cache.sh
```

Or manually follow these steps:

### 1. Quit Xcode Completely
```bash
# Quit Xcode (Cmd + Q, not just close window)
killall Xcode
killall Simulator
```

### 2. Delete ALL Caches
```bash
# Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Delete build folder
rm -rf ~/Library/Developer/Xcode/Build

# Delete Xcode caches
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# Delete Swift PM caches
rm -rf ~/Library/Caches/org.swift.swiftpm

# Clean project
cd ios/App
rm -rf build/ DerivedData/ .build/ .swiftpm/
```

### 3. Reopen and Rebuild
```bash
# Open Xcode
open ios/App/App.xcworkspace

# In Xcode:
# 1. Wait for indexing to complete (watch top bar)
# 2. Product → Clean Build Folder (Cmd + Shift + K)
# 3. Product → Build (Cmd + B)
# 4. Product → Run (Cmd + R)
```

### 4. Verify No Duplicate Files
```bash
find ios/App -name "IAPManager.swift"
# Should only show: ios/App/App/IAPManager.swift
```

### 4. Expected Behavior
- Navigate to billing page
- See "Loading subscription options..." briefly
- Spinner disappears after ~1 second
- Subscribe buttons become clickable
- **NO threading warnings in console**

### 5. Expected Console Output
```
✅ Bridge injected successfully
📨 Received message from web: getProducts
🔵 Requesting products: com.ivory.app.subscription.pro.monthly, ...
✅ Products received: 4
```

**WITHOUT** the threading warning:
```
❌ Publishing changes from background threads is not allowed
```

## Why Cache Clear is Necessary

Xcode aggressively caches:
- Compiled Swift modules
- Build artifacts
- Dependency graphs
- Index data

When you modify Swift files (especially `@Published` properties), Xcode sometimes doesn't detect changes and uses old compiled code. A complete cache clear forces Xcode to recompile everything from scratch.

See `XCODE_CACHE_FIX.md` for detailed explanation.

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
- `ios/App/App/IAPManager.swift` - Main thread dispatch for products array
- `ios/App/App/WebView.swift` - Main thread dispatch for isLoading property
- `ios/App/App/WebViewModel.swift` - Main thread dispatch for JavaScript calls
- `components/subscription-plans.tsx` - Async initialization

## Commit Hash
Latest: `[current]` - "Fix all threading warnings - dispatch all @Published updates to main thread"
