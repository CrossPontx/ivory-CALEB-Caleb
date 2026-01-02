# IAP Commands Reference 🛠️

## Essential Commands

### Open Xcode
```bash
yarn cap open ios
```

### Sync Capacitor
```bash
yarn cap sync ios
```

### Build for iOS (requires env vars)
```bash
yarn ios:build
```

### Run on iOS Device
```bash
yarn cap run ios
```

## Xcode Shortcuts

| Action | Shortcut |
|--------|----------|
| Clean Build | `Cmd+Shift+K` |
| Build | `Cmd+B` |
| Run | `Cmd+R` |
| Stop | `Cmd+.` |
| Show Console | `Cmd+Shift+Y` |
| Clear Console | `Cmd+K` |

## Testing Commands

### Check IAP Plugin Registration
In Xcode console, look for:
```
🟢 IAPPlugin: load() called
```

### Check Products Loading
In Xcode console, look for:
```
✅ IAPPlugin: Products request succeeded
📦 IAPPlugin: Product - [product details]
```

### Test Purchase Flow
1. Navigate to `/billing` in app
2. Tap subscription plan
3. Watch console for purchase logs

## Debugging Commands

### View All Console Logs
In Xcode:
1. Run app (Cmd+R)
2. Open console (Cmd+Shift+Y)
3. Filter by "IAP" to see only IAP logs

### Check Capacitor Config
```bash
cat capacitor.config.ts
```

### Check IAP Manager
```bash
cat lib/iap.ts
```

### Check Native Plugin
```bash
cat ios/App/App/IAPPlugin.swift
```

## App Store Connect

### View Products
```
https://appstoreconnect.apple.com
→ Your App
→ Features
→ In-App Purchases
```

### Create Sandbox Tester
```
https://appstoreconnect.apple.com
→ Users and Access
→ Sandbox Testers
→ + (Add)
```

## Git Commands (if needed)

### Check Changes
```bash
git status
```

### View Diff
```bash
git diff capacitor.config.ts
git diff app/layout.tsx
```

### Commit Changes
```bash
git add capacitor.config.ts app/layout.tsx lib/iap-init.ts components/iap-initializer.tsx
git commit -m "Fix IAP initialization and splash screen"
```

## Troubleshooting Commands

### Reset Capacitor
```bash
rm -rf ios/App/App/public
yarn cap sync ios
```

### Clean Node Modules (if needed)
```bash
rm -rf node_modules
yarn install
yarn cap sync ios
```

### Check Xcode Version
```bash
xcodebuild -version
```

### Check iOS Simulators
```bash
xcrun simctl list devices
```

## Environment Setup

### Check Node Version
```bash
node --version
# Should be 18+ for Next.js 16
```

### Check Yarn Version
```bash
yarn --version
```

### Check Capacitor CLI
```bash
npx cap --version
```

## Quick Test Sequence

```bash
# 1. Sync Capacitor
yarn cap sync ios

# 2. Open Xcode
yarn cap open ios

# 3. In Xcode:
#    - Clean (Cmd+Shift+K)
#    - Build (Cmd+B)
#    - Run (Cmd+R)

# 4. Check console for:
#    ✅ IAPPlugin: Device CAN make payments
#    ✅ IAPPlugin: Products request succeeded

# 5. Test in app:
#    - Navigate to /billing
#    - Tap subscription plan
#    - Complete purchase
```

## Log Filtering

### In Xcode Console
Filter by these terms to see specific logs:

| Filter | Shows |
|--------|-------|
| `IAP` | All IAP-related logs |
| `🟢` | Initialization logs |
| `✅` | Success logs |
| `❌` | Error logs |
| `📦` | Product information |
| `purchase` | Purchase flow logs |

## Backend Testing

### Test Receipt Validation
```bash
curl -X POST http://localhost:3000/api/iap/validate-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "receipt": "base64_receipt_data",
    "productId": "com.ivory.app.subscription.pro.monthly",
    "transactionId": "test_transaction_id"
  }'
```

### Check API Endpoint
```bash
curl http://localhost:3000/api/health
```

## Production Deployment

### Build for Production
```bash
# Set production environment
export NODE_ENV=production

# Build Next.js
yarn build

# Sync to iOS
yarn cap sync ios

# Open Xcode for archive
yarn cap open ios
```

### Archive in Xcode
1. Product → Archive
2. Distribute App
3. App Store Connect
4. Upload

## Useful File Paths

```bash
# Capacitor Config
capacitor.config.ts

# IAP Files
lib/iap.ts
lib/iap-init.ts
components/iap-initializer.tsx

# Native Plugin
ios/App/App/IAPPlugin.swift

# API Endpoints
app/api/iap/validate-receipt/route.ts

# UI Components
components/subscription-plans.tsx
components/buy-credits-dialog.tsx
app/billing/page.tsx
```

## Documentation Files

```bash
# Quick Start
IAP_QUICK_START.md

# Complete Setup
IAP_SETUP_COMPLETE.md

# Fix Summary
IAP_FIX_COMPLETE.md

# Visual Guide
IAP_VISUAL_SUMMARY.md

# This File
IAP_COMMANDS.md
```

---

**Most Important Command**: `yarn cap open ios`
**Most Important Shortcut**: `Cmd+Shift+K` (Clean Build)
**Most Important Log**: `✅ IAPPlugin: Products request succeeded`
