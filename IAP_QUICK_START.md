# IAP Quick Start Guide 🚀

## Test IAP Right Now

### 1. Open Xcode
```bash
yarn cap open ios
```

### 2. Clean & Build
- `Cmd+Shift+K` - Clean
- `Cmd+B` - Build
- `Cmd+R` - Run on device

### 3. Check Console
Look for:
```
✅ IAPPlugin: Device CAN make payments
✅ IAPPlugin: Products request succeeded
📦 IAPPlugin: Product - com.ivory.app.subscription.pro.monthly
```

### 4. Test Purchase
1. Navigate to `/billing` in app
2. Tap a subscription plan
3. Sign in with sandbox account
4. Complete purchase

## Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "UNIMPLEMENTED" | Run `yarn cap sync ios` and rebuild |
| No products | Configure in App Store Connect |
| Can't purchase | Use sandbox tester account |
| Receipt fails | Check backend `/api/iap/validate-receipt` |

## Product IDs

```typescript
// Subscriptions
PRO_MONTHLY: 'com.ivory.app.subscription.pro.monthly'        // $19.99
BUSINESS_MONTHLY: 'com.ivory.app.subscription.business.monthly' // $59.99

// Credits
CREDITS_5: 'com.ivory.app.credits5'   // $7.50
CREDITS_10: 'com.ivory.app.credits10' // $15.00
```

## Files Changed

✅ `capacitor.config.ts` - Config updated
✅ `app/layout.tsx` - IAP initializer added
✅ `lib/iap-init.ts` - NEW initialization utility
✅ `components/iap-initializer.tsx` - NEW React component

## What Happens Now

1. **App launches** → IAPInitializer runs
2. **Products load** → From App Store Connect
3. **Splash hides** → When ready
4. **User subscribes** → IAP flow starts
5. **Receipt validates** → Backend confirms
6. **Credits added** → User gets access

## Console Log Guide

| Icon | Meaning |
|------|---------|
| 🟢 | Initialization |
| 🔵 | Action/Info |
| ✅ | Success |
| ❌ | Error |
| ⚠️ | Warning |
| 📦 | Product info |

## Need Help?

See detailed guides:
- `IAP_SETUP_COMPLETE.md` - Full setup guide
- `IAP_FIX_COMPLETE.md` - What was fixed
- `APPLE_IAP_IMPLEMENTATION.md` - Original implementation

---

**Ready to test!** Open Xcode and run on device.
