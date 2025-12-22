# Reference Image Persistence Fix

## Problem
When users navigate between tabs or return to old tabs, they were being forced to re-open the camera instead of using already uploaded reference images. This was problematic because:

1. **Lost Reference Images**: `selectedDesignImages` (uploaded design references) were not being properly restored when switching tabs
2. **Lost Original Image**: The `capturedImage` (original hand photo) was sometimes lost when navigating between tabs
3. **Lost Drawing Overlays**: The `drawingImageUrl` (user drawings) were not persisting across tab switches
4. **Camera Auto-Start**: Camera would start even when a tab already had images

## Solution Implemented

### 1. Enhanced Tab State Persistence
The app now properly saves and restores ALL image-related state when switching tabs:
- ✅ Original hand photo (`capturedImage`)
- ✅ Reference design images (`selectedDesignImages`)
- ✅ Drawing overlays (`drawingImageUrl`)
- ✅ Generated previews (`finalPreviews`)

### 2. Database Persistence
All reference images are saved to the database in the `designMetadata` field when a design is saved:

```typescript
const designMetadata = {
  designSettings,
  selectedDesignImages,      // ← Reference images saved here
  drawingImageUrl,            // ← Drawing overlay saved here
  aiPrompt,
  influenceWeights,
  handReference,
  designMode,
  colorLightness,
}
```

### 3. Session Storage
Reference images are now properly stored in `localStorage` for the current session:
- `captureSession_designTabs` - Contains all tab data including images
- `captureSession_activeTabId` - Tracks which tab is active

### 4. Smart Camera Management
The camera now only starts when:
- There's no `capturedImage` available
- The active tab has no content (no images AND no generated designs)
- User explicitly clicks "Change Photo"

## How It Works

### Tab Switching Flow
```
1. User switches to Tab 2
   ↓
2. System checks Tab 2 state
   ↓
3. Restores all images:
   - capturedImage (original hand photo)
   - selectedDesignImages (reference designs)
   - drawingImageUrl (user drawings)
   - finalPreviews (generated designs)
   ↓
4. Camera stays OFF if images exist
```

### Edit Flow
```
1. User clicks "Edit" on a saved design
   ↓
2. System loads from database:
   - originalImageUrl → capturedImage
   - designMetadata.selectedDesignImages → selectedDesignImages
   - designMetadata.drawingImageUrl → drawingImageUrl
   ↓
3. Creates new tab with all data restored
   ↓
4. Camera stays OFF (images already loaded)
```

### New Tab Flow
```
1. User clicks "+" to add new tab
   ↓
2. System copies originalImage from first tab
   ↓
3. New tab starts with same hand photo
   ↓
4. User can add different design references
   ↓
5. Camera stays OFF (original image reused)
```

## Benefits

### For Users
- ✅ **No Re-Capturing**: Never need to retake hand photos when switching tabs
- ✅ **Preserved References**: All uploaded design images stay available
- ✅ **Preserved Drawings**: Drawing overlays persist across navigation
- ✅ **Faster Workflow**: Can quickly experiment with different designs on the same hand photo
- ✅ **Better UX**: No unexpected camera starts

### For Developers
- ✅ **Consistent State**: All image state is properly managed
- ✅ **Database Backed**: Images are saved for future editing
- ✅ **Session Resilient**: Images persist across page refreshes (via localStorage)
- ✅ **Debug Friendly**: Console logs show image state changes

## Technical Details

### State Management
```typescript
type DesignTab = {
  id: string
  name: string
  finalPreviews: string[]
  designSettings: DesignSettings
  selectedDesignImages: string[]      // ← Reference images
  drawingImageUrl: string | null      // ← Drawing overlay
  aiPrompt: string
  originalImage: string | null        // ← Hand photo
  isGenerating: boolean
  generationProgress: number
}
```

### Key Functions

#### `addNewTab()`
- Copies `originalImage` from existing tab
- Prevents camera from starting if image exists
- Allows users to create variations without re-capturing

#### `autoSaveDesigns()`
- Saves all images to database in `designMetadata`
- Includes `selectedDesignImages` and `drawingImageUrl`
- Enables full restoration when editing

#### Tab Sync Effect
```typescript
useEffect(() => {
  if (activeTab) {
    // Restore ALL image state
    setCapturedImage(activeTab.originalImage)
    setSelectedDesignImages(activeTab.selectedDesignImages)
    setDrawingImageUrl(activeTab.drawingImageUrl)
    setFinalPreviews(activeTab.finalPreviews)
    
    // Stop camera if content exists
    if (activeTab.originalImage || activeTab.finalPreviews.length > 0) {
      stopCamera()
    }
  }
}, [activeTabId])
```

## Testing Checklist

- [x] Switch between tabs - images persist
- [x] Add new tab - original image is copied
- [x] Upload reference images - they persist across tabs
- [x] Draw on image - drawing persists across tabs
- [x] Save design - all images saved to database
- [x] Edit saved design - all images restored
- [x] Refresh page - session restored from localStorage
- [x] Camera doesn't start when images exist

## Future Enhancements

### Potential Improvements
1. **Cloud Sync**: Sync reference images across devices
2. **Image Library**: Save frequently used reference images
3. **Batch Upload**: Upload multiple reference images at once
4. **Image Editing**: Crop/rotate reference images before use
5. **Reference Collections**: Organize reference images into collections

### Performance Optimizations
1. **Image Compression**: Compress reference images before storage
2. **Lazy Loading**: Load images only when tab is active
3. **Cache Management**: Clear old session data automatically
4. **Progressive Loading**: Show thumbnails while full images load

## Related Files
- `app/capture/page.tsx` - Main capture page with tab management
- `db/schema.ts` - Database schema with `designMetadata` field
- `app/api/looks/route.ts` - API for saving/loading designs
- `app/shared/[id]/page.tsx` - Edit flow that loads saved designs

## Console Debugging

The app now includes helpful console logs:
```
🔄 Syncing to active tab: tab-123
  - originalImage: EXISTS
  - selectedDesignImages: 2
  - drawingImageUrl: EXISTS
✅ Active tab has content, NOT starting camera
```

Look for these logs to debug image persistence issues.
