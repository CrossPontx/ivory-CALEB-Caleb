# App Store Submission Checklist

## Pre-Submission Checklist

### ✅ Code Changes Complete

- [x] Added `@capacitor/browser` package
- [x] Updated `app/page.tsx` - removed forced auth redirect
- [x] Updated `app/auth/page.tsx` - added Safari View Controller for OAuth
- [x] Created `app/explore/page.tsx` - public gallery page
- [x] Updated `components/landing-page.tsx` - added explore navigation
- [x] Updated `middleware.ts` - added /explore to public routes
- [x] Synced Capacitor with `yarn cap:sync`
- [x] No TypeScript errors

### ✅ Testing Complete

#### Guideline 5.1.1 - Account-Free Browsing
- [ ] Launch app without account → Landing page appears
- [ ] Tap "Browse Designs" → Explore page loads
- [ ] View sample designs → No login required
- [ ] Tap on design → Prompted to sign up (not forced)
- [ ] Navigate back → Can continue browsing
- [ ] Access terms/privacy → Available without login

#### Guideline 4.0 - In-App Authentication
- [ ] Tap "Get Started" → Auth page appears
- [ ] Tap "Continue with Google" → Safari View Controller opens (in-app)
- [ ] Verify URL bar visible → Can see accounts.google.com
- [ ] Verify "Done" button → Can close if needed
- [ ] Complete authentication → Returns to app automatically
- [ ] Session persists → User logged in
- [ ] Repeat test with "Continue with Apple" → Same behavior

#### Additional Testing
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Existing user auto-login works
- [ ] Account deletion still works
- [ ] All authenticated features work
- [ ] No console errors in production build

### ✅ Build Preparation

- [ ] Update version number in Xcode
- [ ] Update build number in Xcode
- [ ] Set release configuration
- [ ] Verify signing certificates
- [ ] Test on physical iOS device (not just simulator)
- [ ] Verify all assets included
- [ ] Check app icons and splash screens

### ✅ Documentation Ready

- [x] `APPLE_REVIEW_FIXES.md` - Detailed implementation
- [x] `APPLE_REVIEW_TESTING_GUIDE.md` - Testing instructions
- [x] `APPLE_REVIEW_RESPONSE_FINAL.md` - Response to reviewers
- [x] `QUICK_REFERENCE_APPLE_FIXES.md` - Quick summary
- [x] `USER_FLOW_DIAGRAM.md` - Visual flows
- [x] This checklist

### ✅ App Store Connect

- [ ] App metadata updated
- [ ] Screenshots current
- [ ] Privacy policy URL correct
- [ ] Terms of service URL correct
- [ ] Support URL working
- [ ] Marketing URL (if applicable)
- [ ] Age rating appropriate
- [ ] Categories selected

## Build and Archive

### Step 1: Build Next.js
```bash
yarn build
```
**Verify:** No build errors

### Step 2: Export Static Files
```bash
yarn export
```
**Verify:** `out` directory created

### Step 3: Sync Capacitor
```bash
yarn cap:sync
```
**Verify:** iOS plugins synced, including @capacitor/browser

### Step 4: Open Xcode
```bash
yarn cap:open:ios
```

### Step 5: Archive in Xcode
1. Select "Any iOS Device (arm64)" as destination
2. Product → Clean Build Folder
3. Product → Archive
4. Wait for archive to complete
5. Organizer window opens

### Step 6: Validate Archive
1. In Organizer, select archive
2. Click "Validate App"
3. Select distribution certificate
4. Wait for validation
5. Fix any issues found

### Step 7: Distribute
1. Click "Distribute App"
2. Select "App Store Connect"
3. Select "Upload"
4. Choose signing options (automatic recommended)
5. Review app information
6. Click "Upload"
7. Wait for upload to complete

## App Store Connect Submission

### Step 1: Wait for Processing
- [ ] Build appears in App Store Connect
- [ ] Processing completes (can take 10-60 minutes)
- [ ] Build shows as "Ready to Submit"

