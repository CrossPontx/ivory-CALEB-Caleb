# Onboarding 9-Step Update

## Change Summary

Added a dedicated step to show users where to tap to actually upload design images (the upload button inside the drawer), making the flow more comprehensive.

---

## What Changed

### Before (8 Steps)
1. Take Photo
2. Upload Design Images (opens drawer)
3. Close Upload Drawer
4. Drawing Canvas
5. Choose Nail Shape
6. Replace Hand Photo
7. Visualize
8. Confirm Generation

### After (9 Steps)
1. Take Photo
2. **Open Upload Drawer** (tap button to open)
3. **Upload Design Images** (tap upload button inside drawer) ← NEW
4. Close Upload Drawer
5. Drawing Canvas
6. Choose Nail Shape
7. Replace Hand Photo
8. Visualize
9. Confirm Generation

---

## New Step 3: Upload Design Images

### Purpose
Shows users exactly where to tap to select and upload design images from their device.

### Implementation

#### 1. Added Data Attribute to Upload Button
```typescript
<button 
  onClick={() => designUploadRef.current?.click()}
  data-onboarding="upload-design-button"
  className="w-full h-32 border-2 border-dashed..."
>
  <Upload className="w-8 h-8 text-[#8B7355]" />
  <span>Upload Design Images</span>
</button>
```

#### 2. Updated Onboarding Steps
```typescript
{
  id: 'open-upload-drawer',
  title: 'Open Upload Drawer',
  description: 'Tap this button to open the design upload drawer',
  targetElement: 'design-images-option',
  position: 'left',
  action: 'Tap to open drawer'
},
{
  id: 'upload-design',
  title: 'Upload Design Images',
  description: 'Tap here to select and upload reference images of nail designs you like',
  targetElement: 'upload-design-button',
  position: 'top',
  action: 'Tap to upload images'
},
```

#### 3. Updated Step Indices
All subsequent steps shifted by +1:
- Drawing Canvas: 3 → 4 → 5
- Nail Shape: 4 → 5 → 6
- Replace Photo: 5 → 6 → 7
- Visualize: 6 → 7 → 8
- Confirm: 7 → 8 → 9

---

## Complete 9-Step Flow

### Step 1: Take Photo
- Tooltip next to camera button
- User taps to take photo
- Advances to Step 2

### Step 2: Open Upload Drawer
- Tooltip next to upload drawer button (image icon on right side)
- User taps to open drawer
- **Drawer opens → auto-advances to Step 3 after 500ms**

### Step 3: Upload Design Images (NEW)
- Tooltip next to upload button inside drawer
- Shows large dashed border button with "Upload Design Images"
- User taps to select images from device
- User can upload 1-3 images
- Advances to Step 4 (manually or after upload)

### Step 4: Close Upload Drawer
- Tooltip next to bar at top of drawer
- User taps bar to close drawer
- Advances to Step 5

### Step 5: Drawing Canvas
- Tooltip next to drawing canvas button
- User taps to open canvas
- User draws (optional)
- User closes canvas
- Advances to Step 6 (if drawing was made)

### Step 6: Choose Nail Shape
- Tooltip next to nail shape option
- User taps to open design parameters
- User changes nail shape
- User closes parameters
- Advances to Step 7 (if shape was changed)

### Step 7: Replace Hand Photo
- Tooltip next to replace photo button
- Shows "Next" button (doesn't require tap)
- User clicks "Next"
- Advances to Step 8

### Step 8: Visualize
- Tooltip next to visualize button
- User taps visualize button
- Confirmation dialog opens
- Advances to Step 9

### Step 9: Confirm Generation
- Tooltip next to "Confirm" button in dialog
- User taps "Confirm"
- **Onboarding completes**
- Design generation begins

---

## Benefits

### 1. **More Comprehensive**
- Shows every interaction point
- Users understand the complete upload process
- No confusion about where to tap

### 2. **Better Learning**
- Step 2: Learn to open drawer
- Step 3: Learn to upload images
- Step 4: Learn to close drawer
- Complete understanding of the upload workflow

### 3. **Clearer Instructions**
- Each action has its own dedicated step
- Tooltips are more specific
- Users know exactly what to do at each point

---

## Visual Flow

```
Step 2: Open Upload Drawer
┌─────────────────────────────────────┐
│  Design Your Nails                  │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip]                  │   │
│  │  Open Upload Drawer         │   │
│  │  ↓ Tap to open drawer       │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│         ┌─────────┐                │
│         │ 🖼️ OPEN │ ← Pulsing ring │
│         │  DRAWER │                │
│         └─────────┘                │
└─────────────────────────────────────┘

Step 3: Upload Design Images (NEW)
┌─────────────────────────────────────┐
│  Upload Drawer (Open)               │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip]                  │   │
│  │  Upload Design Images       │   │
│  │  Tap here to select and     │   │
│  │  upload reference images    │   │
│  │  ↓ Tap to upload images     │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │ ┌─────────────────────────┐ │   │
│  │ │  📤 Upload Design Images│ │ ← │
│  │ │  (0/3)                  │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│         ↑ Pulsing ring              │
└─────────────────────────────────────┘

Step 4: Close Upload Drawer
┌─────────────────────────────────────┐
│  Upload Drawer (Open)               │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip]                  │   │
│  │  Close the Drawer           │   │
│  │  ↓ Tap to close             │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│         ┌─────────┐                │
│         │ ═══════ │ ← Pulsing ring │
│         │  (bar)  │                │
│         └─────────┘                │
└─────────────────────────────────────┘
```

---

## Testing

### Test Complete 9-Step Flow

```javascript
// Reset onboarding
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()

// Follow 9-step flow:
// 1. Take photo
// 2. Tap upload drawer button → drawer opens
// 3. Tap upload button inside drawer → select images
// 4. Tap bar to close drawer
// 5. Drawing canvas
// 6. Nail shape
// 7. Replace photo (Next)
// 8. Visualize
// 9. Confirm
```

### Verify Step 3 Specifically

1. Complete steps 1-2
2. ✅ **Step 3**: Tooltip should appear next to upload button inside drawer
3. ✅ Tooltip should say "Upload Design Images"
4. ✅ Pulsing ring should highlight the large dashed border button
5. Tap the upload button
6. ✅ File picker should open
7. Select an image
8. ✅ Image should upload
9. Continue to step 4

---

## Summary

The onboarding now has 9 comprehensive steps that guide users through every interaction point, including a dedicated step for the actual upload button inside the drawer. This provides clearer instructions and better learning for first-time users.

**Status**: ✅ COMPLETE AND READY FOR TESTING
