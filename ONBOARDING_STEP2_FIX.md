# Onboarding Step 2 Fix

## Issue
After clicking the upload design images button, the onboarding stayed at step 2 instead of advancing to step 3 (close drawer).

## Root Cause
The onboarding was waiting for an upload to complete before advancing, but it should advance as soon as the drawer opens.

## Solution
Added a useEffect that detects when the upload drawer opens and automatically advances from step 2 to step 3.

---

## Code Changes

### Added useEffect to Detect Drawer Opening

```typescript
// Auto-advance onboarding when upload drawer opens (step 2 -> step 3)
useEffect(() => {
  if (shouldShowOnboarding && onboardingStep === 1 && isUploadDrawerOpen) {
    // User opened upload drawer, advance to step 3 (close drawer step) after a short delay
    setTimeout(() => {
      setOnboardingStep(2)
    }, 500)
  }
}, [isUploadDrawerOpen, shouldShowOnboarding, onboardingStep])
```

### Removed Upload Complete Logic

Removed the logic from `handleDesignUpload` that was trying to advance after upload completion, since we now advance when the drawer opens.

---

## New Flow

### Step 2: Upload Design Images

**Before (Broken)**:
1. User taps upload button
2. Drawer opens
3. Onboarding stays at step 2 ❌
4. User uploads image
5. Onboarding advances to step 3

**After (Fixed)**:
1. User taps upload button
2. Drawer opens
3. ✅ **Onboarding automatically advances to step 3** (after 500ms delay)
4. Tooltip appears next to close button
5. User can upload image (optional)
6. User taps close button to advance to step 4

---

## Benefits

1. **Immediate feedback** - User sees the next step right away
2. **No waiting** - Don't need to upload an image to proceed
3. **Clearer flow** - Drawer opens → tooltip shows how to close it
4. **More flexible** - User can skip uploading and just close the drawer

---

## Testing

### Test Step 2 → Step 3 Transition

1. Start onboarding
2. Complete step 1 (take photo)
3. ✅ **Step 2**: Tooltip appears next to upload button
4. Tap upload button
5. ✅ **Drawer opens**
6. ✅ **Wait 500ms**
7. ✅ **Step 3**: Tooltip should appear next to close button (bar at top)
8. Tap close button
9. ✅ **Step 4**: Tooltip should appear next to drawing canvas button

### Full Flow Test

```javascript
// Reset onboarding
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()

// Follow 8-step flow:
// 1. Take photo
// 2. Tap upload button → drawer opens → auto-advances to step 3
// 3. Close drawer
// 4. Drawing canvas
// 5. Nail shape
// 6. Replace photo (Next)
// 7. Visualize
// 8. Confirm
```

---

## Summary

The onboarding now correctly advances from step 2 to step 3 when the upload drawer opens, instead of waiting for an upload to complete. This provides immediate feedback and a smoother user experience.

**Status**: ✅ FIXED AND READY FOR TESTING
