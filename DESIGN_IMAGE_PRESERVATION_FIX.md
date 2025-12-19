# Design Image Preservation Fix

## Problem
When someone shares their design and you click "Edit This Design", the system was showing "Upload Design Images (0/5)" instead of preserving the shared design images that were used to create the design.

## Root Cause
The issue was in how the metadata was being loaded when editing a shared design. The system needed to:
1. Check if the design has `designMetadata` with `selectedDesignImages`
2. Preserve those images if they exist
3. Fall back to using the generated image as a reference if metadata is missing

## Solution

### 1. Fixed Metadata Loading in `app/shared/[id]/page.tsx`
Updated the metadata creation logic to properly preserve `selectedDesignImages`:

```typescript
const metadata = (look.designMetadata && Object.keys(look.designMetadata).length > 0) ? {
  ...look.designMetadata,
  // Preserve the original selectedDesignImages if they exist, otherwise use the generated image
  selectedDesignImages: look.designMetadata.selectedDesignImages && look.designMetadata.selectedDesignImages.length > 0 
    ? look.designMetadata.selectedDesignImages 
    : [look.imageUrl]
} : {
  // Default metadata for designs without metadata
  designSettings: { /* ... */ },
  selectedDesignImages: [look.imageUrl], // Use the generated image as a reference
  // ... other defaults
}
```

### 2. Added Debug Logging
Added comprehensive logging to track the flow:
- In `app/shared/[id]/page.tsx`: Logs metadata and selectedDesignImages when editing
- In `app/capture/page.tsx`: Logs when selectedDesignImages state changes

## How It Works Now

### When Editing a Design with Metadata:
1. User clicks "Edit This Design" on a shared design
2. System loads `look.designMetadata` from the database
3. If `selectedDesignImages` exists in metadata, those images are preserved
4. The images are stored in localStorage and loaded into the capture page
5. UI shows "Upload Design Images (X/5)" where X is the number of preserved images

### When Editing a Design without Metadata:
1. User clicks "Edit This Design" on an older design
2. System creates default metadata
3. Uses the generated design image as a reference image
4. UI shows "Upload Design Images (1/5)" with the generated image

## Testing
To verify the fix:
1. Create a new design with uploaded reference images
2. Save and share the design
3. Click "Edit This Design"
4. Verify that the reference images are preserved and shown in the UI
5. Check browser console for debug logs showing the images being loaded

## Files Modified
- `app/shared/[id]/page.tsx` - Fixed metadata preservation logic
- `app/capture/page.tsx` - Added debug logging for selectedDesignImages

## Database Schema
The `looks` table stores `designMetadata` as JSONB, which includes:
- `designSettings` - All design parameters (length, shape, color, etc.)
- `selectedDesignImages` - Array of reference image URLs
- `drawingImageUrl` - Optional drawing overlay
- `aiPrompt` - Optional AI prompt
- `influenceWeights` - Influence percentages for each parameter
- Other capture page settings

## Future Improvements
- Consider migrating older designs to include metadata
- Add UI indicator showing which images are from the original design
- Allow users to see the difference between original and edited designs
