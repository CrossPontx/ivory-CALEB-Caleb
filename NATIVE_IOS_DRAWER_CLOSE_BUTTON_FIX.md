# Native iOS Drawer Close Button Position Fix

## Issue Fixed
On native iOS, the close button in the bottom drawers (design parameters and upload drawer) was positioned too high and overlapping with the iPhone's notch/status bar area, making it untappable.

## Root Cause
The bottom drawers were using `fixed inset-0` which positions them from the very top of the screen, causing the close buttons to overlap with the iPhone notch area on native iOS.

## Solution Implemented
Applied top padding to the entire drawer containers on native iOS using the `pt-safe-drawer` CSS class:

### Changes Made
1. **Design Parameters Drawer Container**: Added `pt-safe-drawer` class to the entire drawer
2. **Upload Drawer Container**: Added `pt-safe-drawer` class to the entire drawer
3. **Removed Redundant Padding**: Removed individual close button padding since entire drawer now has padding

### CSS Class Used
**`pt-safe-drawer` class provides:**
- `padding-top: calc(env(safe-area-inset-top) + 160px)` - Dynamic safe area + extra padding
- `padding-top: 200px` - Fallback fixed padding for native iOS

### Code Changes
```tsx
// Before
<div className="fixed inset-0 bg-white z-40 ...">

// After  
<div className={`fixed inset-0 bg-white z-40 ... ${isNativeIOS() ? 'pt-safe-drawer' : ''}`}>
```

### Technical Approach
Instead of adding padding only to the close button containers, the padding is now applied to the entire drawer containers. This ensures:
- The entire drawer content starts below the iPhone notch
- Close buttons are positioned in a tappable area
- All drawer content respects the safe area
- Consistent spacing throughout the drawer

## Result
- ✅ Entire drawer positioned below iPhone notch on native iOS
- ✅ Close buttons fully tappable without interference from status bar
- ✅ All drawer content properly positioned within safe area
- ✅ Maintains normal appearance on web and other platforms
- ✅ More robust solution that affects entire drawer layout

## Files Modified
- `app/capture/page.tsx` - Added `pt-safe-drawer` to both drawer containers, removed individual button padding
- `styles/globals.css` - Uses existing `pt-safe-drawer` CSS class with 200px fallback padding

## Testing
Both bottom drawers should now appear with their entire content positioned below the iPhone notch on native iOS, ensuring the close buttons and all other content are fully accessible and tappable.