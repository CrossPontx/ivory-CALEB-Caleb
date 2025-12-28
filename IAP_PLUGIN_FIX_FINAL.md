# IAP Plugin Fix - UNIMPLEMENTED Error

## Root Cause
The custom `IAPPlugin.swift` exists but isn't being recognized by Capacitor, causing `UNIMPLEMENTED` error.

## Solution: Ensure Plugin is in Xcode Build

### Step 1: Open Xcode
```bash
yarn cap open ios
```

### Step 2: Verify IAPPlugin.swift is in Build
1. In Xcode, select the `App` target
2. Go to `Build Phases` tab
3. Expand `Compile Sources`
4. **Check if `IAPPlugin.swift` is listed**
   - ✅ If YES: It's included, move to Step 3
   - ❌ If NO: Click `+` and add `IAPPlugin.swift`

### Step 3: Clean and Rebuild
1. `Product` → `Clean Build Folder` (Cmd+Shift+K)
2. Delete app from device/simulator
3. `Product` → `Build` (Cmd+B)
4. `Product` → `Run` (Cmd+R)

### Step 4: Verify Plugin Loads
Check console logs - you should see:
```
⚡️  [log] - Available IAP products: [...]
```

Instead of:
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
```

## Alternative: Use Community Plugin

If the custom plugin continues to have issues, install a maintained plugin:

```bash
yarn add @capacitor-community/in-app-purchases
yarn cap sync ios
```

Then update `lib/iap.ts`:
```typescript
import { InAppPurchases } from '@capacitor-community/in-app-purchases';

export async function loadProducts(productIds: string[]) {
  const { products } = await InAppPurchases.getProducts({ productIds });
  return products;
}
```

## Why This Happened

Capacitor 8 uses `CAPBridgedPlugin` protocol which should auto-register plugins, but:
- The Swift file might not be in the Xcode build target
- The app might need a clean rebuild
- Capacitor might not have synced properly

## Next Steps After Fix

1. ✅ Rebuild iOS app with plugin included
2. ✅ Create products in App Store Connect:
   - `com.ivory.app.subscription.pro.monthly` - $19.99/month
   - `com.ivory.app.subscription.business.monthly` - $59.99/month
3. ✅ Wait 15-30 mins for products to sync
4. ✅ Test subscription purchase flow
5. ✅ Submit for Apple Review

## Testing Checklist

- [ ] Plugin loads without UNIMPLEMENTED error
- [ ] Products array is not empty
- [ ] Can initiate purchase
- [ ] Receipt validation works
- [ ] Credits are awarded correctly
