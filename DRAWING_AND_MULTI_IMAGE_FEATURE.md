# Drawing & Multiple Design Images Feature

## Overview
Enhanced the nail design generation system with two powerful new features:
1. **Drawing as Design Guide** - Users can draw directly on their hand photo to guide AI generation
2. **Multiple Design Images** - Upload up to 5 reference images for more complex designs

## Features Implemented

### 1. Drawing Integration
- **Drawing Canvas**: Users can draw directly on their captured hand image
- **Visual Feedback**: Draw button changes color (green) when a drawing is saved
- **AI Integration**: Drawing is sent to the AI as a high-priority guide image
- **Purpose**: The drawing acts as an outline/stencil showing exactly where and how to apply the design

**How it works:**
- User clicks the pencil icon on their captured image
- Opens full-screen drawing canvas with color picker, brush sizes, undo/redo
- Drawing is saved and included in the AI generation request
- AI uses the drawing as the PRIMARY GUIDE for design placement and shape
- Drawing has highest priority in the image stack sent to gpt-image-1

### 2. Multiple Design Image Uploads
- **Upload Limit**: Up to 5 reference design images
- **Visual Display**: Shows thumbnails in a grid with remove buttons
- **Batch Upload**: Select multiple images at once
- **Smart UI**: Shows count (e.g., "3 Designs") and stacked preview
- **Influence Control**: Single slider controls influence of all design images

**How it works:**
- User clicks "Upload Design Images (0/5)" button
- Can select multiple images from their device
- Each image is uploaded and added to the array
- All images are sent to the AI for reference
- AI can blend elements from multiple designs or apply different designs to different nails

## Technical Changes

### Frontend (`app/capture/page.tsx`)
- Changed `selectedDesignImage` (string) → `selectedDesignImages` (string[])
- Added `drawingImageUrl` state to track user's drawing
- Updated `handleDesignUpload` to support multiple file selection
- Added `removeDesignImage` function to remove individual images
- Modified UI to show grid of uploaded images with remove buttons
- Added visual indicator when drawing is active (green button)
- Updated session storage to persist drawing and multiple images

### Backend (`app/api/generate-nail-design/route.ts`)
- Updated to accept `selectedDesignImages` array and `drawingImageUrl`
- Modified image preparation logic:
  1. Hand photo (always first)
  2. Drawing image (if present - highest priority guide)
  3. Design reference images (1-5 images)
- Enhanced prompt to explain drawing's role as PRIMARY GUIDE
- Updated instructions for handling multiple reference images
- Added logic to blend multiple design references

### Drawing Canvas (`components/drawing-canvas.tsx`)
- No changes needed - already fully functional
- Supports colors, brush sizes, undo/redo, clear
- Exports drawing as data URL

## User Experience Flow

### With Drawing:
1. Capture/upload hand photo
2. Click pencil icon to open drawing canvas
3. Draw outline/guide on the image (e.g., where to place flowers, lines, etc.)
4. Save drawing (button turns green)
5. Optionally upload design reference images
6. Click "Generate Preview"
7. AI follows the drawing as a guide while applying the design style

### With Multiple Design Images:
1. Capture/upload hand photo
2. Click "Upload Design Images"
3. Select 1-5 reference images
4. Images appear in a grid with remove buttons
5. Adjust influence slider (0-100%)
6. Click "Generate Preview"
7. AI blends elements from all reference images

### Combined (Drawing + Multiple Images):
1. Capture hand photo
2. Draw outline/guide on image
3. Upload multiple design references
4. AI uses drawing for placement/shape and references for style/colors
5. Most powerful combination for precise, complex designs

## Benefits

### For Users:
- **More Control**: Drawing lets users specify exact placement
- **More Inspiration**: Multiple references for complex designs
- **Better Results**: AI has more context to work with
- **Creative Freedom**: Combine drawing + references for unique results

### For AI Generation:
- **Clear Intent**: Drawing shows exactly what user wants
- **Rich Context**: Multiple references provide more design information
- **Better Accuracy**: More input images = better understanding
- **Flexible Output**: Can blend multiple styles or apply different designs per nail

## Session Persistence
All data is preserved across page refreshes:
- `captureSession_drawingImageUrl` - User's drawing
- `captureSession_selectedDesignImages` - Array of design references
- `captureSession_finalPreviews` - Generated results
- `captureSession_designSettings` - Design parameters

## Limits & Validation
- **Max Design Images**: 5 (prevents overwhelming the AI)
- **Drawing**: Single drawing per session (can be edited/replaced)
- **File Types**: Images only (validated on upload)
- **Credits**: Still 1 credit per generation (regardless of image count)

## Future Enhancements
- Allow multiple drawings (layers)
- Drawing templates/presets
- AI-suggested design combinations
- Save favorite design image sets
- Share design image collections
