# Native iOS Drawer Close Button Position Fix

## Issue Fixed
On native iOS, the close button in the bottom drawers (design parameters and upload drawer) was positioned too high and overlapping with the iPhone's notch/status bar area.

## Root Cause
The close button containers were using standard padding (`py-4`) without accounting for the iPhone's safe area and notch on native iOS.

## Solution Implemented
Added conditional padding for native iOS using the existing `pt-safe-extra` CSS class:

### Changes Made
1. **Design Parameters Drawer**: Added `pt-safe-extra` class on native iOS
2. **Upload Drawer**: Added `pt-safe-extra` class on native iOS

### CSS Class Used
The existing `pt-safe-extra` class provides:
- `padding-top: calc(env(safe-area-inset-top) + 100px)` - Dynamic safe area + extra padding
- `padding-top: 140px` - Fallback fixed padding for native iOS

### Code Changes
```tsx
// Before
<div className="flex items-center justify-center py-4">

// After  
<div className={`flex items-center justify-center py-4 ${isNativeIOS() ? 'pt-safe-extra' : ''}`}>
```

## Result
- ✅ Close buttons now positioned properly below the iPhone notch
- ✅ No overlap with status bar area
- ✅ Maintains proper spacing on web and other platforms
- ✅ Uses existing CSS infrastructure for consistency

## Files Modified
- `app/capture/page.tsx` - Added conditional padding to both drawer close buttons

## Testing
The close buttons in both bottom drawers should now appear properly positioned below the iPhone notch on native iOS, while maintaining the same appearance on web and other platforms.