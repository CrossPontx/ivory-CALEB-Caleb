# Camera Black Screen Fix

## Issue Description
When users click back on the camera during first sign up and then try to sign up again, the camera goes black and won't turn on, forcing them to upload an image instead.

## Root Cause Analysis
The issue was caused by improper camera stream cleanup:

1. **Incomplete stream cleanup**: The `stopCamera()` function only stopped the tracks but didn't clear the `streamRef.current` reference
2. **Video element not cleared**: The `videoRef.current.srcObject` wasn't explicitly set to null
3. **Race conditions**: When starting a new camera session, the old stream might still be active

## Fix Implementation

### 1. Enhanced `stopCamera()` Function
```typescript
const stopCamera = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null  // ✅ Added: Clear stream reference
  }
  
  // ✅ Added: Clear video element source
  if (videoRef.current) {
    videoRef.current.srcObject = null
    videoRef.current.pause()
  }
}
```

### 2. Enhanced `startCamera()` Function
```typescript
const startCamera = async () => {
  try {
    // ✅ Added: Clean up any existing stream first
    stopCamera()
    
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera is not supported on this device or browser.")
      return
    }

    // ... permission checks ...

    // ✅ Added: Small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100))

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode } 
    })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }
  } catch (error) {
    // ... error handling ...
  }
}
```

### 3. Increased Timeout Delays
- Changed camera initialization timeouts from 100ms to 200ms
- This ensures previous streams are fully stopped before starting new ones

## Testing Steps

### Test Case 1: Sign-up Flow Camera Issue
1. Go to sign-up page
2. Start camera capture
3. Click back/cancel
4. Try to sign up again
5. ✅ Camera should start properly (not black screen)

### Test Case 2: Tab Switching
1. Capture a photo in one tab
2. Switch to another tab
3. Switch back to original tab
4. ✅ Camera state should be properly managed

### Test Case 3: Camera Flip
1. Start camera
2. Flip camera (front/back)
3. ✅ Camera should switch smoothly without black screen

## Files Modified
- `app/capture/page.tsx`: Enhanced camera cleanup and initialization

## Prevention Measures
1. **Always call `stopCamera()` before `startCamera()`**
2. **Clear both stream reference and video element source**
3. **Add appropriate delays for cleanup completion**
4. **Proper cleanup in component unmount**

## Browser Compatibility
- ✅ Chrome/Safari: Improved stream management
- ✅ Mobile browsers: Better permission handling
- ✅ iOS native: Uses existing native camera manager

## Related Issues Fixed
- Camera not starting after navigation back
- Black screen on second camera attempt
- Stream not properly released causing device conflicts