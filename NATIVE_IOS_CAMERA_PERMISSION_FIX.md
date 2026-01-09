# Native iOS Camera Permission Fix

## Issue Fixed
On native iOS TestFlight, camera permission dialog was showing "ivoryschoice.vercel.app is requesting camera permissions" instead of "Ivory's Choice App".

## Root Cause
The app was using `navigator.mediaDevices.getUserMedia()` (web camera API) which shows the domain name in permission dialogs, even when running in a native iOS app.

## Solution Implemented
Modified the capture page to use native camera functions on iOS instead of web camera API:

### 1. Updated Camera Functions
- **`startCamera()`**: On native iOS, skips web camera stream initialization
- **`capturePhoto()`**: Uses `takePicture({ source: 'camera' })` from native bridge
- **`handleFileUpload()`**: Uses `takePicture({ source: 'photos' })` for photo library
- **`replaceHandPhoto()`**: Uses native camera directly instead of clearing state

### 2. Updated UI Components
- **Video Element**: Hidden on native iOS, shows placeholder with camera icon
- **Flip Camera Button**: Hidden on native iOS (not applicable)
- **Zoom Controls**: Disabled on native iOS (handled by native camera)
- **Photo Library Button**: Uses native picker on iOS
- **Instructional Text**: Updated for native iOS experience

### 3. Native Camera Integration
Uses existing `CameraManager.swift` implementation:
- Shows proper app name "Ivory's Choice" in permission dialogs
- Provides native iOS camera experience
- Handles both camera and photo library access
- Returns base64 data URL compatible with existing code

## Files Modified
- `app/capture/page.tsx` - Main camera implementation
- Added imports for `isNativeIOS` and `takePicture` from native bridge

## Testing
1. **Permission Dialog**: Now shows "Ivory's Choice" instead of domain name
2. **Camera Functionality**: Native camera opens when tapping capture button
3. **Photo Library**: Native photo picker opens when tapping gallery button
4. **Replace Photo**: Uses native camera directly
5. **UI Experience**: Clean native iOS interface without web camera controls

## Benefits
- ✅ Proper app name in permission dialogs
- ✅ Native iOS camera experience
- ✅ Better performance (no web camera stream)
- ✅ Consistent with iOS design patterns
- ✅ Maintains compatibility with web version

## Technical Details
The fix detects native iOS using `isNativeIOS()` and conditionally:
- Uses native camera functions instead of web APIs
- Hides web-specific UI elements (video, flip button, zoom)
- Shows appropriate placeholder and instructions
- Maintains the same data flow and state management

This ensures users see "Ivory's Choice" requesting camera permissions instead of the web domain name.