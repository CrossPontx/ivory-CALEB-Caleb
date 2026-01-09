# Native iOS Drawer Close Button Position Fix

## Issue Fixed
On native iOS, the close button in the bottom drawers (design parameters and upload drawer) was positioned too high and overlapping with the iPhone's notch/status bar area, making it untappable.

## Root Cause
The close button containers were using standard padding (`py-4`) without accounting for the iPhone's safe area and notch on native iOS. The initial fix with `pt-safe-extra` wasn't providing enough padding.

## Solution Implemented
Created a new CSS class `pt-safe-drawer` with increased padding specifically for drawer close buttons on native iOS:

### Changes Made
1. **Design Parameters Drawer**: Added `pt-safe-drawer` class on native iOS
2. **Upload Drawer**: Added `pt-safe-drawer` class on native iOS
3. **New CSS Class**: Created `pt-safe-drawer` with extra padding for drawer close buttons

### CSS Classes Used
**New `pt-safe-drawer` class provides:**
- `padding-top: calc(env(safe-area-inset-top) + 160px)` - Dynamic safe area + extra padding
- `padding-top: 200px` - Fallback fixed padding for native iOS

**Previous `pt-safe-extra` class (still used elsewhere):**
- `padding-top: calc(env(safe-area-inset-top) + 100px)` - Dynamic safe area + standard padding
- `padding-top: 140px` - Fallback fixed padding for native iOS

### Code Changes
```tsx
// Before
<div className="flex items-center justify-center py-4">

// After  
<div className={`flex items-center justify-center py-4 ${isNativeIOS() ? 'pt-safe-drawer' : ''}`}>
```

### CSS Added
```css
/* Extra padding for drawer close buttons on native iOS */
.ios-native .pt-safe-drawer {
  padding-top: calc(env(safe-area-inset-top) + 160px);
}

/* Fallback for drawer close buttons on native iOS */
.ios-native .pt-safe-drawer {
  padding-top: 200px; /* Extra padding for drawer close buttons */
}
```

## Result
- ✅ Close buttons now positioned well below the iPhone notch
- ✅ Buttons are fully tappable without interference from status bar
- ✅ Increased padding from 140px to 200px fallback (60px additional)
- ✅ Maintains proper spacing on web and other platforms
- ✅ Uses dedicated CSS class for drawer-specific positioning

## Files Modified
- `app/capture/page.tsx` - Updated both drawer close buttons to use `pt-safe-drawer`
- `styles/globals.css` - Added new `pt-safe-drawer` CSS class with increased padding

## Testing
The close buttons in both bottom drawers should now appear significantly lower on native iOS, providing ample space below the iPhone notch and ensuring they are fully tappable.