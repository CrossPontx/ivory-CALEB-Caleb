# IAP Fix Checklist

Use this checklist to track your progress fixing the IAP issue.

## ✅ Code Changes (Done)

- [x] Updated IAPPlugin.swift with CAPBridgedPlugin
- [x] Fixed product IDs to match bundle ID (com.ivory.app)
- [x] Updated PRODUCT_TIERS mapping
- [x] Verified validation route uses correct IDs
- [x] Created documentation

## 🔧 Xcode Setup (You Need To Do)

- [ ] Run `npx cap sync ios`
- [ ] Run `npx cap open ios`
- [ ] Select "App" target
- [ ] Go to "Signing & Capabilities" tab
- [ ] Click "+ Capability"
- [ ] Add "In-App Purchase"
- [ ] Save (Cmd+S)

## 🏪 App Store Connect (You Need To Do)

### Subscriptions
- [ ] Create: `com.ivory.app.subscription.pro.monthly` ($19.99/month)
- [ ] Create: `com.ivory.app.subscription.business.monthly` ($59.99/month)
- [ ] Set up subscription group
- [ ] Add descriptions and screenshots
- [ ] Set to "Ready to Submit"

### Credit Packages (Optional)
- [ ] Create: `com.ivory.app.credits.5` ($4.99)
- [ ] Create: `com.ivory.app.credits.10` ($9.99)
- [ ] Create: `com.ivory.app.credits.25` ($19.99)
- [ ] Create: `com.ivory.app.credits.50` ($34.99)
- [ ] Create: `com.ivory.app.credits.100` ($59.99)

### Booking Tiers (Optional)
- [ ] Create: `com.ivory.app.booking.tier1` ($9.99)
- [ ] Create: `com.ivory.app.booking.tier2` ($19.99)
- [ ] Create: `com.ivory.app.booking.tier3` ($29.99)
- [ ] Create: `com.ivory.app.booking.tier4` ($39.99)
- [ ] Create: `com.ivory.app.booking.tier5` ($49.99)

### Sandbox Testing
- [ ] Go to Users and Access → Sandbox Testers
- [ ] Create sandbox tester account
- [ ] Note down email and password

## 📱 Device Setup (You Need To Do)

- [ ] Connect real iPhone/iPad to Mac
- [ ] In device Settings → App Store → Sign Out
- [ ] Keep sandbox tester credentials handy

## 🧪 Testing (You Need To Do)

### Build and Run
- [ ] In Xcode, select your real device
- [ ] Click Run (Cmd+R) or use ▶ button
- [ ] App launches on device

### Verify Products Load
- [ ] Navigate to billing page in app
- [ ] Check Xcode console for: "Available IAP products: [...]"
- [ ] Verify products array is NOT empty
- [ ] Verify product IDs match what you created

### Test Purchase Flow
- [ ] Click "Subscribe to Pro" button
- [ ] Apple purchase dialog appears
- [ ] Sign in with sandbox tester account
- [ ] Confirm purchase
- [ ] Check console for "Purchase initiated successfully"
- [ ] Verify subscription activates

## 🎯 Success Criteria

### Console Output Should Show:
```
✅ ⚡️  [log] - Available IAP products: [
  {
    productId: "com.ivory.app.subscription.pro.monthly",
    title: "Pro Monthly",
    price: 19.99,
    priceString: "$19.99"
  }
]
```

### NOT:
```
❌ ⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
❌ ⚡️  [log] - Available IAP products: []
```

## ⏰ Timing Notes

- **Xcode setup:** 2-5 minutes
- **Create products:** 15-30 minutes
- **Apple sync:** 2-4 hours (wait time)
- **Testing:** 5-10 minutes

**Total active time:** ~30-45 minutes
**Total elapsed time:** 2-4 hours (due to Apple sync)

## 🐛 Common Issues

### "UNIMPLEMENTED" error persists
- [ ] Did you run `npx cap sync ios`?
- [ ] Did you rebuild in Xcode?
- [ ] Did you add In-App Purchase capability?

### "Cannot connect to iTunes Store"
- [ ] Are you testing on real device (not simulator)?
- [ ] Is device connected to internet?

### "Product not available"
- [ ] Did you create products in App Store Connect?
- [ ] Did you wait 2-4 hours for sync?
- [ ] Do product IDs match exactly?

### Empty products array
- [ ] Check bundle ID is com.ivory.app
- [ ] Check product IDs start with com.ivory.app.*
- [ ] Wait longer for Apple sync

## 📚 Documentation Reference

Quick guides:
- `IAP_QUICK_FIX.md` - 3-step quick start
- `IAP_VISUAL_GUIDE.md` - Step-by-step with visuals
- `IAP_FIX_SUMMARY.md` - Complete technical summary
- `IAP_PLUGIN_FIX.md` - Detailed implementation

Scripts:
- `rebuild-ios-iap.sh` - Automated rebuild

## 🎉 When Complete

You should be able to:
- ✅ See products load on billing page
- ✅ See correct prices displayed
- ✅ Click subscribe and see Apple dialog
- ✅ Complete purchase with sandbox account
- ✅ See subscription activate in app

## 📝 Notes

Use this space to track issues or questions:

```
Date: ___________
Issue: 
Solution:

Date: ___________
Issue:
Solution:
```

---

**Last Updated:** December 27, 2024
**Status:** Code fixes complete, manual steps pending
