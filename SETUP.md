# Ivory - Setup Guide

## Database Integration Complete ✅

The app has been updated to use a real PostgreSQL database (Neon) instead of localStorage and hardcoded data.

## What Changed

### Authentication
- **Sign Up**: Creates real users in the database
- **Login**: Authenticates against database records
- **User Types**: Client/Tech selection updates the database
- Users are stored with username, email, password, auth provider, and user type

### Core Features Now Using Database

#### 1. User Management
- `/api/auth/signup` - Create new users
- `/api/auth/login` - Authenticate users
- `/api/users/update-type` - Update user type (client/tech)

#### 2. Nail Design Looks
- `/api/looks` - GET user's looks, POST new looks
- `/api/looks/[id]` - GET specific look, DELETE look
- Stores: images, titles, AI prompts, nail positions, sharing settings

#### 3. Design Requests
- `/api/design-requests` - GET requests by tech/client, POST new requests
- `/api/design-requests/[id]` - GET request details with related data
- Tracks: status, messages, pricing, appointments

#### 4. Nail Tech Profiles
- `/api/tech-profiles` - GET all techs, POST/PATCH tech profiles
- Stores: business info, location, ratings, contact details

### Pages Updated

All pages now interact with the database:
- ✅ Login/Signup page
- ✅ User type selection
- ✅ Home page (loads user's looks)
- ✅ Editor (saves designs to DB)
- ✅ Look detail page (loads from DB)
- ✅ Send to tech (loads techs from DB, creates requests)
- ✅ Tech dashboard (loads requests from DB)
- ✅ Share page (loads look from DB)
- ✅ Profile page (uses DB user data)

## Getting Started

### 1. Install Dependencies
```bash
yarn install
```

### 2. Environment Variables
The `.env.local` file already contains your Neon database connection string.

### 3. Database Schema
The schema has already been pushed to your Neon database with these tables:
- users
- techProfiles
- looks
- designRequests
- services
- portfolioImages
- colorPalettes
- aiGenerations
- favorites
- reviews
- notifications

### 4. Run the App
```bash
yarn dev
```

### 5. Create Your First User
1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter a username and password
4. Select user type (Client or Tech)
5. Start creating designs!

## Database Management

### View Database
```bash
yarn db:studio
```
Opens Drizzle Studio to visually browse and edit your database.

### Update Schema
1. Edit `db/schema.ts`
2. Run `yarn db:push` to apply changes

## API Routes Reference

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in

### Users
- `GET /api/users?email={email}` - Get user by email
- `PATCH /api/users/update-type` - Update user type

### Looks
- `GET /api/looks?userId={id}` - Get user's designs
- `POST /api/looks` - Create new design
- `GET /api/looks/[id]` - Get specific design
- `DELETE /api/looks/[id]` - Delete design

### Design Requests
- `GET /api/design-requests?techId={id}` - Get tech's requests
- `GET /api/design-requests?clientId={id}` - Get client's requests
- `POST /api/design-requests` - Send design to tech
- `PATCH /api/design-requests` - Update request status
- `GET /api/design-requests/[id]` - Get request with details

### Tech Profiles
- `GET /api/tech-profiles` - Get all nail techs
- `GET /api/tech-profiles?userId={id}` - Get specific tech profile
- `POST /api/tech-profiles` - Create tech profile
- `PATCH /api/tech-profiles` - Update tech profile

## Notes

### Security
⚠️ **Important**: This implementation uses basic authentication for development. For production:
- Hash passwords with bcrypt
- Implement proper JWT tokens or session management
- Add CSRF protection
- Validate all inputs
- Add rate limiting

### Next Steps
- Implement proper authentication (NextAuth.js recommended)
- Add image upload to cloud storage (Cloudinary, S3)
- Implement real AI generation API
- Add email notifications
- Set up proper error handling and logging
