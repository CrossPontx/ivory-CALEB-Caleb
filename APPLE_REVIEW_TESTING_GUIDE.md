# Apple Review Testing Guide

## Quick Testing Checklist

### Before Submitting to Apple Review

#### 1. Test Guideline 5.1.1 - Account-Free Browsing ✅

**Web Browser Test:**
1. Open https://ivory-blond.vercel.app in browser
2. ✅ Landing page should load without login
3. ✅ Click "Browse Designs" button
4. ✅ Explore page should show sample designs
5. ✅ No authentication required to view content
6. ✅ Click on a design → prompted to sign up

**iOS App Test:**
1. Open app on iOS device
2. ✅ Landing page should appear (not forced to /auth)
3. ✅ Tap "Browse Designs"
4. ✅ View sample designs without login
5. ✅ Tap design → prompted to sign up
6. ✅ Can navigate back to home

#### 2. Test Guideline 4.0 - In-App Authentication ✅

**Google OAuth Test:**
1. Open app on iOS device
2. Tap "Get Started" or "Sign In"
3. Tap "Continue with Google"
4. ✅ Safari View Controller opens (in-app, not external Safari)
5. ✅ URL bar visible at top showing google.com
6. ✅ Can see "Done" button to close
7. ✅ Complete Google sign-in
8. ✅ Automatically returns to app
9. ✅ User logged in successfully

**Apple OAuth Test:**
1. Open app on iOS device
2. Tap "Get Started" or "Sign In"
3. Tap "Continue with Apple"
4. ✅ Safari View Controller opens (in-app)
5. ✅ URL bar visible showing appleid.apple.com
6. ✅ Can see "Done" button to close
7. ✅ Complete Apple sign-in
8. ✅ Automatically returns to app
9. ✅ User logged in successfully

**Email/Password Test:**
1. Open app on iOS device
2. Tap "Get Started"
3. Enter username, email, password
4. ✅ Sign up completes in-app (no browser)
5. ✅ User logged in successfully

## Visual Verification

### Safari View Controller Indicators
When OAuth opens, you should see:
- ✅ Navigation bar at top with URL
- ✅ "Done" button in top-left or top-right
- ✅ Address bar showing authentication provider domain
- ✅ Lock icon indicating secure connection
- ✅ Ability to tap URL to see full address
- ✅ App remains visible in background (not completely replaced)

### External Safari (What We DON'T Want)
If you see this, there's a problem:
- ❌ App completely disappears
- ❌ Full Safari browser opens
- ❌ Safari tabs visible
- ❌ Safari toolbar at bottom
- ❌ Need to manually switch back to app

## User Flows to Test

### Flow 1: Browse Without Account
```
Launch App
  → Landing Page
  → Tap "Browse Designs"
  → Explore Page (no login)
  → View sample designs
  → Tap design
  → Prompt: "Sign up to create custom designs"
  → Tap OK
  → Auth Page
```

### Flow 2: Sign Up with OAuth
```
Launch App
  → Landing Page
  → Tap "Get Started"
  → Auth Page
  → Tap "Continue with Google"
  → Safari View Controller opens (in-app)
  → Complete Google auth
  → Return to app
  → Select user type
  → Dashboard
```

### Flow 3: Existing User
```
Launch App
  → Session detected
  → Auto-redirect to Dashboard
  (No landing page shown)
```

## Common Issues & Solutions

### Issue: OAuth opens external Safari
**Solution:** 
- Verify @capacitor/browser is installed
- Check that Browser.open() is being called
- Ensure presentationStyle is set to 'popover'

### Issue: Landing page redirects to auth
**Solution:**
- Check app/page.tsx - removed forced redirect
- Verify middleware allows / and /explore as public routes

### Issue: Can't browse without login
**Solution:**
- Verify /explore route exists
- Check middleware.ts includes '/explore' in publicRoutes
- Test that explore page loads without session

## Apple Review Notes

### What to Include in Review Notes

```
GUIDELINE 4.0 COMPLIANCE:
We have implemented Safari View Controller for all OAuth authentication flows.
- OAuth opens in-app using Capacitor Browser plugin
- Users can verify URLs and SSL certificates
- No external browser redirect
- Test with "Continue with Google" or "Continue with Apple" buttons

GUIDELINE 5.1.1 COMPLIANCE:
Users can now browse the app without creating an account.
- Landing page accessible to all users
- "Browse Designs" button shows explore gallery
- Sample designs viewable without authentication
- Authentication only required for:
  * Generating custom AI designs
  * Saving designs
  * Booking appointments
  * Accessing user dashboard

TEST ACCOUNT (if needed):
Username: reviewer@test.com
Password: [provide test password]
```

## Screenshots for Review

Capture these screenshots to include with submission:

1. **Landing Page** - Shows app can be browsed without login
2. **Explore Page** - Shows designs viewable without account
3. **Safari View Controller** - Shows OAuth in-app (with URL bar visible)
4. **Auth Page** - Shows sign-in options
5. **Sign-up Prompt** - Shows when trying to create design without account

## Final Checklist Before Submission

- [ ] @capacitor/browser installed and synced
- [ ] Landing page loads without forcing login
- [ ] /explore page accessible without authentication
- [ ] OAuth opens in Safari View Controller (not external Safari)
- [ ] Both Google and Apple OAuth tested
- [ ] Session persists after OAuth
- [ ] Account deletion feature still works
- [ ] Privacy policy and terms accessible
- [ ] All features work as expected
- [ ] No console errors in production build

## Build and Submit

```bash
# 1. Build Next.js app
yarn build

# 2. Export static files
yarn export

# 3. Sync with iOS
yarn cap:sync

# 4. Open Xcode
yarn cap:open:ios

# 5. In Xcode:
#    - Select "Any iOS Device (arm64)"
#    - Product → Archive
#    - Distribute App → App Store Connect
#    - Upload
```

## Post-Submission

After submitting to Apple Review:
1. Monitor App Store Connect for status updates
2. Respond promptly to any reviewer questions
3. If rejected, review feedback and iterate
4. Reference this document in responses

## Success Criteria

✅ **Guideline 4.0:** OAuth authentication happens in Safari View Controller within the app
✅ **Guideline 5.1.1:** Users can browse designs and content without creating an account
✅ **User Experience:** Seamless flow from browsing to sign-up to using features
✅ **Security:** All authentication remains secure with visible URL verification
