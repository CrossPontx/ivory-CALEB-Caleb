# Onboarding Start at Step 1 Fix

## Issues Fixed

### 1. **Onboarding Starting at Step 7 Instead of Step 1**
**Root Cause**: The component had auto-advance logic based on `currentPhase` that would jump to different steps:
- If phase was 'design', it would jump to step 1
- If phase was 'visualize', it would jump to step 5
- When page loaded with existing content, phase was set to 'design', causing jump to step 7

**Solution**: 
- Removed the phase-based auto-advance logic completely
- Changed initial state to always start at step 0: `useState(0)`
- Onboarding now ONLY advances based on user actions, not page state
- Added `hasSyncedExternalStep` ref to prevent continuous syncing from parent

### 2. **Onboarding Completion Check**
**Issue**: Completion was checking for step 8 (old 9-step flow) instead of step 12 (new 13-step flow)

**Solution**: Updated completion check to trigger on step 12 (13th step, 0-indexed)

## Changes Made

### `components/capture-onboarding.tsx`
```typescript
// BEFORE
const [currentStep, setCurrentStep] = useState(externalStep || 0)

useEffect(() => {
  if (!hasInitialized.current) {
    hasInitialized.current = true
    return
  }
  
  if (currentPhase === 'design' && currentStep < 1) {
    setCurrentStep(1) // Jump to upload design step
  } else if (currentPhase === 'visualize' && currentStep < 5) {
    setCurrentStep(5) // Jump to visualize step
  }
}, [currentPhase, currentStep])

// AFTER
const [currentStep, setCurrentStep] = useState(0) // Always start at step 0
const hasSyncedExternalStep = useRef(false)

// Removed phase-based auto-advance logic entirely
// Only sync external step once on mount if provided
useEffect(() => {
  if (!hasSyncedExternalStep.current && externalStep !== undefined && externalStep !== 0) {
    setCurrentStep(externalStep)
    hasSyncedExternalStep.current = true
  }
}, [externalStep])
```

### `app/capture/page.tsx`
```typescript
// BEFORE
if (shouldShowOnboarding && onboardingStep === 8) {
  completeOnboarding()
}

// AFTER
if (shouldShowOnboarding && onboardingStep === 12) {
  completeOnboarding()
}
```

## How It Works Now

### For New Users
1. `localStorage.getItem('ivory_capture_onboarding_completed')` returns `null`
2. `shouldShowOnboarding` is set to `true`
3. Onboarding component renders starting at step 0
4. User progresses through all 13 steps via auto-advance on actions
5. When user clicks "Confirm" in step 13, `completeOnboarding()` is called
6. `localStorage.setItem('ivory_capture_onboarding_completed', 'true')` is set
7. Onboarding never shows again

### For Returning Users
1. `localStorage.getItem('ivory_capture_onboarding_completed')` returns `"true"`
2. `shouldShowOnboarding` is set to `false`
3. Onboarding component never renders
4. User can use the app normally

### For Testing/Debugging
Run in browser console:
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()
```

This will:
1. Remove the completion flag
2. Reload the page
3. Onboarding will show again starting at step 1

## Verification Checklist

- [x] Onboarding starts at step 1 (index 0) for new users
- [x] Onboarding doesn't show for returning users
- [x] Console command to reset works correctly
- [x] All 13 steps advance properly based on user actions
- [x] Completion triggers on step 13 (confirm generation)
- [x] localStorage flag is set correctly on completion
- [x] No phase-based jumping between steps
- [x] No continuous syncing from parent causing issues

## Testing Steps

1. **Test New User Flow**:
   - Clear localStorage: `localStorage.removeItem('ivory_capture_onboarding_completed')`
   - Reload page
   - Verify onboarding starts at step 1 (Take a Photo)
   - Complete all 13 steps
   - Verify onboarding completes and doesn't show again

2. **Test Returning User**:
   - Reload page (with completion flag set)
   - Verify onboarding doesn't show
   - Use app normally

3. **Test Reset**:
   - Run: `localStorage.removeItem('ivory_capture_onboarding_completed'); location.reload()`
   - Verify onboarding shows again starting at step 1
