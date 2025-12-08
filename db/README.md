# Database Setup

This project uses [Neon](https://neon.tech) as the PostgreSQL database and [Drizzle ORM](https://orm.drizzle.team) for database operations.

## Setup

1. The database connection is configured in `.env.local`
2. Schema is defined in `db/schema.ts`
3. Database client is exported from `db/index.ts`

## Available Scripts

- `yarn db:push` - Push schema changes to the database (no migrations)
- `yarn db:generate` - Generate migration files
- `yarn db:migrate` - Run migrations
- `yarn db:studio` - Open Drizzle Studio (visual database browser)

## Database Schema

### Core Tables

#### users
Main user table for both clients and nail techs
- `id`, `username`, `email`, `passwordHash`
- `authProvider` - email, google, or apple
- `userType` - client or tech
- `avatar`, `createdAt`, `updatedAt`

#### techProfiles
Extended profile information for nail technicians
- `userId` (references users)
- `businessName`, `location`, `bio`
- `rating`, `totalReviews`
- `phoneNumber`, `website`, `instagramHandle`
- `isVerified`

#### looks
Nail design looks created by users
- `userId` (references users)
- `title`, `imageUrl`, `originalImageUrl`
- `aiPrompt` - AI generation prompt if used
- `nailPositions` - JSONB with nail coordinates and colors
- `isPublic`, `shareToken`, `allowCollaborativeEdit`
- `viewCount`

#### designRequests
Design requests sent from clients to nail techs
- `lookId`, `clientId`, `techId`
- `status` - pending, approved, modified, rejected, completed
- `clientMessage`, `techResponse`
- `estimatedPrice`, `appointmentDate`

#### services
Services offered by nail techs
- `techProfileId` (references techProfiles)
- `name`, `description`, `price`, `duration`
- `isActive`

#### portfolioImages
Gallery images for nail tech portfolios
- `techProfileId`, `imageUrl`, `caption`
- `orderIndex`

#### colorPalettes
Predefined and custom color palettes
- `name`, `category` (classic, seasonal, branded)
- `colors` - JSONB array of hex colors
- `brandName`, `isPublic`, `createdBy`

#### aiGenerations
AI-generated design variations
- `userId`, `prompt`
- `generatedImages` - JSONB array of image URLs
- `selectedImageUrl`, `lookId`

#### favorites
User-saved favorite looks
- `userId`, `lookId`

#### reviews
Reviews for nail techs
- `techProfileId`, `clientId`, `designRequestId`
- `rating` (1-5), `comment`
- `images` - JSONB array of image URLs

#### notifications
User notifications
- `userId`, `type`, `title`, `message`
- `relatedId`, `isRead`

## API Routes

### Users
- `GET /api/users` - Get all users or by email
- `POST /api/users` - Create new user

### Tech Profiles
- `GET /api/tech-profiles` - Get all tech profiles or by userId
- `POST /api/tech-profiles` - Create tech profile
- `PATCH /api/tech-profiles` - Update tech profile

### Looks
- `GET /api/looks` - Get all looks or by userId
- `POST /api/looks` - Create new look

### Design Requests
- `GET /api/design-requests` - Get requests by techId or clientId
- `POST /api/design-requests` - Create new request
- `PATCH /api/design-requests` - Update request status

## Usage Examples

```typescript
import { db } from '@/db';
import { users, looks, designRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Create a user
const newUser = await db.insert(users).values({
  username: 'sarah_nails',
  email: 'sarah@example.com',
  userType: 'tech',
  authProvider: 'email'
}).returning();

// Get user's looks
const userLooks = await db
  .select()
  .from(looks)
  .where(eq(looks.userId, userId));

// Create a design request
await db.insert(designRequests).values({
  lookId: 1,
  clientId: 2,
  techId: 3,
  clientMessage: 'Would love this for my wedding!',
  status: 'pending'
});
```

## Schema Changes

1. Modify `db/schema.ts`
2. Run `yarn db:push` to apply changes to the database

For production, use migrations:
1. Run `yarn db:generate` to create migration files
2. Run `yarn db:migrate` to apply migrations
