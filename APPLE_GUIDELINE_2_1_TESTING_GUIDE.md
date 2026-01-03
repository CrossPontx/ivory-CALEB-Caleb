# Apple Guideline 2.1 - Subscribe Button Testing Guide

## Pre-Testing Checklist

### 1. Verify App Store Connect Configuration
- [ ] All product IDs are in "Ready to Submit" status
- [ ] Product IDs match exactly:
  - `com.ivory.app.subscription.pro.monthly`
  - `com.ivory.app.subscription.business.monthly`
- [ ] Bundle ID is correct: `com.ivory.app`
- [ ] Paid Apps Agreement is signed
- [ ] Tax forms are completed

### 2. Verify Device Settings
- [ ] Device is signed in with Apple ID
- [ ] In-App Purchases are enabled:
  - Settings > Screen Time > Content & Privacy Restrictions
  - Ensure "In-App Purchases" is ON
- [ ] Device has internet connection
- [ ] Using iOS 15.0 or later

### 3. Build Configuration
- [ ] Using Release or TestFlight build (not Debug)
- [ ] Correct provisioning profile
- [ ] Correct bundle identifier
- [ ] StoreKit configuration file (optional for testing)

## Testing Steps

### Test 1: App Launch & IAP Initialization

**Expected Console Logs:**
```
🔵 IAPInitializer: Starting initialization...
🔵 Initializing IAP (attempt 1/3)...
🔵 Platform: ios
🟢 IAPPlugin: load() called - Plugin is initializing
🟢 IAPPlugin: Added as payment queue observer
✅ IAPPlugin: Device CAN make payments
🔵 IAPPlugin: getProducts() called
🔵 IAPPlugin: Requesting 4 products: com.ivory.app.subscription.pro.monthly, ...
✅ IAPPlugin: Products request succeeded
✅ IAP initialized with 4 products
📦 com.ivory.app.subscription.pro.monthly: Pro Monthly - $19.99
📦 com.ivory.app.subscription.business.monthly: Business Monthly - $59.99
✅ IAPInitializer: App initialization complete
```

**If you see errors:**
- `❌ IAPPlugin: Device CANNOT make payments` → Check device settings
- `⚠️ IAPPlugin: Invalid product IDs` → Check App Store Connect
- `❌ Failed to initialize IAP` → Check internet connection

### Test 2: Navigate to Billing Page

**Steps:**
1. Open app
2. Navigate to Settings or Profile
3. Tap "Billing & Credits"

**Expected Console Logs:**
```
🔵 Billing page loaded
🔵 Platform: ios
🔵 Is native platform: true
```

**Expected UI:**
- "Loading subscription options..." appears briefly
- Subscription plans appear with prices from App Store
- "Subscribe to Pro" button is visible and enabled

**If you see errors:**
- Red error box → Products failed to load
- "Retry" button → Tap to reload products

### Test 3: Tap Subscribe Button (iPhone)

**Steps:**
1. Scroll to Pro or Business plan
2. Tap "Subscribe to Pro" button

**Expected Console Logs:**
```
🔵 Button clicked for plan: pro
🔵 handleSubscribe called with planId: pro
🔵 isNative: true
🔵 loading state: null
🔵 iapProducts loaded: 4
🔵 Using IAP flow
🔵 Starting IAP purchase for plan: pro
🔵 Mapped to product ID: com.ivory.app.subscription.pro.monthly
🔵 Available IAP products: com.ivory.app.subscription.pro.monthly, ...
✅ Product found: Pro Monthly - $19.99
🔵 Initiating purchase...
🔵 IAPPlugin: purchase() called
🔵 IAPPlugin: Attempting to purchase: com.ivory.app.subscription.pro.monthly
✅ IAPPlugin: Product found: Pro Monthly - 19.99
🔵 IAPPlugin: Adding payment to queue...
✅ Purchase initiated successfully
```

**Expected UI:**
1. Button shows "Processing..." with spinner
2. Apple payment sheet appears
3. Shows product name, price, and subscription details

**If button doesn't respond:**
- Check console for error messages
- Verify products are loaded: Look for `iapProducts loaded: X` where X > 0
- Check if button is disabled: Look for disabled styling

### Test 4: Complete Purchase (Sandbox)

**Steps:**
1. In Apple payment sheet, tap "Subscribe"
2. Authenticate with Face ID/Touch ID/Password
3. Use sandbox test account

**Expected Console Logs:**
```
🔵 IAPPlugin: Payment queue updated with 1 transactions
🔵 IAPPlugin: Transaction com.ivory.app.subscription.pro.monthly - State: PURCHASED
✅ IAPPlugin: Purchase completed for com.ivory.app.subscription.pro.monthly
✅ IAPPlugin: Receipt data obtained (XXXX bytes)
🔵 IAPPlugin: Notifying listeners of purchase completion
✅ Purchase completed: com.ivory.app.subscription.pro.monthly
✅ Receipt validated successfully
✅ Transaction finished
```

**Expected UI:**
1. Payment sheet dismisses
2. Success toast appears
3. Page reloads
4. Plan shows "Current Plan" badge

### Test 5: Cancel Purchase

