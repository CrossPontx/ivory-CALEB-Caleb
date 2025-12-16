# Troubleshooting Guide - Apple Review Fixes

## Common Issues and Solutions

### Issue 1: OAuth Still Opens External Safari

**Symptoms:**
- Tapping "Continue with Google/Apple" opens full Safari app
- App disappears completely
- Need to manually switch back to app

**Diagnosis:**
```bash
# Check if Browser plugin is installed
yarn list @capacitor/browser

# Should show: @capacitor/browser@8.0.0
```

**Solutions:**

1. **Verify Plugin Installation**
```bash
yarn add @capacitor/browser
yarn cap:sync
```

2. **Check Import Statement**
```typescript
// app/auth/page.tsx should have:
import { Browser } from "@capacitor/browser"
```

3. **Verify Browser.open() Call**
```typescript
// Should use presentationStyle: 'popover'
await Browser.open({ 
  url: oauthUrl,
  presentationStyle: 'popover'
});
```

4. **Test on Physical Device**
- Safari View Controller may not work correctly in simulator
- Always test on actual iOS device

5. **Check Capacitor Platform Detection**
```typescript
const isNative = Capacitor.isNativePlatform();
// Should be true on iOS device
```

---

### Issue 2: Landing Page Still Redirects to Auth

**Symptoms:**
- App launches and immediately goes to /auth
- Can't see landing page
- Forced to sign in

**Diagnosis:**
Check `app/page.tsx` for forced redirects

**Solutions:**

1. **Verify page.tsx Changes**
```typescript
// app/page.tsx should NOT have:
if (isNative) {
  router.push('/auth')  // ❌ Remove this
}

// Should have:
// Show landing page for all users (web and native)
return <LandingPage />  // ✅ Keep this
```

2. **Check Middleware**
```typescript
// middleware.ts should have:
const publicRoutes = ['/shared', '/explore'];
```

3. **Clear Browser Cache**
```bash
# In iOS Simulator:
Device → Erase All Content and Settings

# On physical device:
Settings → Safari → Clear History and Website Data
```

4. **Rebuild App**
```bash
yarn build
yarn export
yarn cap:sync
```

---

### Issue 3: Explore Page Returns 404

**Symptoms:**
- Tapping "Browse Designs" shows 404 error
- /explore route not found

**Diagnosis:**
```bash
# Check if file exists
ls -la app/explore/page.tsx
```

**Solutions:**

1. **Verify File Exists**
```bash
# Should exist:
app/explore/page.tsx
```

2. **Check Middleware Configuration**
```typescript
// middleware.ts
const publicRoutes = ['/shared', '/explore'];
```

3. **Rebuild Next.js**
```bash
yarn build
yarn export
```

4. **Check Route in Browser**
```
http://localhost:3000/explore
```

---

### Issue 4: OAuth Callback Doesn't Work

**Symptoms:**
- Complete OAuth but don't return to app
- Stuck in Safari View Controller
- Session not created

**Diagnosis:**
Check browser console for errors

**Solutions:**

1. **Verify Redirect URIs**
```typescript
// Should match your domain
const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;
```

2. **Check OAuth Provider Configuration**
- Google Cloud Console: Authorized redirect URIs
- Apple Developer: Return URLs

3. **Verify Session Polling**
```typescript
// app/auth/page.tsx should have polling logic
const pollInterval = setInterval(async () => {
  // Check for session
}, 1000)
```

4. **Check API Route**
```bash
# Verify callback route exists
ls -la app/api/auth/callback/
```

---

### Issue 5: TypeScript Errors

**Symptoms:**
- Build fails with TypeScript errors
- Import errors for Browser or Capacitor

**Solutions:**

1. **Install Type Definitions**
```bash
yarn add -D @types/node
```

2. **Verify Imports**
```typescript
import { Capacitor } from "@capacitor/core"
import { Browser } from "@capacitor/browser"
```

3. **Check tsconfig.json**
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

4. **Restart TypeScript Server**
- VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

---

### Issue 6: Build Fails in Xcode

**Symptoms:**
- Archive fails
- Pod install errors
- Swift compilation errors

**Solutions:**

1. **Clean Build Folder**
```bash
# In Xcode:
Product → Clean Build Folder (Cmd+Shift+K)
```

2. **Update Pods**
```bash
cd ios/App
pod install --repo-update
cd ../..
```

3. **Sync Capacitor Again**
```bash
yarn cap:sync
```

4. **Check iOS Deployment Target**
- Should be iOS 13.0 or higher
- Check in Xcode project settings

5. **Verify Signing**
- Check Team is selected
- Verify provisioning profile

---

### Issue 7: Session Not Persisting

**Symptoms:**
- User logs in but session lost on app restart
- Have to log in every time

**Solutions:**

1. **Check Cookie Settings**
```typescript
// Should use httpOnly and secure cookies
res.cookies.set('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
})
```

2. **Verify JWT Secret**
```bash
# Check .env file
JWT_SECRET=your-secret-here
```

3. **Check Session API**
```bash
# Test session endpoint
curl http://localhost:3000/api/auth/session
```

