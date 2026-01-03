# 🚀 Build and Test in Xcode - NOW

## ✅ Package Dependencies Fixed!

The Swift Package Manager cache has been cleared and dependencies resolved successfully.

## 📋 Steps to Build and Test

### 1. In Xcode (should be open now):

#### A. Select Your Device
- At the top of Xcode, click the device selector (next to the scheme)
- Choose your **physical iPhone** (not simulator - IAP only works on real devices)

#### B. Clean Build Folder
- Press: **Shift + Cmd + K**
- Or: Menu → Product → Clean Build Folder
- Wait for "Clean Finished"

#### C. Build the Project
- Press: **Cmd + B**
- Or: Menu → Product → Build
- Watch for "Build Succeeded" message

#### D. Run on Device
- Press: **Cmd + R**
- Or: Menu → Product → Run
- App will install and launch on your iPhone

### 2. Watch the Console Output

Open the console if not visible:
- Menu → View → Debug Area → Show Debug Area
- Or press: **Shift + Cmd + Y**

### 🔍 What You Should See (SUCCESS):

```
⚡️  Loading app at capacitor://localhost
🟢 AppDelegate: Application did finish launching
🔵 AppDelegate: Capacitor will auto-discover plugins
🟢 IAPPlugin: load() called
🟢 IAPPlugin: Registered successfully
⚡️  WebView loaded
```

### ❌ What You Should NOT See (FAILURE):

```
⚡️  Loading app at https://ivory-blond.vercel.app
Failed to load IAP products: {"code":"UNIMPLEMENTED"}
```

### 3. Test the IAP Plugin

The test page will automatically:
1. Check if IAPPlugin is registered
2. Show test buttons

On your iPhone screen, you should see:
- "🧪 IAP Plugin Test" heading
- Status messages
- Three test buttons

**Tap the buttons in order:**
1. "1. Test Plugin Registration" → Should show ✅ IAPPlugin found
2. "2. Load Products" → Should load your subscription products
3. "3. Test Purchase" → Should show Apple payment sheet

### 4. If You See the Apple Payment Sheet:

🎉 **SUCCESS!** The IAP plugin is working!

The "Subscribe to Pro" button issue is FIXED.

### 5. If Something Goes Wrong:

#### If app loads from Vercel URL:
```bash
# Run this in terminal:
./test-iap-fix.sh

# If it shows server URL present, run:
# Edit ios/App/App/capacitor.config.json
# Remove the "server" section
# Then rebuild in Xcode
```

#### If packages still missing:
```bash
# In terminal:
rm -rf ~/Library/Caches/org.swift.swiftpm
xcodebuild -resolvePackageDependencies -project App.xcodeproj -scheme App
```
(Run from ios/App directory)

#### If IAPPlugin not found:
- Check Xcode Project Navigator (left sidebar)
- Look for `IAPPlugin.swift` under App folder
- If missing, it needs to be added to the project

## 🎯 Expected Test Results

### Test 1: Plugin Registration
```
✅ Capacitor found
✅ IAPPlugin found and registered!
Plugin methods: getProducts, purchase, restorePurchases, ...
```

### Test 2: Load Products
```
✅ Loaded 6 products
Available Products:
- Pro Monthly Subscription - $9.99
- Pro Yearly Subscription - $99.99
- 10 Credits - $0.99
- 25 Credits - $1.99
- 50 Credits - $3.99
- 100 Credits - $6.99
```

### Test 3: Test Purchase
```
Initiating purchase for: com.ivory.app.subscription.pro.monthly
[Apple Payment Sheet Appears]
```

## 📱 Testing on Apple Watch

After confirming iPhone works:
1. Make sure Apple Watch is paired and unlocked
2. The watch app should sync automatically
3. Test the subscribe button on the watch

## 🐛 Troubleshooting

### Build Errors:
- Clean: Shift+Cmd+K
- Quit Xcode completely
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
- Reopen Xcode
- Build again

### "Missing Package Product" Errors:
- File → Packages → Reset Package Caches
- File → Packages → Resolve Package Versions
- Clean and rebuild

### App Crashes on Launch:
- Check console for error messages
- Verify signing certificate is valid
- Make sure device is in developer mode

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Console shows `capacitor://localhost` (not vercel.app)
2. ✅ Console shows `IAPPlugin: load() called`
3. ✅ Test page loads and shows plugin registered
4. ✅ Products load from App Store Connect
5. ✅ Tapping purchase shows Apple payment sheet

## 🎉 Next Steps After Success

1. Build the full Next.js app (we'll fix the build errors)
2. Replace test page with your actual app
3. Test full subscription flow
4. Submit to Apple for review

---

**Xcode is open. Start testing now!** 🚀
