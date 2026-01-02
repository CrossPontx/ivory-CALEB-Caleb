# Onboarding Desktop Debugging Guide

## Issue
After clicking "Open Upload Drawer" button (step 2), the onboarding stays stuck on step 2 instead of advancing to step 3 on desktop.

## Debug Logs Added

I've added console logging to help debug this issue. When you test the onboarding, open the browser console (F12) and you'll see:

### Log Output

```javascript
🔍 Drawer state changed: { 
  shouldShowOnboarding: true/false, 
  onboardingStep: 0-8, 
  isUploadDrawerOpen: true/false 
}
```

When the conditions are met, you'll also see:
```javascript
✅ Advancing from step 2 to step 3 (upload button)
```

## Expected Behavior

### Step 2: Open Upload Drawer

1. User is on step 2 (onboardingStep === 1, because it's 0-indexed)
2. Tooltip appears next to upload drawer button
3. User clicks the button
4. `isUploadDrawerOpen` changes from `false` to `true`
5. useEffect detects the change
6. After 500ms delay, advances to step 3 (setOnboardingStep(2))

### What to Check in Console

When you click the upload drawer button, you should see:

```
🔍 Drawer state changed: { 
  shouldShowOnboarding: true, 
  onboardingStep: 1, 
  isUploadDrawerOpen: true 
}
✅ Advancing from step 2 to step 3 (upload button)
```

## Possible Issues

### Issue 1: onboardingStep is not 1
**Symptom**: Console shows `onboardingStep: 0` or `onboardingStep: 2`
**Cause**: Onboarding is on wrong step
**Solution**: Check if step 1 was completed properly

### Issue 2: shouldShowOnboarding is false
**Symptom**: Console shows `shouldShowOnboarding: false`
**Cause**: Onboarding was already completed or not initialized
**Solution**: Clear localStorage and refresh:
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()
```

### Issue 3: isUploadDrawerOpen stays false
**Symptom**: Console shows `isUploadDrawerOpen: false` even after clicking
**Cause**: Button click not working or state not updating
**Solution**: Check if button is clickable and not blocked by onboarding overlay

### Issue 4: No console logs appear
**Symptom**: No logs in console
**Cause**: useEffect not running
**Solution**: Check if React is rendering properly

## Testing Steps

### 1. Clear Onboarding State
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()
```

### 2. Open Browser Console
- Chrome/Edge: F12 or Ctrl+Shift+I
- Firefox: F12 or Ctrl+Shift+K
- Safari: Cmd+Option+I

### 3. Start Onboarding
- Complete step 1 (take photo)
- You should now be on step 2

### 4. Watch Console
- Click the upload drawer button
- Watch for the console logs
- Note the values shown

### 5. Report Findings
Share the console output to help debug:
- What values are shown?
- Does it say "Advancing from step 2 to step 3"?
- Does the step actually advance?

## Code Location

The useEffect that handles this is in `app/capture/page.tsx` around line 1037:

```typescript
// Auto-advance onboarding when upload drawer opens (step 2 -> step 3)
useEffect(() => {
  console.log('🔍 Drawer state changed:', { 
    shouldShowOnboarding, 
    onboardingStep, 
    isUploadDrawerOpen 
  })
  
  if (shouldShowOnboarding && onboardingStep === 1 && isUploadDrawerOpen) {
    console.log('✅ Advancing from step 2 to step 3 (upload button)')
    setTimeout(() => {
      setOnboardingStep(2)
    }, 500)
  }
}, [isUploadDrawerOpen, shouldShowOnboarding, onboardingStep])
```

## Next Steps

Once you test and share the console output, we can:
1. Identify exactly what's not working
2. Fix the specific issue
3. Remove the debug logs once it's working

---

**Status**: 🔍 DEBUGGING - Please test and share console output