**Steps:**
1. Tap "Subscribe to Pro"
2. In payment sheet, tap "Cancel"

**Expected Console Logs:**
```
❌ IAPPlugin: Purchase FAILED for com.ivory.app.subscription.pro.monthly
ℹ️ User cancelled purchase
```

**Expected UI:**
1. Payment sheet dismisses
2. Button returns to normal state
3. No error message (cancellation is normal)

### Test 6: Test on Apple Watch

**Steps:**
1. Open app on Apple Watch
2. Navigate to subscription screen
3. Tap "Subscribe" button

**Expected Behavior:**
- Button responds to tap
- Apple payment sheet appears on Watch
- Can complete purchase on Watch

**Note:** Watch may prompt to complete on iPhone for some payment methods

## Common Issues & Solutions

### Issue 1: Button Appears Disabled
**Symptoms:**
- Button is grayed out
- Button doesn't respond to taps

**Debug Steps:**
1. Check console for `iapProducts loaded: X`
2. If X = 0, products didn't load
3. Look for error messages in console
4. Check internet connection
5. Verify App Store Connect configuration

**Solution:**
- Tap "Retry" button if visible
- Restart app
- Check device settings for IAP restrictions

### Issue 2: "Product not found" Error
**Symptoms:**
- Button taps but shows error toast
- Console shows `❌ Product not found in available products`

**Debug Steps:**
1. Check console for available products list
2. Verify product IDs match exactly
3. Check App Store Connect product status

**Solution:**
- Ensure products are "Ready to Submit" in App Store Connect
- Verify bundle ID matches
- Wait 24 hours after creating products
- Try on different device

### Issue 3: Payment Sheet Doesn't Appear
**Symptoms:**
- Button shows "Processing..." but nothing happens
- No payment sheet appears

**Debug Steps:**
1. Check console for `Adding payment to queue...`
2. Look for StoreKit errors
3. Verify device can make payments

**Solution:**
- Check device IAP settings
- Sign out and back into Apple ID
- Restart device
- Try different Apple ID

### Issue 4: Products Not Loading
**Symptoms:**
- Red error box appears
- "Failed to load subscription options"

**Debug Steps:**
1. Check console for `Products request FAILED`
2. Look for error details
3. Check internet connection

**Solution:**
- Tap "Retry" button
- Check internet connection
- Verify App Store Connect configuration
- Wait and try again (App Store may be slow)

## Xcode Console Monitoring

### Key Logs to Watch For

**✅ Success Indicators:**
- `🟢 IAPPlugin: load() called`
- `✅ IAPPlugin: Device CAN make payments`
- `✅ IAPPlugin: Products request succeeded`
- `📦` Product listings
- `🔵 IAPPlugin: Adding payment to queue...`
- `✅ IAPPlugin: Purchase completed`

**❌ Error Indicators:**
- `❌ IAPPlugin: Device CANNOT make payments`
- `⚠️ IAPPlugin: Invalid product IDs`
- `❌ IAPPlugin: Products request FAILED`
- `❌ Product not found in available products`
- `❌ Failed to initialize IAP`

### Filtering Logs in Xcode

1. Open Xcode Console
2. In search box, enter: `IAP`
3. This will show only IAP-related logs
4. Look for emoji indicators: 🟢 ✅ 🔵 ❌ ⚠️

## Testing with StoreKit Configuration File (Optional)

For faster testing without App Store Connect:

1. Create StoreKit Configuration file in Xcode
2. Add products matching your product IDs
3. Run app with StoreKit configuration
4. Test purchase flows locally

**Note:** Final testing must be done with real App Store Connect products

## Submission Testing Notes

When submitting to Apple, include these testing notes:

```
TESTING INSTRUCTIONS FOR IN-APP PURCHASES:

1. Launch app on iPhone or Apple Watch
2. Navigate to Settings > Billing & Credits
3. Scroll to subscription plans
4. Tap "Subscribe to Pro" button
5. Apple payment sheet will appear
6. Complete purchase with sandbox test account

Test Account:
Email: [your sandbox test account]
Password: [password]

Expected Behavior:
- Button responds immediately to tap
- Apple payment sheet appears within 1-2 seconds
- Purchase completes successfully
- Credits are added to account
- Subscription status updates

The app uses Apple's StoreKit for all subscription purchases.
All products are configured in App Store Connect and ready for review.
```

## Final Checklist Before Submission

- [ ] Tested on physical iPhone device
- [ ] Tested on Apple Watch (if applicable)
- [ ] All console logs show successful IAP initialization
- [ ] Button responds to taps
- [ ] Payment sheet appears
- [ ] Purchase completes successfully
- [ ] Subscription status updates correctly
- [ ] No error messages in normal flow
- [ ] Error states show helpful messages
- [ ] Retry button works when products fail to load
- [ ] App handles cancellations gracefully
- [ ] Receipt validation works
- [ ] Credits are added correctly

## Video Recording for Apple

Record a video showing:
1. App launch
2. Navigate to Billing page
3. Tap "Subscribe to Pro" button
4. Apple payment sheet appears
5. Complete purchase
6. Success confirmation
7. Updated subscription status

This video can be uploaded to App Store Connect as proof that IAP works correctly.
