# URGENT: IAP Fix Checklist for Apple Resubmission

## Apple Rejected Your App - Fix Required

**Rejection Reason:** Subscribe button doesn't work, IAP products not found

## DO THIS NOW (In Order)

### ☐ Step 1: Create IAP Products (30 minutes)

Go to: https://appstoreconnect.apple.com

1. Select your app
2. Go to Features → In-App Purchases
3. Click [+] to create new product

**Create these 4 products exactly:**

#### Subscription 1: Pro Monthly (for Clients)
- Click [+] → Auto-Renewable Subscription
- Product ID: `com.ivory.app.subscription.pro.monthly`
- Reference Name: `Pro Monthly Subscription`
- Subscription Group: Create new "Subscriptions"
- Duration: 1 Month
- Price: $19.99
- Display Name: `Pro Monthly`
- Description: `15 AI-generated nail designs per month with auto-recharge`
- Click Save → Submit for Review

#### Subscription 2: Business Monthly (for Nail Techs)
- Click [+] → Auto-Renewable Subscription
- Product ID: `com.ivory.app.subscription.business.monthly`
- Reference Name: `Business Monthly Subscription`
- Subscription Group: Select "Subscriptions"
- Duration: 1 Month
- Price: $59.99
- Display Name: `Business Monthly`
- Description: `Unlimited bookings + 40 AI designs per month with auto-recharge`
- Click Save → Submit for Review

#### Auto-Recharge Credits (Create 2 consumables):

**Product 3: 5 Credits**
- Click [+] → Consumable
- Product ID: `com.ivory.app.credits5` (NO DOT between credits and 5)
- Reference Name: `5 Credits`
- Price: $7.49
- Display Name: `5 Credits`
- Description: `5 AI-generated nail designs - Auto-recharge option`
- Save → Submit for Review

**Product 4: 10 Credits**
- Click [+] → Consumable
- Product ID: `com.ivory.app.credits10` (NO DOT between credits and 10)
- Reference Name: `10 Credits`
- Price: $14.99
- Display Name: `10 Credits`
- Description: `10 AI-generated nail designs - Auto-recharge option`
- Save → Submit for Review

### ☐ Step 2: Verify Paid Apps Agreement (2 minutes)

1. In App Store Connect, go to Agreements, Tax, and Banking
2. Check "Paid Apps Agreement" status
3. If not signed, click and complete it

### ☐ Step 3: Wait for Products to Sync (2-4 hours)

Apple needs time to sync products to sandbox. While waiting:

### ☐ Step 4: Rebuild App in Xcode (10 minutes)

```bash
# Open terminal and run:
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select "App" target
2. Go to "Signing & Capabilities"
3. Click "+ Capability"
4. Add "In-App Purchase"
5. Increment build number (General tab → Build field)
6. Select "Any iOS Device (arm64)"
7. Product → Archive
8. Distribute App → App Store Connect
9. Upload

### ☐ Step 5: Test with Sandbox Account (15 minutes)

**CRITICAL: Test before submitting to Apple**

1. On real iPhone, Settings → App Store → Sign Out
2. In Xcode, select your device
3. Build and run
4. Navigate to Billing page
5. Check Xcode console - should see products load
6. Tap "Subscribe to Pro"
7. Sign in with sandbox tester when prompted
8. Complete purchase
9. Verify subscription activates

**Expected Console Output:**
```
✅ Available IAP products: [
  { productId: "com.ivory.app.subscription.pro.monthly", price: 19.99, title: "Pro Monthly" },
  { productId: "com.ivory.app.credits.5", price: 7.49, title: "5 Credits" },
  { productId: "com.ivory.app.credits.10", price: 14.99, title: "10 Credits" }
]
```

**NOT:**
```
❌ Failed to load IAP products: {"code":"UNIMPLEMENTED"}
```

### ☐ Step 6: Submit New Build (5 minutes)

1. Go to App Store Connect
2. Select your app
3. Go to version 1.2 (or create 1.3)
4. Select new build
5. Click "Submit for Review"

### ☐ Step 7: Reply to Apple (5 minutes)

In App Store Connect:
1. Go to App Review → Messages
2. Click "Reply" on the rejection message
3. Use this response:

```
Dear App Review Team,