4. **Clear Cookies and Test**
```typescript
// In browser console:
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC"
})
```

---

### Issue 8: Explore Page Shows No Designs

**Symptoms:**
- /explore page loads but empty
- No sample designs visible

**Solutions:**

1. **Check Component Rendering**
```typescript
// app/explore/page.tsx should have:
const sampleDesigns = [...]
```

2. **Verify CSS Loading**
```bash
# Check if Tailwind is working
# Elements should have styling
```

3. **Check Browser Console**
- Look for JavaScript errors
- Check network tab for failed requests

4. **Test in Development**
```bash
yarn dev
# Visit http://localhost:3000/explore
```

---

### Issue 9: Can't Test on iOS Device

**Symptoms:**
- Device not recognized in Xcode
- Can't build to device

**Solutions:**

1. **Trust Computer on Device**
- Connect device
- Tap "Trust" on device popup

2. **Register Device in Developer Portal**
- developer.apple.com
- Certificates, IDs & Profiles → Devices

3. **Update Provisioning Profile**
- Xcode → Preferences → Accounts
- Download Manual Profiles

4. **Check USB Connection**
- Try different cable
- Try different USB port

---

### Issue 10: App Rejected Again

**Symptoms:**
- Still rejected for same guidelines
- Reviewer says issue not fixed

**Solutions:**

1. **Document Your Changes**
- Take screenshots showing fixes
- Record video of working features
- Include in review notes

2. **Request Phone Call**
- App Store Connect → Contact Us
- Request to speak with reviewer

3. **Appeal Decision**
- If you believe you're compliant
- Use App Review Board

4. **Double-Check Implementation**
```bash
# Run all tests again
# Verify on physical device
# Check review notes are clear
```

---

## Verification Commands

### Check Installation
```bash
# Verify all packages
yarn list @capacitor/browser
yarn list @capacitor/core

# Should show version 8.0.0
```

### Check Files
```bash
# Verify all files exist
ls -la app/page.tsx
ls -la app/auth/page.tsx
ls -la app/explore/page.tsx
ls -la components/landing-page.tsx
ls -la middleware.ts
```

### Test Build
```bash
# Full build test
yarn build
yarn export
yarn cap:sync

# Should complete without errors
```

### Test Routes
```bash
# Start dev server
yarn dev

# Test in browser:
# http://localhost:3000/
# http://localhost:3000/explore
# http://localhost:3000/auth
```

---

## Debug Mode

### Enable Verbose Logging

1. **Capacitor Logs**
```typescript
// Add to capacitor.config.ts
{
  loggingBehavior: 'debug'
}
```

2. **Browser Console**
```typescript
// Add to auth page
console.log('isNative:', Capacitor.isNativePlatform())
console.log('Opening OAuth:', oauthUrl)
```

3. **Network Tab**
- Open Safari Web Inspector
- Connect to iOS device
- Monitor network requests

---

## Emergency Rollback

If you need to revert changes:

```bash
# Revert to previous commit
git log --oneline
git revert <commit-hash>

# Or reset to specific commit
git reset --hard <commit-hash>

# Reinstall dependencies
yarn install

# Rebuild
yarn build
yarn cap:sync
```

---

## Getting Help

### Apple Developer Support
- **Phone:** 1-800-633-2152
- **Web:** developer.apple.com/contact
- **Hours:** Monday-Friday, 9am-5pm PT

### App Review Board
- Use if you disagree with rejection
- developer.apple.com/contact/app-store/
- Provide detailed explanation

### Community Resources
- Stack Overflow: [capacitor] tag
- Capacitor Discord: capacitorjs.com/community
- Ionic Forum: forum.ionicframework.com

---

## Checklist Before Asking for Help

- [ ] Read error message carefully
- [ ] Checked this troubleshooting guide
- [ ] Verified all files exist
- [ ] Ran `yarn cap:sync`
- [ ] Tested on physical device (not simulator)
- [ ] Checked browser console for errors
- [ ] Reviewed Xcode build logs
- [ ] Tried clean build
- [ ] Verified environment variables
- [ ] Checked documentation

---

## Quick Fixes

### Reset Everything
```bash
# Nuclear option - start fresh
rm -rf node_modules
rm -rf .next
rm -rf out
rm -rf ios/App/App/public
yarn install
yarn build
yarn export
yarn cap:sync
```

### Clear iOS Derived Data
```bash
# Clear Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Reinstall Pods
```bash
cd ios/App
rm -rf Pods
rm Podfile.lock
pod install
cd ../..
```

---

## Still Having Issues?

1. **Review Documentation**
   - README_APPLE_REVIEW.md
   - APPLE_REVIEW_TESTING_GUIDE.md

2. **Check All Files**
   - Verify changes were saved
   - Check git status

3. **Test Step by Step**
   - Test each feature individually
   - Isolate the problem

4. **Contact Support**
   - Provide error messages
   - Include steps to reproduce
   - Share relevant code snippets

---

**Remember:** Most issues are simple configuration problems. Check the basics first!
