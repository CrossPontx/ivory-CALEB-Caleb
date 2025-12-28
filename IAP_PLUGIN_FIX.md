# IAP Plugin Fix - Products Not Loading

## Issues Found

1. **Plugin not properly registered with Capacitor** - The `UNIMPLEMENTED` error means Capacitor can't find the plugin
2. **Camera simulator error** - Error -12782 is expected in iOS Simulator (camera not available)
3. **Missing In-App Purchase capability** in Xcode project

## Fixes Applied

### 1. Updated IAPPlugin.swift

The plugin now properly implements `CAPBridgedPlugin` protocol with:
- Explicit plugin identifier and JS name
- Proper method registration
- Better call handling with pending calls dictionary
- Proper lifecycle management (load/deinit)

### 2. Required Xcode Configuration

You need to complete these steps in Xcode:

#### A. Add In-App Purchase Capability

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "In-App Purchase"

#### B. Configure Product IDs in App Store Connect

Your product IDs are defined in `lib/iap.ts` and now match your bundle ID `com.ivory.app`:

**Client Subscriptions:**
- `com.ivory.app.subscription.pro` - Pro Monthly ($20/month)

**Tech Subscriptions:**
- `com.ivory.app.subscription.business` - Business Monthly ($60/month)

**Credit Packages:**
- `com.ivory.app.credits.5` - 5 credits
- `com.ivory.app.credits.10` - 10 credits
- `com.ivory.app.credits.25` - 25 credits
- `com.ivory.app.credits.50` - 50 credits
- `com.ivory.app.credits.100` - 100 credits

**Booking Tiers:**
- `com.ivory.app.booking.tier1` - $0-50
- `com.ivory.app.booking.tier2` - $51-100
- `com.ivory.app.booking.tier3` - $101-150
- `com.ivory.app.booking.tier4` - $151-200
- `com.ivory.app.booking.tier5` - $201+

#### C. Create Products in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to "Features" → "In-App Purchases"
4. Create each product with the exact Product ID listed above
5. Set pricing, descriptions, and screenshots
6. Submit for review

#### D. Test with Sandbox Account

1. In Xcode, go to Settings → App Store Connect
2. Add a Sandbox Tester account
3. Sign out of your real Apple ID on the test device
4. When prompted during purchase, sign in with sandbox account

### 3. Testing on Real Device

The IAP system **cannot be tested in the iOS Simulator**. You must:

1. Build to a real iOS device
2. Use a Sandbox tester account
3. Products must be created in App Store Connect (can be in "Ready to Submit" status)

### 4. Bundle ID Now Matches

Bundle ID and product IDs are now aligned:
- Bundle ID: `com.ivory.app`
- Product IDs: `com.ivory.app.*`

All product IDs have been updated in `lib/iap.ts` to match your bundle ID.

## Quick Fix Checklist

- [x] Updated IAPPlugin.swift with proper Capacitor registration
- [x] Fixed product IDs to match bundle ID (com.ivory.app.*)
- [ ] Open Xcode and add "In-App Purchase" capability
- [ ] Create all products in App Store Connect with new product IDs
- [ ] Create Sandbox tester account
- [ ] Test on real iOS device (not simulator)

## Testing Commands

```bash
# Rebuild iOS app
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select a real device (not simulator)
# 2. Build and run
# 3. Navigate to billing page
# 4. Try to subscribe
```

## Expected Behavior After Fix

1. App loads IAP products on billing page
2. Console shows: `Available IAP products: [...]` with actual products
3. Clicking subscribe button initiates purchase flow
4. Sandbox account prompt appears
5. After purchase, receipt is validated with your server

## Common Issues

### "Cannot connect to iTunes Store"
- You're in Simulator (use real device)
- No internet connection
- Sandbox account not configured

### "Product not available"
- Product not created in App Store Connect
- Product ID mismatch
- Product not approved (needs "Ready to Submit" status)

### "Invalid Product ID"
- Bundle ID doesn't match product ID prefix
- Typo in product ID
- Product not synced (wait 24 hours after creation)

## Camera Error (Separate Issue)

The camera error `-12782` is expected in iOS Simulator. This is not related to IAP and will work fine on real devices.

## Next Steps

1. Open Xcode: `npx cap open ios`
2. Add In-App Purchase capability
3. Fix bundle ID mismatch
4. Create products in App Store Connect
5. Test on real device with sandbox account
