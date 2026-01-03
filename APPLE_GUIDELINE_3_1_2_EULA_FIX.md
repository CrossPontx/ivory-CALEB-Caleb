# Apple Guideline 3.1.2 - EULA Links Fix

## Issue
Apple rejected the app because it's missing functional links to Terms of Use (EULA) in both the app binary and metadata for auto-renewable subscriptions.

## Requirements
Apps offering auto-renewable subscriptions must include:

### In App Binary:
- ✅ Title of subscription (already present)
- ✅ Length of subscription (already present)
- ✅ Price of subscription (already present)
- ✅ **Link to Privacy Policy** (NOW ADDED)
- ✅ **Link to Terms of Use (EULA)** (NOW ADDED)

### In App Store Connect:
- ✅ Privacy Policy link in Privacy Policy field
- ✅ Terms of Use (EULA) link in App Description OR EULA field

## Changes Made

### 1. Subscription Plans Component (`components/subscription-plans.tsx`)
Added legal links below each subscription button:
```
By subscribing, you agree to our Terms of Use and Privacy Policy
```
- Links to `/terms` (Terms of Use/EULA)
- Links to `/privacy-policy` (Privacy Policy)
- Opens in new tab with proper security attributes

### 2. Buy Credits Dialog (`components/buy-credits-dialog.tsx`)
Added legal links at bottom of dialog:
```
By purchasing, you agree to our Terms of Use and Privacy Policy
```
- Links to `/terms` (Terms of Use/EULA)
- Links to `/privacy-policy` (Privacy Policy)
- Opens in new tab with proper security attributes

## App Store Connect Metadata

### Option 1: Use Standard Apple EULA (Recommended)
In your App Description, add:
```
Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

### Option 2: Use Custom EULA
If you have custom terms at `/terms`:
1. Go to App Store Connect
2. Navigate to your app → App Information
3. Scroll to "License Agreement" section
4. Either:
   - Add your custom EULA text directly, OR
   - Add link to your terms page in App Description:
     ```
     Terms of Use: https://yourdomain.com/terms
     Privacy Policy: https://yourdomain.com/privacy-policy
     ```

## Testing Checklist

### Before Resubmission:
- [ ] Deploy changes to production
- [ ] Test subscription flow on iOS device
- [ ] Verify Terms of Use link works and opens correctly
- [ ] Verify Privacy Policy link works and opens correctly
- [ ] Test credit purchase flow on iOS device
- [ ] Verify links work in both subscription and credit purchase screens
- [ ] Update App Store Connect metadata with EULA link
- [ ] Take screenshots showing the links for Apple reviewers

### In App Store Connect:
- [ ] Add EULA link to App Description OR License Agreement field
- [ ] Verify Privacy Policy URL is set in Privacy Policy field
- [ ] Add note in "Review Notes" about the EULA links:
  ```
  We have added functional links to our Terms of Use (EULA) and Privacy Policy 
  in the subscription and purchase screens. Users must agree to these terms 
  before completing any purchase.
  
  Terms of Use: [your URL or Apple's standard EULA]
  Privacy Policy: [your URL]
  ```

## Resubmission Message Template

```
Dear App Review Team,

Thank you for your feedback regarding Guideline 3.1.2.

We have updated our app to include functional links to both our Terms of Use (EULA) 
and Privacy Policy in all subscription and in-app purchase screens.

Changes made:
1. Added "Terms of Use" and "Privacy Policy" links in the subscription selection screen
2. Added "Terms of Use" and "Privacy Policy" links in the credit purchase dialog
3. Updated App Store Connect metadata to include EULA link in [App Description/License Agreement]

Users can now easily access these legal documents before making any purchase.

We are using [Apple's Standard EULA / Our Custom EULA at https://yourdomain.com/terms].

Thank you for your consideration.
```

## Files Modified
- `components/subscription-plans.tsx` - Added legal links to subscription UI
- `components/buy-credits-dialog.tsx` - Added legal links to credit purchase UI

## Next Steps
1. ✅ Code changes complete
2. [ ] Deploy to production
3. [ ] Test on iOS device
4. [ ] Update App Store Connect metadata
5. [ ] Resubmit to App Review
