# Booking System Documentation

## Overview
Complete booking system for clients to find and book appointments with nail technicians, including AI-powered design breakdowns.

## Features

### Client Side
1. **Search & Browse Nail Techs**
   - Search by name, specialty, or location
   - View tech profiles with ratings, reviews, and portfolio
   - Filter by services offered

2. **Booking Flow**
   - Select service from tech's offerings
   - Choose design (optional) from saved looks
   - Pick date and time slot
   - Add special notes/requests
   - Submit booking request

3. **My Bookings**
   - View all bookings (pending, confirmed, completed)
   - Track appointment status
   - Cancel bookings if needed

### Nail Tech Side
1. **Booking Requests**
   - View pending booking requests
   - See client details, requested service, and design
   - Confirm or decline requests
   - Add tech notes

2. **Upcoming Appointments**
   - Calendar view of confirmed appointments
   - Client information and design details
   - Mark appointments as complete

3. **AI Design Breakdown** ⭐
   - Generate step-by-step instructions for any design
   - Uses GPT-4 Vision to analyze nail design images
   - Provides:
     - Difficulty level (beginner/intermediate/advanced)
     - Estimated time to complete
     - Products and tools needed
     - Specific techniques required
     - Detailed step-by-step instructions in nail tech language
     - Pro tips and common mistakes to avoid
   - Uses professional nail tech terminology (cure, float, encapsulate, cap the free edge, etc.)

4. **Availability Management**
   - Set weekly schedule (days and hours)
   - Block time off for vacations/breaks
   - Automatic conflict detection

## Database Schema

### New Tables

#### `bookings`
- Stores appointment information
- Links client, tech, service, and optional design
- Tracks status: pending → confirmed → completed
- Includes pricing, notes, and cancellation info

#### `tech_availability`
- Weekly schedule for each nail tech
- Day of week + start/end times
- Can be enabled/disabled

#### `tech_time_off`
- Blocked dates for vacations/breaks
- Start and end date ranges

#### `design_breakdowns`
- AI-generated instructions for designs
- Structured JSON with steps, products, techniques
- Cached to avoid regenerating same design

## API Routes

### `/api/bookings`
- `GET` - Fetch user's bookings (filtered by status)
- `POST` - Create new booking request

### `/api/bookings/[id]`
- `PATCH` - Update booking status (confirm, cancel, complete)

### `/api/tech/search`
- `GET` - Search nail techs by name, location, specialty

### `/api/tech/[id]`
- `GET` - Fetch detailed tech profile with services, portfolio, reviews

### `/api/tech/availability`
- `GET` - Fetch tech's availability schedule
- `POST` - Set tech's availability (tech only)

### `/api/design-breakdown`
- `POST` - Generate AI breakdown for a design (tech only)
- `GET` - Fetch existing breakdown

## Pages

### Client Pages
- `/bookings` - Search techs and view my bookings
- `/book/[techId]` - Book appointment with specific tech
- `/tech/[id]` - View tech profile

### Tech Pages
- `/tech/bookings` - Manage booking requests and appointments
- `/tech/dashboard` - Main dashboard with link to bookings

## AI Design Breakdown Details

### How It Works
1. Nail tech clicks "Get Design Breakdown" on a booking with a design
2. System sends design image to GPT-4 Vision with specialized prompt
3. AI analyzes the design and generates structured instructions
4. Response includes:
   - **Preparation**: Base coat, nail prep steps
   - **Color Application**: Specific colors, layering technique
   - **Design Technique**: Freehand, stamping, chrome, etc.
   - **Tools**: Dotting tool, striping brush, etc.
   - **Products**: Gel polish brands, builder gel, top coat
   - **Step-by-Step**: Detailed instructions for each step
   - **Curing Times**: If using gel/UV
   - **Pro Tips**: Expert advice for best results
   - **Common Mistakes**: What to avoid

### Example Breakdown Structure
```json
{
  "difficulty": "intermediate",
  "estimatedTime": 90,
  "productsNeeded": [
    "Gel base coat",
    "White gel polish",
    "Pink gel polish",
    "Fine detail brush",
    "Dotting tool",
    "No-wipe top coat"
  ],
  "techniques": [
    "French tip",
    "Freehand floral",
    "Dotting technique"
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Prep and Base",
      "description": "Prep the natural nail, push back cuticles, and apply a thin layer of gel base coat. Cure for 60 seconds.",
      "tips": "Make sure to cap the free edge to prevent lifting"
    }
  ],
  "proTips": [
    "Work in thin layers for better control",
    "Keep your brush clean between colors"
  ],
  "commonMistakes": [
    "Applying polish too thick",
    "Not capping the free edge"
  ]
}
```

### Nail Tech Language
The AI uses professional terminology that nail techs understand:
- **Cure**: Harden gel polish under UV/LED lamp
- **Float**: Apply color without touching the cuticle
- **Encapsulate**: Seal design with clear gel
- **Cap the free edge**: Apply product to the tip edge
- **Flash cure**: Quick 5-10 second cure
- **Wipe off tacky layer**: Remove sticky residue with cleanser

## Navigation
- Added "Bookings" button to bottom navigation
- Shows calendar icon
- Active state for booking-related pages

## Notifications
System automatically creates notifications for:
- New booking request (to tech)
- Booking confirmed (to client)
- Booking cancelled (to other party)
- Appointment completed (to client for review)

## Future Enhancements
- [ ] Payment integration (deposits, full payment)
- [ ] Automated reminders (24h before appointment)
- [ ] Recurring appointments
- [ ] Tech calendar sync (Google Calendar, iCal)
- [ ] Client reviews after completed appointments
- [ ] Design modification requests
- [ ] Video call consultations
- [ ] Waitlist for fully booked techs

## Setup Instructions

1. **Run Database Migration**
   ```bash
   psql -d your_database < db/migrations/add_booking_tables.sql
   ```

2. **Update Schema**
   The schema has been updated in `db/schema.ts` with new tables and relations.

3. **Environment Variables**
   Ensure `OPENAI_API_KEY` is set for design breakdown feature.

4. **Test the Flow**
   - As client: Search for techs, book appointment
   - As tech: View requests, generate design breakdown, confirm booking

## Usage Tips

### For Clients
- Save your favorite designs before booking
- Add detailed notes about allergies or preferences
- Book in advance for popular time slots

### For Nail Techs
- Keep your availability updated
- Use design breakdowns to prepare for appointments
- Respond to booking requests promptly
- Add portfolio images to attract more clients

## Technical Notes
- Booking conflicts are automatically detected
- Time slots are generated in 30-minute intervals
- Design breakdowns are cached (one per design)
- All times are stored in UTC, displayed in local time
- Soft deletes for bookings (status change, not deletion)