### Step 2: Add Build to Version
- [ ] Go to App Store Connect
- [ ] Select your app
- [ ] Go to version in "Prepare for Submission"
- [ ] Click "+ Build" and select uploaded build
- [ ] Save

### Step 3: Review Information
- [ ] App name correct
- [ ] Subtitle (if any)
- [ ] Description updated
- [ ] Keywords optimized
- [ ] Screenshots current
- [ ] Preview videos (if any)

### Step 4: Add Review Notes

Copy this into "Notes for Review":

```
Thank you for your previous feedback. We have addressed both issues:

GUIDELINE 4.0 - IN-APP AUTHENTICATION:
✅ Implemented Safari View Controller for OAuth
✅ Users can now sign in within the app
✅ URL verification and SSL inspection available
✅ Test: Tap "Continue with Google" or "Continue with Apple"

GUIDELINE 5.1.1 - ACCOUNT-FREE BROWSING:
✅ Users can browse without creating account
✅ Landing page and "Explore" gallery accessible to all
✅ Authentication only required for account-based features
✅ Test: Launch app → Tap "Browse Designs"

TECHNICAL CHANGES:
- Added @capacitor/browser for Safari View Controller
- Created public /explore page for browsing
- Removed forced authentication on launch
- Clear separation of public vs. account-based features

TEST ACCOUNT (if needed):
Username: reviewer@ivoryschoice.com
Password: AppleReview2024!

All existing features remain functional. Account deletion available in Settings → Account.
```

### Step 5: Submit for Review
- [ ] Review all information one final time
- [ ] Click "Submit for Review"
- [ ] Confirm submission
- [ ] Status changes to "Waiting for Review"

## Post-Submission

### Monitor Status
- [ ] Check App Store Connect daily
- [ ] Enable email notifications
- [ ] Respond to any reviewer questions within 24 hours

### Status Progression
1. **Waiting for Review** - In queue
2. **In Review** - Being tested (usually 24-48 hours)
3. **Pending Developer Release** - Approved! (or auto-release)
4. **Ready for Sale** - Live on App Store

### If Rejected
1. Read rejection reason carefully
2. Review specific guidelines mentioned
3. Make necessary changes
4. Test thoroughly
5. Resubmit with explanation of changes

### If Approved
1. 🎉 Celebrate!
2. Monitor crash reports
3. Watch user reviews
4. Plan next update

## Emergency Contacts

**Apple Developer Support:**
- Phone: 1-800-633-2152
- Email: developer.apple.com/contact

**App Review Board:**
- Use if you disagree with rejection
- developer.apple.com/contact/app-store/

## Quick Reference

### Key Changes Made
1. ✅ Safari View Controller for OAuth (Guideline 4.0)
2. ✅ Public explore page (Guideline 5.1.1)
3. ✅ No forced authentication
4. ✅ Clear feature gating

### Test Credentials
- **Username:** reviewer@ivoryschoice.com
- **Password:** AppleReview2024!

### Important URLs
- **Privacy Policy:** https://ivory-blond.vercel.app/privacy-policy
- **Terms of Service:** https://ivory-blond.vercel.app/terms
- **Support:** [Your support email]

## Final Verification

Before clicking "Submit for Review":

- [ ] All checklist items above completed
- [ ] Tested on physical iOS device
- [ ] Safari View Controller verified working
- [ ] Public browsing verified working
- [ ] No crashes or errors
- [ ] Review notes added
- [ ] Test account provided
- [ ] Confident in submission

---

**Ready to Submit:** [ ] Yes / [ ] No

**Submitted Date:** _______________

**Build Number:** _______________

**Version Number:** _______________

**Reviewer Notes:** _______________________________________________

---

## Success Criteria

✅ **Guideline 4.0:** OAuth in Safari View Controller (in-app)
✅ **Guideline 5.1.1:** Browse designs without account
✅ **User Experience:** Seamless and intuitive
✅ **Security:** All authentication secure
✅ **Compliance:** All Apple guidelines met

**Good luck with your submission! 🚀**
