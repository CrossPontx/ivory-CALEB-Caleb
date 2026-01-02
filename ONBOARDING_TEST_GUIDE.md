# Onboarding Testing Guide

## Quick Test Instructions

### 1. Reset Onboarding
Open browser console and run:
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
```

### 2. Refresh the Page
The onboarding should start automatically at Step 1.

### 3. Complete the 8-Step Flow

#### Step 1: Take Photo
- ✅ Tooltip appears next to camera button
- ✅ Mentions "good lighting for best results"
- ✅ Tap camera button to take photo
- ✅ Advances to Step 2

#### Step 2: Upload Design Images
- ✅ Tooltip appears next to upload design button (image icon)
- ✅ Tap to open upload drawer
- ✅ **Drawer opens → automatically advances to Step 3**

#### Step 3: Close Upload Drawer
- ✅ Tooltip appears next to the bar at top of drawer
- ✅ Tap the bar to close drawer
- ✅ Advances to Step 4

#### Step 4: Drawing Canvas
- ✅ Tooltip appears next to drawing canvas button (pencil icon)
- ✅ Tap to open drawing canvas
- ✅ Draw something (optional)
- ✅ Close the canvas
- ✅ Advances to Step 5 (if drawing was made)

#### Step 5: Choose Nail Shape
- ✅ Tooltip appears next to nail shape option
- ✅ Tap to open design parameters
- ✅ Change nail shape
- ✅ Close the parameters
- ✅ Advances to Step 6 (if shape was changed)

#### Step 6: Replace Hand Photo
- ✅ Tooltip appears next to replace photo button
- ✅ Shows "Next" button (doesn't require tapping the button)
- ✅ Click "Next" to continue
- ✅ Advances to Step 7

#### Step 7: Visualize
- ✅ Tooltip appears next to visualize button
- ✅ Tap visualize button
- ✅ Confirmation dialog opens
- ✅ Advances to Step 8

#### Step 8: Confirm Generation
- ✅ Tooltip appears next to "Confirm" button in dialog
- ✅ Tap "Confirm" button
- ✅ **Onboarding completes** (stored in localStorage)
- ✅ Design generation begins

### 4. Verify Completion
Open browser console and run:
```javascript
localStorage.getItem('ivory_capture_onboarding_completed')
// Should return: "true"
```

### 5. Refresh Again
- ✅ Onboarding should NOT show anymore

---

## Mobile Testing

### Viewport Bounds Check
1. Test on small mobile screen (320px width)
2. Verify tooltips never go off-screen
3. Check that tooltips are readable and properly sized
4. Verify auto-scroll brings elements into view

### Touch Interaction
1. Verify tapping outside tooltip doesn't close it
2. Verify tapping target elements advances onboarding
3. Verify "Next" button works on Step 5
4. Verify "Skip tutorial" button works

---

## Desktop Testing

### Positioning Check
1. Test on various screen sizes (1024px, 1440px, 1920px)
2. Verify tooltips position correctly (top/bottom/left/right)
3. Verify arrows point to correct elements
4. Verify spotlight effect highlights target elements

### Interaction
1. Verify clicking target elements advances onboarding
2. Verify "Next" button works on Step 5
3. Verify "Skip tutorial" button works
4. Verify close button (X) works

---

## Edge Cases

### 1. Skip Tutorial
- Click "Skip tutorial" at any step
- Verify onboarding closes
- Verify completion is stored in localStorage
- Refresh page - onboarding should not show

### 2. Close Button
- Click X button at any step
- Should behave same as "Skip tutorial"

### 3. Rapid Clicking
- Quickly click through steps
- Verify no steps are skipped
- Verify tooltips position correctly

### 4. Browser Back Button
- Start onboarding
- Click browser back button
- Return to page
- Verify onboarding state is preserved or resets appropriately

---

## Reset for Testing

### From Settings Page
Navigate to `/settings/onboarding` and click "Reset Onboarding"

### From Console
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()
```

---

## Expected Behavior Summary

✅ **Starts at Step 1** (not Step 2)
✅ **Interactive** (users tap actual UI elements)
✅ **Non-blocking** (users can interact with app)
✅ **Responsive** (tooltips stay within viewport)
✅ **Auto-scroll** (brings elements into view)
✅ **Step 3 guides drawer closing** (user taps bar at top)
✅ **Step 6 has "Next" button** (doesn't require tapping replace button)
✅ **Completes on Confirm** (when user clicks Confirm in dialog)
✅ **Stored in localStorage** (doesn't show again)
✅ **Skippable** (users can skip at any time)

---

## Troubleshooting

### Onboarding doesn't start
- Check localStorage: `localStorage.getItem('ivory_capture_onboarding_completed')`
- If it returns "true", remove it: `localStorage.removeItem('ivory_capture_onboarding_completed')`
- Refresh the page

### Tooltip goes off-screen
- Check browser console for errors
- Verify viewport dimensions
- Test on different screen sizes

### Onboarding doesn't advance
- Check that data-onboarding attributes are present on target elements
- Verify step change callback is working
- Check browser console for errors

### Onboarding doesn't complete
- Verify you're clicking "Confirm" in the generation dialog (Step 7)
- Check localStorage after clicking: `localStorage.getItem('ivory_capture_onboarding_completed')`
- Should return "true" after completion

---

**Ready for Testing!** 🚀
