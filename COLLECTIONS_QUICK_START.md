# Collections & Upload Feature - Quick Start

## What's New

Users can now:
1. ✅ **Upload designs** from their phone camera/gallery
2. ✅ **Save inspiration** from any app (TikTok, IG, Pinterest, browser) via iOS Share Extension
3. ✅ **Organize designs** in collections with source links

## Database Setup

Run the migration:

```bash
# Connect to your database and run:
psql $DATABASE_URL -f db/migrations/add_collections_and_saved_designs.sql
```

This creates:
- `collections` table - User's design collections
- `saved_designs` table - Uploaded and shared designs
- Default "Your Designs" collection for all existing users

## Features Implemented

### 1. Upload from Phone ✅

**Location**: Home page "My Designs" tab

**How it works**:
- Click "Upload Design" button
- Choose from camera or photo library
- Add optional title, source URL, notes
- Select collection
- Design appears in home page grid alongside AI-generated designs

**Files**:
- `components/upload-design-dialog.tsx` - Upload UI
- `app/api/saved-designs/route.ts` - Save design endpoint
- `app/api/upload/route.ts` - Image upload (existing)

### 2. Collections System ✅

**Features**:
- Default "Your Designs" collection auto-created for each user
- Create custom collections
- Move designs between collections
- Delete collections (designs move to default)

**API Endpoints**:
- `GET /api/collections` - Get user's collections
- `POST /api/collections` - Create collection
- `PATCH /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection

### 3. Saved Designs Management ✅

**Features**:
- View all saved designs
- Filter by collection
- Edit title, notes, source URL
- Move to different collection
- Delete designs

**API Endpoints**:
- `GET /api/saved-designs` - Get saved designs
- `POST /api/saved-designs` - Save new design
- `PATCH /api/saved-designs/[id]` - Update design
- `DELETE /api/saved-designs/[id]` - Delete design

### 4. Home Page Integration ✅

**Changes**:
- Combines AI-generated looks and saved designs
- Shows "Saved" badge on uploaded designs
- External link icon for designs with source URLs
- Click saved design to open source URL
- Sorted by creation date (newest first)

## iOS Share Extension (Optional)

For the full "save from any app" experience, follow:
- `IOS_SHARE_EXTENSION_SETUP.md` - Complete setup guide

This allows users to:
1. See nail inspo in TikTok/IG/Pinterest/browser
2. Tap Share → "Save to Ivory's Choice"
3. Design saved without leaving the app
4. Appears in their collection next time they open the app

## Testing

### Test Upload Feature

1. Open app and go to home page
2. Click "Upload Design" button
3. Select an image from gallery or take photo
4. Add title: "Test Design"
5. Add source URL: "https://instagram.com/test"
6. Click "Save Design"
7. Verify design appears in grid with "Saved" badge
8. Click design to open source URL

### Test Collections

1. Create new collection via API:
```bash
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"name": "Summer Vibes", "description": "Bright summer nail designs"}'
```

2. Upload design to new collection
3. Verify it appears in correct collection

### Test API Endpoints

```bash
# Get collections
curl http://localhost:3000/api/collections

# Get saved designs
curl http://localhost:3000/api/saved-designs

# Get designs from specific collection
curl http://localhost:3000/api/saved-designs?collectionId=1
```

## User Flow Examples

### Scenario 1: Upload from Phone
1. User sees their own nails after salon visit
2. Takes photo with phone camera
3. Opens Ivory's Choice app
4. Taps "Upload Design"
5. Selects photo from gallery
6. Adds title "My New Nails"
7. Saves to "Your Designs"
8. Design appears in home page

### Scenario 2: Save from Instagram (with Share Extension)
1. User scrolling Instagram
2. Sees amazing nail design
3. Taps Share button
4. Selects "Save to Ivory's Choice"
5. Mini UI opens with image preview
6. Source URL auto-captured
7. Adds note "Love the color combo"
8. Taps Save
9. Returns to Instagram
10. Later opens Ivory's Choice
11. Design is in their collection with Instagram link

### Scenario 3: Organize Collections
1. User has 50+ saved designs
2. Creates collections:
   - "Wedding Ideas"
   - "Summer Vibes"
   - "Work Appropriate"
   - "Special Occasions"
3. Moves designs into appropriate collections
4. Easily finds inspiration when needed

## Next Steps

### Phase 1 (Completed) ✅
- Database schema
- API endpoints
- Upload dialog component
- Home page integration

### Phase 2 (Optional)
- iOS Share Extension
- Collection management UI
- Bulk operations (move multiple designs)
- Search and filter saved designs

### Phase 3 (Future)
- AI-powered auto-tagging
- Duplicate detection
- Color palette extraction
- Style recommendations based on saved designs

## Benefits

✨ **For Users**:
- Save inspiration from anywhere
- Never lose a design idea
- Organized collections
- Source links preserved
- Seamless workflow

🚀 **For Business**:
- Increased engagement
- More time in app
- Better understanding of user preferences
- Foundation for personalized recommendations
- Competitive advantage

## Support

If you encounter issues:
1. Check database migration ran successfully
2. Verify API endpoints return data
3. Check browser console for errors
4. Review server logs for upload failures

For iOS Share Extension issues, see `IOS_SHARE_EXTENSION_SETUP.md`
