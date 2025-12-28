# IAP Fix - Visual Step-by-Step Guide

## 🎯 Goal
Fix the "UNIMPLEMENTED" error and get IAP subscriptions working.

---

## 📋 Prerequisites

- ✅ Mac with Xcode installed
- ✅ Real iPhone/iPad (Simulator won't work)
- ✅ Apple Developer account
- ✅ App created in App Store Connect

---

## 🔧 Step 1: Rebuild the App

### Terminal Commands
```bash
# Sync Capacitor with updated code
npx cap sync ios

# Open Xcode
npx cap open ios
```

**Or use the script:**
```bash
./rebuild-ios-iap.sh
```

---

## 🎨 Step 2: Add In-App Purchase Capability

### In Xcode:

```
┌─────────────────────────────────────────┐
│ Xcode Window                            │
├─────────────────────────────────────────┤
│                                         │
│  1. Click "App" target (top left)      │
│     ↓                                   │
│  2. Click "Signing & Capabilities" tab │
│     ↓                                   │
│  3. Click "+ Capability" button        │
│     ↓                                   │
│  4. Search: "In-App Purchase"          │
│     ↓                                   │
│  5. Double-click to add                │
│                                         │
└─────────────────────────────────────────┘
```

**Visual Location:**
```
Xcode Top Bar:
[App ▼] [iPhone 15 Pro ▼] [▶ Run]
       ↑
   Click here

Tabs:
[General] [Signing & Capabilities] [Resource Tags] [Info] [Build Settings]
          ↑
      Click here

Capabilities Section:
[+ Capability] ← Click here
```

---

## 🏪 Step 3: Create Products in App Store Connect

### Go to: https://appstoreconnect.apple.com

### Navigation:
```
My Apps → [Your App] → Features → In-App Purchases → [+]
```

### Create These Products:

#### Product 1: Client Pro Subscription
```
┌─────────────────────────────────────────┐
│ Type: Auto-Renewable Subscription      │
│ Reference Name: Pro Monthly             │
│ Product ID: com.ivory.app.subscription.pro
│ Subscription Group: [Create new]       │
│ Price: $19.99                          │
│ Subscription Duration: 1 Month         │
└─────────────────────────────────────────┘
```

#### Product 2: Tech Business Subscription
```
┌─────────────────────────────────────────┐
│ Type: Auto-Renewable Subscription      │
│ Reference Name: Business Monthly        │
│ Product ID: com.ivory.app.subscription.business
│ Subscription Group: [Same as above]    │
│ Price: $59.99                          │
│ Subscription Duration: 1 Month         │
└─────────────────────────────────────────┘
```

#### Products 3-7: Credit Packages (Optional)
```
┌─────────────────────────────────────────┐
│ Type: Consumable                        │
│ Reference Name: 5 Credits               │
│ Product ID: com.ivory.app.credits.5     │
│ Price: $4.99                           │
└─────────────────────────────────────────┘

Repeat for:
- com.ivory.app.credits.10 ($9.99)
- com.ivory.app.credits.25 ($19.99)
- com.ivory.app.credits.50 ($34.99)
- com.ivory.app.credits.100 ($59.99)
```

### Product Status
Each product should show:
```
[Ready to Submit] ← This status is OK for testing
```

---

## 👤 Step 4: Create Sandbox Tester

### In App Store Connect:

```
Users and Access → Sandbox Testers → [+]
```

### Create Test Account:
```
┌─────────────────────────────────────────┐
│ First Name: Test                        │
│ Last Name: User                         │
│ Email: test@example.com                 │
│ Password: [Strong password]             │
│ Country: United States                  │
└─────────────────────────────────────────┘
```

**Important:** Use a fake email that doesn't exist in real Apple ID system.

---

## 📱 Step 5: Test on Real Device

### In Xcode:

```
Device Selector:
[iPhone 15 Pro ▼] → Click → Select your real device
                              ↓
                    [Josh's iPhone] ← Your device
```

### Build and Run:
```
Click: [▶ Run] or press Cmd+R
```

### On Your iPhone:

1. **Sign out of Apple ID (for testing):**
   ```
   Settings → App Store → [Your Name] → Sign Out
   ```

2. **Launch the app from Xcode**

3. **Navigate to billing page**

4. **Check Xcode console:**
   ```
   ✅ Good:
   ⚡️  [log] - Available IAP products: [
     { productId: "com.ivory.app.subscription.pro", ... }
   ]
   
   ❌ Bad:
   ⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
   ```

5. **Try to subscribe:**
   - Click "Subscribe to Pro" button
   - Apple prompt appears
   - Sign in with sandbox tester account
   - Confirm purchase

---

## ✅ Success Indicators

### Console Output (Good):
```
⚡️  [log] - Loading IAP products...
⚡️  [log] - Available IAP products: [
  {
    productId: "com.ivory.app.subscription.pro",
    title: "Pro Monthly",
    price: 19.99,
    priceString: "$19.99"
  }
]
⚡️  [log] - Starting IAP purchase for plan: pro
⚡️  [log] - Purchase initiated successfully
```

### UI Behavior (Good):
- Products load and display prices
- Subscribe button is enabled
- Clicking button shows Apple purchase dialog
- Purchase completes successfully

---

## 🐛 Troubleshooting

### Issue: "UNIMPLEMENTED" error
```
Cause: Plugin not registered
Fix: 
  1. Run: npx cap sync ios
  2. Rebuild in Xcode
  3. Verify IAPPlugin.swift has CAPBridgedPlugin
```

### Issue: "Cannot connect to iTunes Store"
```
Cause: Testing in Simulator
Fix: Use real device
```

### Issue: "Product not available"
```
Cause: Products not created or not synced
Fix:
  1. Create products in App Store Connect
  2. Wait 2-4 hours for Apple to sync
  3. Verify product IDs match exactly
```

### Issue: Empty products array
```
Cause: Products not found or bundle ID mismatch
Fix:
  1. Check bundle ID: com.ivory.app
  2. Check product IDs start with: com.ivory.app.*
  3. Wait for Apple sync (2-4 hours)
```

---

## 📊 Before vs After

### Before Fix:
```
Console:
⚡️  [error] - Failed to load IAP products: {"code":"UNIMPLEMENTED"}
⚡️  [log] - Available IAP products: []
⚡️  [error] - Product not found in available products

UI:
[Subscribe to Pro] ← Button does nothing
```

### After Fix:
```
Console:
⚡️  [log] - Available IAP products: [...]
⚡️  [log] - Starting IAP purchase for plan: pro
⚡️  [log] - Purchase initiated successfully

UI:
[Subscribe to Pro - $19.99/month] ← Shows price, works
```

---

## ⏱️ Timeline

| Step | Time | Can Skip? |
|------|------|-----------|
| Code changes | Done ✅ | No |
| Xcode capability | 2 min | No |
| Create products | 15 min | No |
| Apple sync | 2-4 hours | No |
| Create sandbox tester | 5 min | No |
| Test on device | 5 min | No |

**Total:** ~30 min active work + 2-4 hours waiting

---

## 🎓 Key Learnings

1. **IAP only works on real devices** - Simulator always fails
2. **Products need time to sync** - Wait 2-4 hours after creation
3. **Bundle ID must match** - com.ivory.app.* for all products
4. **Sandbox testing required** - Can't use real Apple ID
5. **Capability required** - Must add in Xcode

---

## 📚 Related Documents

- `IAP_FIX_SUMMARY.md` - Complete technical summary
- `IAP_QUICK_FIX.md` - 3-step quick reference
- `IAP_PLUGIN_FIX.md` - Detailed implementation notes
- `rebuild-ios-iap.sh` - Automated rebuild script

---

## 🆘 Still Stuck?

Check these in order:

1. [ ] Ran `npx cap sync ios`
2. [ ] Rebuilt app in Xcode
3. [ ] Added "In-App Purchase" capability
4. [ ] Created products in App Store Connect
5. [ ] Waited 2-4 hours after creating products
6. [ ] Testing on real device (not simulator)
7. [ ] Signed out of real Apple ID
8. [ ] Using sandbox tester account
9. [ ] Products show "Ready to Submit" status
10. [ ] Bundle ID is com.ivory.app

If all checked and still failing, check Xcode console for specific error messages.
