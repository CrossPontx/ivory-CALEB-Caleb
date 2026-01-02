# Design Collections & Upload Feature

## Overview
This feature allows users to:
1. Upload nail design photos directly from their phone camera/gallery to their home page
2. Save nail inspiration from any app (TikTok, Instagram, Pinterest, browser) using iOS Share Extension
3. Organize saved designs in collections with source links

## Database Schema Updates

### New Tables

#### `collections` - User's design collections
```sql
CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `saved_designs` - Designs saved from external sources or uploads
```sql
CREATE TABLE saved_designs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  collection_id INTEGER REFERENCES collections(id),
  image_url TEXT NOT NULL,
  title VARCHAR(255),
  source_url TEXT, -- Original source (TikTok, IG, Pinterest, etc.)
  source_type VARCHAR(50), -- 'upload', 'share_extension', 'web'
  notes TEXT,
  tags JSONB, -- Array of tags for organization
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Steps

### Phase 1: Upload from Phone (Web/PWA)
- Add upload button to home page "My Designs" tab
- Allow users to upload photos from camera or gallery
- Save to "Your Designs" collection
- Display alongside AI-generated designs

### Phase 2: Collections System
- Create default "Your Designs" collection for each user
- Allow users to create custom collections
- Add collection management UI
- Enable moving designs between collections

### Phase 3: iOS Share Extension
- Create iOS Share Extension target in Xcode
- Handle image sharing from any app
- Allow adding source URL and notes
- Save to selected collection
- Sync with main app

## User Flow

### Upload Flow
1. User taps "Upload Design" button on home page
2. Choose from camera or photo library
3. Optionally add title, notes, and source URL
4. Select collection (default: "Your Designs")
5. Design appears in home page grid

### Share Extension Flow
1. User sees nail inspo in TikTok/IG/Pinterest/browser
2. Taps Share button → "Save to Ivory's Choice"
3. Mini UI opens with:
   - Image preview
   - Source URL (auto-captured)
   - Optional title/notes
   - Collection selector
4. Taps "Save"
5. Design saved without leaving the app
6. Next time they open Ivory's Choice, it's in their collection

## Technical Architecture

### Frontend Components
- `UploadDesignDialog` - Upload UI with camera/gallery picker
- `CollectionSelector` - Dropdown to choose collection
- `SavedDesignCard` - Display saved designs with source link
- `CollectionManager` - Create/edit/delete collections

### API Endpoints
- `POST /api/saved-designs` - Save new design
- `GET /api/saved-designs` - Get user's saved designs
- `PATCH /api/saved-designs/[id]` - Update design
- `DELETE /api/saved-designs/[id]` - Delete design
- `POST /api/collections` - Create collection
- `GET /api/collections` - Get user's collections
- `PATCH /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection

### iOS Share Extension
- New target in Xcode project
- Shares app group with main app for data sync
- Minimal UI for quick saving
- Background sync when main app opens

## Benefits
- Users can save inspiration from anywhere
- No need to screenshot and manually upload later
- Organized collections for different styles/occasions
- Source links preserved for reference
- Seamless workflow without app switching
