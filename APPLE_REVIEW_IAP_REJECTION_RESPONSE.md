# Apple Review IAP Rejection - URGENT Response

## Rejection Summary

**Date:** December 27, 2025
**Submission ID:** fb572a86-1c5e-441e-8b5b-23efe4e148f2
**Issues:**
1. Subscribe to Pro button produces no purchase flow
2. Cannot locate IAP products: Credits 20, Credits 60, Business, and 60 Credits

## Root Cause

The IAP plugin has a bug (`UNIMPLEMENTED` error) AND the product IDs in App Store Connect don't match what the app is requesting.

## URGENT: Fix Required Before Next Submission

### Issue 1: Plugin Not Working (UNIMPLEMENTED)

**Status:** Code fixed, but NOT yet built into the app

**What Apple Sees:**
```
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
⚡️  [log] - Available IAP products: []
```

**Fix Applied (needs rebuild):**
- ✅ Updated IAPPlugin.swift with proper Capacitor registration
- ✅ Fixed product IDs to match bundle ID
- ⏳ MUST rebuild and resubmit to Apple

### Issue 2: Product ID Mismatch

**What Apple is Looking For:**
- Credits 20
- Credits 60  
- Business
- 60 Credits

**What Your App Requests:**
- `com.ivory.app.subscription.pro`
- `com.ivory.app.subscription.business`
- `com.ivory.app.credits.*`

**Problem:** Product names don't match product IDs!

## CRITICAL ACTIONS REQUIRED

### Step 1: Create IAP Products in App Store Connect (DO THIS NOW)

Go to [App Store Connect](https://appstoreconnect.apple.com) → Your App → Features → In-App Purchases

#### Required Products for Apple Review:

**1. Pro Subscription (for clients)**
- Product ID: `com.ivory.app.subscription.pro`
- Reference Name: `Pro Monthly Subscription`
- Type: Auto-Renewable Subscription
- Subscription Group: Create "Subscriptions"
- Duration: 1 Month
- Price: $19.99
- Display Name: `Pro Monthly`
- Description: `20 AI-generated nail designs per month`

**2. Business Subscription (for techs)**
- Product ID: `com.ivory.app.subscription.business`
- Reference Name: `Business Monthly Subscription`
- Type: Auto-Renewable Subscription
- Subscription Group: Same as above
- Duration: 1 Month
- Price: $59.99
- Display Name: `Business Monthly`
- Description: `Unlimited bookings and premium features for nail technicians`

**3. Credit Packages (consumables)**

Create these 5 products:

| Product ID | Reference Name | Price | Display Name | Description |
|------------|---------------|-------|--------------|-------------|
| `com.ivory.app.credits.5` | 5 Credits | $4.99 | 5 Credits | 5 AI-generated nail designs |
| `com.ivory.app.credits.10` | 10 Credits | $9.99 | 10 Credits | 10 AI-generated nail designs |
| `com.ivory.app.credits.25` | 25 Credits | $19.99 | 25 Credits | 25 AI-generated nail designs |
| `com.ivory.app.credits.50` | 50 Credits | $34.99 | 50 Credits | 50 AI-generated nail designs |
| `com.ivory.app.credits.100` | 100 Credits | $59.99 | 100 Credits | 100 AI-generated nail designs |

**Important:** Set all products to "Ready to Submit" status

### Step 2: Verify Paid Apps Agreement

1. Go to App Store Connect → Agreements, Tax, and Banking
2. Verify "Paid Apps Agreement" is signed
3. If not signed, complete it now

### Step 3: Rebuild App with IAP Fix

```bash
# In Xcode (if not already done):
# 1. Add "In-App Purchase" capability
# 2. Build new version
# 3. Archive for App Store

# Increment build number
# Submit new build to App Store Connect
```

### Step 4: Reply to Apple Review

Use this response template:

---

**Subject:** Re: Guideline 2.1 - IAP Products Issue

Dear App Review Team,

Thank you for identifying the In-App Purchase issues. We have resolved both problems:

**Issue 1: Subscribe Button Not Working**
- Root cause: Plugin registration bug causing "UNIMPLEMENTED" error
- Fix: Updated IAP plugin implementation to properly register with Capacitor
- Status: Fixed in new build [BUILD_NUMBER]

**Issue 2: Missing IAP Products**
- Root cause: Products were not created in App Store Connect
- Fix: Created all required IAP products with proper configuration
- Products created:
  - Pro Monthly Subscription (com.ivory.app.subscription.pro) - $19.99/month
  - Business Monthly Subscription (com.ivory.app.subscription.business) - $59.99/month
  - 5 Credits (com.ivory.app.credits.5) - $4.99
  - 10 Credits (com.ivory.app.credits.10) - $9.99
  - 25 Credits (com.ivory.app.credits.25) - $19.99
  - 50 Credits (com.ivory.app.credits.50) - $34.99
  - 100 Credits (com.ivory.app.credits.100) - $59.99

**How to Test:**
1. Launch app as Client user type
2. Navigate to Settings → Billing (or tap profile icon → Billing)
3. Scroll to subscription plans section
4. Tap "Subscribe to Pro" button
5. Apple purchase dialog should appear
6. Complete purchase with sandbox account
7. Subscription activates successfully

**Additional Notes:**
- All IAP products are configured for sandbox testing
- Paid Apps Agreement is active
- Products are set to "Ready to Submit" status
- IAP functionality tested successfully in sandbox environment

We have submitted build [BUILD_NUMBER] with these fixes. Please let us know if you need any additional information.

Best regards,
[Your Name]

---

## Timeline

**Immediate (Today):**
- [ ] Create all 7 IAP products in App Store Connect
- [ ] Verify Paid Apps Agreement signed
- [ ] Add In-App Purchase capability in Xcode (if not done)

**Within 24 Hours:**
- [ ] Build new version with IAP fix
- [ ] Test thoroughly with sandbox account
- [ ] Archive and upload to App Store Connect
- [ ] Submit new build for review
- [ ] Reply to Apple with explanation

**Expected:**
- Apple will re-review within 1-2 days
- IAP should work correctly this time

## Testing Checklist Before Resubmission

Test on real device with sandbox account:

- [ ] App launches successfully
- [ ] Navigate to Billing page
- [ ] See subscription plans displayed
- [ ] See prices displayed correctly
- [ ] Tap "Subscribe to Pro" button
- [ ] Apple purchase dialog appears
- [ ] Complete purchase with sandbox account
- [ ] Subscription activates
- [ ] Credits are added to account
- [ ] Can generate designs with credits

## Critical Notes

1. **DO NOT submit until products are created** - Apple will reject again
2. **DO NOT submit without testing** - Verify IAP works in sandbox first
3. **Products need 2-4 hours to sync** - Wait after creating them
4. **Must test on real device** - Simulator won't work
5. **Must use sandbox account** - Real Apple ID won't work in test mode

## Current Status

- ✅ Code fixed (IAPPlugin.swift updated)
- ✅ Product IDs updated (lib/iap.ts)
- ⏳ Products need to be created in App Store Connect
- ⏳ New build needs to be submitted
- ⏳ Apple response needed

## Next Immediate Action

**RIGHT NOW:** Go to App Store Connect and create the 7 IAP products listed above.

**THEN:** Rebuild app in Xcode with In-App Purchase capability added.

**FINALLY:** Test thoroughly before resubmitting to Apple.
