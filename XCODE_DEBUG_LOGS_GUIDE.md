# Xcode Debug Logs Guide - IAP Plugin

## What Was Added

I've added comprehensive logging to the IAP plugin using Apple's `os.log` framework. This will show you exactly what's happening at each step.

## Log Symbols

- 🟢 **Green Circle** - Initialization/startup events
- 🔵 **Blue Circle** - Normal operations/info
- ✅ **Green Check** - Success events
- ⚠️ **Warning** - Non-critical issues
- ❌ **Red X** - Errors
- 📦 **Package** - Product information

## How to View Logs in Xcode

### Method 1: Xcode Console (Basic)

1. Open Xcode: `yarn cap open ios`
2. Build and run on your device (Cmd+R)
3. Look at the bottom panel - this is the Debug Console
4. If you don't see it: `View` → `Debug Area` → `Show Debug Area` (Cmd+Shift+Y)

### Method 2: Console App (Advanced - Recommended)

This gives you much better filtering and search:

1. Open the **Console** app on your Mac (in `/Applications/Utilities/`)
2. Connect your iPhone via USB
3. Select your iPhone in the left sidebar
4. In the search bar at top right, type: `com.ivory.app`
5. Click "Start" to begin streaming logs
6. Run your app from Xcode
7. Watch the logs in real-time with color coding

### Method 3: Xcode Debug Navigator

1. In Xcode, run the app
2. Click the Debug Navigator icon (speech bubble icon in left sidebar)
3. Select your device
4. View logs in the console

## What to Look For

### 1. Plugin Initialization (App Launch)

**✅ SUCCESS - Plugin loads:**
```
🟢 AppDelegate: Application did finish launching
🟢 IAPPlugin: load() called - Plugin is initializing
🟢 IAPPlugin: Added as payment queue observer
✅ IAPPlugin: Device CAN make payments
```

**❌ FAILURE - Plugin doesn't load:**
```
🟢 AppDelegate: Application did finish launching
(No IAPPlugin logs appear)
```
**Diagnosis:** Plugin not in build target or not discovered by Capacitor

### 2. Getting Products (When Subscription Page Loads)

**✅ SUCCESS - Plugin receives call:**
```
🔵 IAPPlugin: getProducts() called
🔵 IAPPlugin: Requesting 2 products: com.ivory.app.subscription.pro.monthly, com.ivory.app.subscription.business.monthly
🔵 IAPPlugin: Starting products request...
✅ IAPPlugin: Products request succeeded
🔵 IAPPlugin: Received 2 valid products
📦 IAPPlugin: Product - com.ivory.app.subscription.pro.monthly | Pro Monthly | $19.99
📦 IAPPlugin: Product - com.ivory.app.subscription.business.monthly | Business Monthly | $59.99
✅ IAPPlugin: Resolving getProducts call with 2 products
```

**⚠️ PARTIAL SUCCESS - Plugin works but no products:**
```
🔵 IAPPlugin: getProducts() called
🔵 IAPPlugin: Requesting 2 products: com.ivory.app.subscription.pro.monthly, com.ivory.app.subscription.business.monthly
🔵 IAPPlugin: Starting products request...
✅ IAPPlugin: Products request succeeded
🔵 IAPPlugin: Received 0 valid products
🔵 IAPPlugin: Received 2 invalid product IDs
⚠️ IAPPlugin: Invalid product IDs: com.ivory.app.subscription.pro.monthly, com.ivory.app.subscription.business.monthly
✅ IAPPlugin: Resolving getProducts call with 0 products
```
**Diagnosis:** Plugin works! But products don't exist in App Store Connect yet.

**❌ FAILURE - Plugin not called:**
```
(No IAPPlugin logs appear when you tap Subscribe)
```
**Diagnosis:** JavaScript can't find the plugin - `UNIMPLEMENTED` error

**❌ FAILURE - StoreKit error:**
```
🔵 IAPPlugin: getProducts() called
🔵 IAPPlugin: Requesting 2 products: ...
🔵 IAPPlugin: Starting products request...
❌ IAPPlugin: Products request FAILED: Cannot connect to iTunes Store
❌ IAPPlugin: Error domain: SKErrorDomain, code: 0
```
**Diagnosis:** Network issue or sandbox account problem

### 3. Making a Purchase