Thank you for identifying the IAP issues. We have resolved both problems and simplified our pricing model:

1. Subscribe Button Issue:
   - Fixed plugin registration bug
   - Tested successfully in sandbox
   - Build [YOUR_BUILD_NUMBER] includes fix

2. IAP Products Created:
   - Pro Monthly Subscription: $19.99/month (15 credits for clients)
   - Business Monthly Subscription: $59.99/month (40 credits + unlimited bookings for techs)
   - 5 Credits: $7.49 (com.ivory.app.credits5 - NO DOT)
   - 10 Credits: $14.99 (com.ivory.app.credits10 - NO DOT)
   - All products set to "Ready to Submit"

New Pricing Model:
- Clients: $19.99/month for 15 credits
- Techs: $59.99/month for 40 credits + unlimited bookings
- When credits hit 0, users can auto-recharge 5 or 10 credits
- Credits priced at $1.50 each in auto-recharge

Testing Steps:
1. Launch app as Client user
2. Tap profile icon → Billing
3. Scroll to subscription plans
4. Tap "Subscribe to Pro"
5. Apple purchase dialog appears
6. Complete with sandbox account
7. Verify 15 credits added

All IAP functionality tested and working in sandbox environment.

Best regards,
[Your Name]
```

## Timeline

| Task | Time | When |
|------|------|------|
| Create IAP products | 30 min | NOW |
| Verify agreement | 2 min | NOW |
| Wait for sync | 2-4 hours | Automatic |
| Rebuild app | 10 min | After sync |
| Test thoroughly | 15 min | After rebuild |
| Submit to Apple | 5 min | After testing |
| Reply to Apple | 5 min | After submit |

**Total active time:** ~1 hour
**Total elapsed time:** 3-5 hours (including Apple sync)

## Critical Warnings

⚠️ **DO NOT skip testing** - Apple will reject again if it doesn't work
⚠️ **DO NOT test in Simulator** - IAP only works on real devices
⚠️ **DO NOT use real Apple ID** - Must use sandbox tester account
⚠️ **DO NOT submit without products** - Create all 7 products first
⚠️ **DO NOT forget capability** - Must add "In-App Purchase" in Xcode

## Success Criteria

Before submitting to Apple, verify:

- ✅ All 4 products created in App Store Connect (2 subscriptions + 2 credit packages)
- ✅ All products show "Ready to Submit" status
- ✅ Paid Apps Agreement signed
- ✅ In-App Purchase capability added in Xcode
- ✅ New build uploaded to App Store Connect
- ✅ Tested on real device with sandbox account
- ✅ Products load successfully (not empty array)
- ✅ Subscribe button shows Apple dialog
- ✅ Purchase completes successfully
- ✅ 15 credits added on subscription (not 20)

## If You Get Stuck

1. Check `APPLE_REVIEW_IAP_REJECTION_RESPONSE.md` for detailed info
2. Check `IAP_VISUAL_GUIDE.md` for step-by-step screenshots
3. Check Xcode console for specific error messages
4. Verify products exist in App Store Connect
5. Wait full 4 hours for Apple sync if products just created

## Current Status

- ✅ Code fixed (committed to git)
- ⏳ Products need creation (DO THIS NOW)
- ⏳ App needs rebuild
- ⏳ Testing required
- ⏳ Resubmission needed

## START HERE

**Right now, open:** https://appstoreconnect.apple.com

**Then create:** All 7 IAP products listed in Step 1 above

**Time estimate:** 30 minutes to create products, then wait 2-4 hours for sync
