# Mobile Testing Guide - Nail Tech Features

## Quick Test Checklist

### 1. Tech Profile Setup (Photo Upload)
**Path**: `/tech/profile-setup`

#### Test Steps:
1. **Login as Tech User**
   - Navigate to app
   - Login with tech account
   - Go to Profile → Tech Profile Setup

2. **Business Information**
   - [ ] Fill in business name (tap input, keyboard appears)
   - [ ] Fill in location
   - [ ] Fill in bio (multiline textarea)
   - [ ] All inputs are properly sized (44px+ height)
   - [ ] Text is readable (14-16px)

3. **Services & Prices**
   - [ ] Tap "Add Service" button
   - [ ] Fill in service name
   - [ ] Fill in price (number keyboard appears)
   - [ ] Remove service with X button
   - [ ] All buttons are touch-friendly (44px+)

4. **Portfolio Gallery Upload**
   - [ ] Tap "Choose Photos" button
   - [ ] Select "Take Photo" (camera opens)
   - [ ] Take a photo of nail work
   - [ ] Photo uploads with progress indicator
   - [ ] Photo appears in grid
   - [ ] Tap "Choose Photos" again
   - [ ] Select "Photo Library"
   - [ ] Select multiple photos (2-3)
   - [ ] All photos upload sequentially
   - [ ] Progress shows "Uploading X/Y..."
   - [ ] All photos appear in grid

5. **Image Management**
   - [ ] Hover/tap on image
   - [ ] X button appears in corner
   - [ ] Tap X to remove image
   - [ ] Image is removed from grid
   - [ ] Counter updates (X/20 images)

6. **Save Profile**
   - [ ] Tap "Save" button in header
   - [ ] Loading spinner appears
   - [ ] Toast notification shows "Profile saved"
   - [ ] Redirects to tech dashboard

### 2. Tech Dashboard (Gallery View)
**Path**: `/tech/dashboard`

#### Test Steps:
1. **Navigate to Gallery Tab**
   - [ ] Tap "Gallery" tab
   - [ ] Portfolio images display in grid
   - [ ] Grid is 2 columns on mobile
   - [ ] Grid is 3 columns on tablet
   - [ ] Images load properly
   - [ ] Image count shows correctly

2. **Empty State** (if no images)
   - [ ] "Build Your Portfolio" message shows
   - [ ] "Add Photos" button is visible
   - [ ] Tap button → redirects to profile setup

3. **Add More Photos**
   - [ ] "Add More" button visible when images exist
   - [ ] Tap button → redirects to profile setup
   - [ ] Can add more photos
   - [ ] Return to dashboard → new photos visible

### 3. Mobile Responsiveness

#### Portrait Mode (iPhone/Android)
- [ ] All text is readable (no tiny fonts)
- [ ] Buttons are easy to tap (44px+ targets)
- [ ] No horizontal scrolling
- [ ] Images fit properly in grid
- [ ] Safe areas respected (notched devices)
- [ ] Bottom navigation doesn't overlap content
- [ ] Keyboard doesn't break layout

#### Landscape Mode
- [ ] Layout adjusts properly
- [ ] Grid shows more columns
- [ ] All content accessible
- [ ] No weird spacing issues

#### Tablet (iPad)
- [ ] Larger grid (3 columns)
- [ ] Proper spacing
- [ ] Text scales appropriately
- [ ] Touch targets still comfortable

### 4. Touch Interactions

#### Buttons
- [ ] Active state feedback (scale down on press)
- [ ] Smooth transitions
- [ ] No double-tap delay
- [ ] Clear visual feedback

#### Images
- [ ] Tap to view (if implemented)
- [ ] Smooth hover states
- [ ] Remove button easy to tap
- [ ] No accidental taps

#### Forms
- [ ] Inputs focus properly
- [ ] Keyboard appears correctly
- [ ] Can scroll while keyboard open
- [ ] Submit works on keyboard "Go"

### 5. Performance

#### Image Upload
- [ ] Upload starts immediately
- [ ] Progress indicator smooth
- [ ] No UI freezing
- [ ] Multiple uploads work
- [ ] Large images compress properly
- [ ] Upload completes successfully

#### Page Load
- [ ] Dashboard loads quickly
- [ ] Images load progressively
- [ ] No layout shift
- [ ] Smooth scrolling
- [ ] No janky animations

### 6. Error Handling

#### Upload Errors
- [ ] File too large → shows alert
- [ ] Wrong file type → shows alert
- [ ] Network error → shows error message
- [ ] Can retry after error

#### Form Errors
- [ ] Missing required fields → validation
- [ ] Invalid data → clear error message
- [ ] Can correct and resubmit

### 7. Edge Cases

#### Many Images (15-20)
- [ ] Grid scrolls smoothly
- [ ] All images load
- [ ] Remove still works
- [ ] Counter accurate

#### Long Text
- [ ] Business name truncates properly
- [ ] Bio wraps correctly
- [ ] Service names don't overflow

#### Slow Connection
- [ ] Upload progress shows
- [ ] Doesn't timeout prematurely
- [ ] User can cancel
- [ ] Retry works

## Device-Specific Tests

### iOS (Safari)
- [ ] Camera permission prompt works
- [ ] Photo library access works
- [ ] Safe area insets correct
- [ ] Haptic feedback (if implemented)
- [ ] No webkit-specific bugs

### Android (Chrome)
- [ ] Camera permission prompt works
- [ ] File picker works
- [ ] Material design feels native
- [ ] Back button works correctly
- [ ] No android-specific bugs

## Common Issues to Watch For

1. **Touch Targets Too Small**
   - Buttons should be minimum 44x44px
   - Increase padding if needed

2. **Text Too Small**
   - Minimum 14px for body text
   - 16px for inputs

3. **Images Not Loading**
   - Check storage configuration
   - Verify API endpoints
   - Check CORS settings

4. **Layout Breaking**
   - Test with keyboard open
   - Test in landscape
   - Test on small screens (iPhone SE)

5. **Upload Failing**
   - Check file size limits
   - Verify storage credentials
   - Check network connectivity

## Success Criteria

✅ All uploads work smoothly
✅ Images display correctly
✅ Touch interactions feel native
✅ No layout issues on any device
✅ Performance is smooth (60fps)
✅ Error handling is clear
✅ User can complete full workflow

## Report Issues

If you find any issues:
1. Note the device/browser
2. Describe the steps to reproduce
3. Include screenshots if possible
4. Note any error messages
5. Check browser console for errors
