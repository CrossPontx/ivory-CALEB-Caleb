# Booking System - Quick Start Guide

## Setup (5 minutes)

### 1. Run Database Migration
```bash
# Connect to your database and run the migration
psql -d your_database_name < db/migrations/add_booking_tables.sql

# Or if using a connection string
psql postgresql://user:password@host:port/database < db/migrations/add_booking_tables.sql
```

### 2. Verify Environment Variables
Make sure you have `OPENAI_API_KEY` set in your `.env` file for the AI design breakdown feature.

### 3. Restart Your Dev Server
```bash
yarn dev
# or
npm run dev
```

## Testing the Flow

### As a Client

1. **Navigate to Bookings**
   - Click the calendar icon in bottom navigation
   - Or go to `/bookings`

2. **Search for Nail Techs**
   - Use the search bar to find techs by name
   - Filter by location
   - Browse tech profiles

3. **Book an Appointment**
   - Click "Book Appointment" on a tech's profile
   - Select a service
   - Choose a design (optional)
   - Pick date and time
   - Add notes
   - Submit booking request

4. **View Your Bookings**
   - Switch to "My Bookings" tab
   - See pending, confirmed, and completed appointments

### As a Nail Tech

1. **Set Up Your Profile**
   - Make sure you have a tech profile created
   - Add services with prices and durations
   - Upload portfolio images

2. **Set Your Availability** (Coming Soon)
   - Go to `/tech/availability`
   - Set your weekly schedule
   - Block time off for vacations

3. **View Booking Requests**
   - Go to `/tech/bookings`
   - See "Requests" tab for pending bookings
   - View client details and requested design

4. **Generate Design Breakdown** ⭐
   - Click "Get Design Breakdown" on any booking with a design
   - AI analyzes the image and provides step-by-step instructions
   - Review products needed, techniques, and pro tips

5. **Confirm or Decline**
   - Click "Confirm" to accept the booking
   - Click "Decline" to reject
   - Client gets notified automatically

6. **Manage Appointments**
   - Switch to "Upcoming" tab
   - See all confirmed appointments
   - Mark as complete when done

## Key Features to Test

### 1. Search & Discovery
- Search techs by name: `/bookings`
- View tech profile: `/tech/[id]`
- See services, portfolio, reviews

### 2. Booking Flow
- Book appointment: `/book/[techId]`
- Select service, design, date, time
- Add special requests

### 3. Tech Dashboard
- View requests: `/tech/bookings`
- Confirm/decline bookings
- See upcoming appointments

### 4. AI Design Breakdown
- Generate breakdown for any design
- Get professional nail tech instructions
- See products, techniques, steps

## Navigation

### Bottom Nav (All Users)
- **Home**: Main feed
- **Bookings**: Search techs (clients) or view bookings (techs)
- **Create**: Generate designs
- **Profile**: User settings

### Tech-Specific Pages
- `/tech/dashboard` - Main tech dashboard
- `/tech/bookings` - Booking management
- `/tech/profile-setup` - Profile setup

## Database Tables Added

- `bookings` - Appointment records
- `tech_availability` - Weekly schedule
- `tech_time_off` - Blocked dates
- `design_breakdowns` - AI-generated instructions

## API Endpoints

### Client Endpoints
- `GET /api/tech/search` - Search nail techs
- `GET /api/tech/[id]` - Get tech profile
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get my bookings

### Tech Endpoints
- `GET /api/bookings?status=pending` - Get booking requests
- `PATCH /api/bookings/[id]` - Update booking status
- `POST /api/design-breakdown` - Generate AI breakdown
- `GET /api/design-breakdown?lookId=X` - Get existing breakdown

## Notifications

Automatic notifications are sent for:
- ✉️ New booking request (to tech)
- ✅ Booking confirmed (to client)
- ❌ Booking cancelled (to both)
- ✔️ Appointment completed (to client)

## Troubleshooting

### "Tech profile not found"
- Make sure the user has `userType: 'tech'`
- Create a tech profile in `tech_profiles` table

### "Service not found"
- Tech needs to add services first
- Go to tech dashboard and add services

### "Time slot not available"
- Conflict with existing booking
- Choose a different time
- Tech may need to update availability

### Design breakdown not generating
- Check `OPENAI_API_KEY` is set
- Verify the look has a valid `imageUrl`
- Check API quota/billing

## Next Steps

1. **Add Services** (Techs)
   - Create services with prices and durations
   - Make them active

2. **Upload Portfolio** (Techs)
   - Add portfolio images to attract clients
   - Add captions

3. **Create Designs** (Clients)
   - Generate or upload nail designs
   - Save them to use in bookings

4. **Test Full Flow**
   - Client searches and books
   - Tech receives notification
   - Tech generates breakdown
   - Tech confirms booking
   - Both see updated status

## Pro Tips

### For Clients
- Save multiple designs before booking
- Book popular techs in advance
- Add detailed notes about preferences
- Check tech's portfolio first

### For Nail Techs
- Keep availability updated
- Respond to requests quickly
- Use design breakdowns to prepare
- Add portfolio images regularly
- Set realistic service durations

## What's Next?

Future enhancements planned:
- Payment integration (deposits)
- Automated reminders
- Calendar sync (Google, iCal)
- Recurring appointments
- Client reviews
- Waitlist feature

## Need Help?

Check the full documentation:
- `BOOKING_SYSTEM.md` - Complete system overview
- `docs/DESIGN_BREAKDOWN_FEATURE.md` - AI breakdown details

## Summary

You now have a complete booking system where:
- ✅ Clients can search and book nail techs
- ✅ Techs can manage booking requests
- ✅ AI generates professional design instructions
- ✅ Automatic notifications keep everyone informed
- ✅ Clean UI with bottom navigation

Start testing and enjoy! 🎨💅
