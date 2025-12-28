# IAP Quick Fix - Get Subscriptions Working

## The Problem

Your logs show: `Failed to load IAP products: {"code":"UNIMPLEMENTED"}`

This means the IAP plugin isn't being recognized by Capacitor.

## The Solution (3 Steps)

### Step 1: Sync and Open Xcode

```bash
npx cap sync ios
npx cap open ios
```

### Step 2: Add In-App Purchase Capability in Xcode

1. In Xcode, select the "App" target (top left)
2. Click "Signing & Capabilities" tab
3. Click "+ Capability" button
4. Search for and add "In-App Purchase"
5. Save (Cmd+S)

### Step 3: Create Products in App Store Connect

Go to [App Store Connect](https://appstoreconnect.apple.com) and create these products:

**For Client Subscriptions:**
- Product ID: `com.ivory.app.subscription.pro.monthly`
- Type: Auto-Renewable Subscription
- Price: $19.99/month
- Name: "Pro Monthly"

**For Tech Subscriptions:**
- Product ID: `com.ivory.app.subscription.business.monthly`
- Type: Auto-Renewable Subscription
- Price: $59.99/month
- Name: "Business Monthly"

**For Credits (optional, create as needed):**
- `com.ivory.app.credits.5` - $4.99
- `com.ivory.app.credits.10` - $9.99
- `com.ivory.app.credits.25` - $19.99
- `com.ivory.app.credits.50` - $34.99
- `com.ivory.app.credits.100` - $59.99

### Step 4: Test on Real Device

**IMPORTANT:** IAP doesn't work in Simulator!

1. Connect a real iPhone/iPad
2. In Xcode, select your device from the device dropdown
3. Click Run (Cmd+R)
4. Navigate to billing page
5. Try to subscribe

## What Changed

I've fixed:
1. ✅ IAPPlugin.swift - Now properly implements CAPBridgedPlugin
2. ✅ Product IDs - Updated to match your bundle ID (com.ivory.app)
3. ✅ Call handling - Better async handling for purchases
4. ✅ PRODUCT_TIERS mapping - Updated to use new product IDs

**Important:** The tier mapping changed:
- Old: `com.yourcompany.ivory.business2` → New: `com.ivory.app.subscription.pro.monthly` (client tier)
- Old: `com.yourcompany.ivory.pro` → New: `com.ivory.app.subscription.business.monthly` (tech tier)

## Testing with Sandbox

1. Go to Settings → App Store → Sandbox Account
2. Sign out of your real Apple ID
3. When you try to purchase, sign in with a sandbox tester account
4. Create sandbox testers in App Store Connect → Users and Access → Sandbox Testers

## Expected Result

After these fixes, you should see:
```
⚡️  [log] - Available IAP products: [
  {
    productId: "com.ivory.app.subscription.pro.monthly",
    title: "Pro Monthly",
    price: 19.99,
    priceString: "$19.99"
  },
  {
    productId: "com.ivory.app.subscription.business.monthly",
    title: "Business Monthly",
    price: 59.99,
    priceString: "$59.99"
  }
]
```

## Still Not Working?

Check:
- [ ] Testing on real device (not simulator)
- [ ] Products created in App Store Connect
- [ ] Products are "Ready to Submit" status
- [ ] Bundle ID matches: com.ivory.app
- [ ] In-App Purchase capability added in Xcode
- [ ] Waited 2-4 hours after creating products (Apple sync delay)

## Camera Error (Ignore)

The camera error `-12782` is normal in Simulator. It will work fine on real devices.