**✅ SUCCESS:**
```
🔵 IAPPlugin: purchase() called
🔵 IAPPlugin: Attempting to purchase: com.ivory.app.subscription.pro.monthly
✅ IAPPlugin: Product found: Pro Monthly - 19.99
🔵 IAPPlugin: Adding payment to queue...
🔵 IAPPlugin: Payment queue updated with 1 transactions
🔵 IAPPlugin: Transaction com.ivory.app.subscription.pro.monthly - State: PURCHASED
✅ IAPPlugin: Purchase completed for com.ivory.app.subscription.pro.monthly
✅ IAPPlugin: Receipt data obtained (2847 bytes)
🔵 IAPPlugin: Notifying listeners of purchase completion
✅ IAPPlugin: Resolving pending purchase call
```

**❌ FAILURE - User cancelled:**
```
🔵 IAPPlugin: purchase() called
🔵 IAPPlugin: Attempting to purchase: com.ivory.app.subscription.pro.monthly
✅ IAPPlugin: Product found: Pro Monthly - 19.99
🔵 IAPPlugin: Adding payment to queue...
🔵 IAPPlugin: Payment queue updated with 1 transactions
🔵 IAPPlugin: Transaction com.ivory.app.subscription.pro.monthly - State: FAILED
❌ IAPPlugin: Purchase FAILED for com.ivory.app.subscription.pro.monthly - Code: 2, Message: User cancelled
```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 0 | Cannot connect to iTunes Store | Check network, verify sandbox account |
| 2 | User cancelled | Normal - user tapped Cancel |
| 3 | Invalid product ID | Product doesn't exist in App Store Connect |
| 5 | Payment not allowed | IAP disabled in device settings |

## Filtering Logs in Console App

Use these search terms in the Console app:

- `com.ivory.app` - All app logs
- `IAPPlugin` - Only IAP plugin logs
- `🟢` or `✅` or `❌` - Filter by emoji (yes, this works!)
- `getProducts` - Only product loading
- `purchase` - Only purchase attempts
- `FAILED` or `ERROR` - Only errors

## Testing Checklist with Logs

### Test 1: Plugin Loads
- [ ] Run app
- [ ] See `🟢 IAPPlugin: load() called`
- [ ] See `✅ IAPPlugin: Device CAN make payments`

### Test 2: Products Load
- [ ] Navigate to subscription page
- [ ] See `🔵 IAPPlugin: getProducts() called`
- [ ] See `✅ IAPPlugin: Products request succeeded`
- [ ] Check product count: `🔵 IAPPlugin: Received X valid products`

### Test 3: Purchase Flow
- [ ] Tap Subscribe button
- [ ] See `🔵 IAPPlugin: purchase() called`
- [ ] See `✅ IAPPlugin: Product found`
- [ ] See `🔵 IAPPlugin: Adding payment to queue`
- [ ] Complete or cancel purchase
- [ ] See final state (PURCHASED or FAILED)

## Expected Results

### If Plugin is NOT Registered (UNIMPLEMENTED)
You will see:
- ✅ AppDelegate logs
- ❌ NO IAPPlugin logs at all
- JavaScript error: `{"code":"UNIMPLEMENTED"}`

**Fix:** Check Target Membership in Xcode

### If Plugin Works but No Products
You will see:
- ✅ All IAPPlugin logs
- ✅ `getProducts() called`
- ✅ `Products request succeeded`
- ⚠️ `Received 0 valid products`
- ⚠️ `Invalid product IDs: ...`

**Fix:** Create products in App Store Connect

### If Everything Works
You will see:
- ✅ All IAPPlugin logs
- ✅ `Received 2 valid products`
- ✅ Product details with prices
- ✅ Purchase flow completes

## Saving Logs

In Console app:
1. Select all logs (Cmd+A)
2. Right-click → "Save Selection"
3. Save as text file to share

In Xcode:
1. Right-click in console
2. "Save Console Output"
3. Save as text file

## Next Steps

1. **Run the app** with these new logs
2. **Navigate to subscription page**
3. **Copy the logs** from Console app or Xcode
4. **Share the logs** so we can see exactly what's happening

The logs will tell us definitively:
- ✅ Is the plugin loading?
- ✅ Is it receiving calls from JavaScript?
- ✅ Are products being requested from StoreKit?
- ✅ What is StoreKit returning?
- ✅ Are there any errors?
