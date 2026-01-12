import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techAvailability, techTimeOff, bookings } from '@/db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';

// GET - Public availability for V0 websites (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const techId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const days = parseInt(searchParams.get('days') || '7'); // Number of days to fetch

    if (isNaN(techId)) {
      return NextResponse.json({ 
        error: 'Invalid tech ID', 
        received: id,
        expected: 'numeric ID' 
      }, { status: 400 });
    }

    // Get tech's weekly availability schedule
    const availability = await db.query.techAvailability.findMany({
      where: and(
        eq(techAvailability.techProfileId, techId),
        eq(techAvailability.isActive, true)
      ),
      orderBy: (techAvailability, { asc }) => [asc(techAvailability.dayOfWeek)],
    });

    if (availability.length === 0) {
      const response = NextResponse.json({ 
        availability: [],
        timeSlots: [],
        message: 'No availability set for this tech' 
      });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Get time off periods
    const startDate = date ? new Date(date) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days);

    const timeOff = await db.query.techTimeOff.findMany({
      where: and(
        eq(techTimeOff.techProfileId, techId),
        or(
          and(
            gte(techTimeOff.startDate, startDate),
            lte(techTimeOff.startDate, endDate)
          ),
          and(
            gte(techTimeOff.endDate, startDate),
            lte(techTimeOff.endDate, endDate)
          ),
          and(
            lte(techTimeOff.startDate, startDate),
            gte(techTimeOff.endDate, endDate)
          )
        )
      ),
    });

    // Get existing bookings for the date range
    const existingBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookings.techProfileId, techId),
        gte(bookings.appointmentDate, startDate),
        lte(bookings.appointmentDate, endDate),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        )
      ),
    });

    // Generate available time slots
    const timeSlots = [];
    const current = new Date(startDate);

    for (let i = 0; i < days; i++) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dateStr = current.toISOString().split('T')[0];

      // Check if this day has availability
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (dayAvailability) {
        // Check if this day is blocked by time off
        const isTimeOff = timeOff.some(timeOffPeriod => {
          const timeOffStart = new Date(timeOffPeriod.startDate);
          const timeOffEnd = new Date(timeOffPeriod.endDate);
          return current >= timeOffStart && current <= timeOffEnd;
        });

        if (!isTimeOff) {
          // Generate hourly slots between start and end time
          const startTime = dayAvailability.startTime; // e.g., "09:00"
          const endTime = dayAvailability.endTime; // e.g., "17:00"
          
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          for (let hour = startHour; hour < endHour; hour++) {
            // Generate slots every hour (can be customized)
            const slotTime = `${hour.toString().padStart(2, '0')}:00`;
            const slotDateTime = new Date(current);
            slotDateTime.setHours(hour, 0, 0, 0);

            // Skip past time slots
            if (slotDateTime <= new Date()) {
              continue;
            }

            // Check if this slot conflicts with existing bookings
            const hasConflict = existingBookings.some(booking => {
              const bookingStart = new Date(booking.appointmentDate);
              const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60000);
              const slotEnd = new Date(slotDateTime.getTime() + 60 * 60000); // 1 hour slot
              
              return slotDateTime < bookingEnd && slotEnd > bookingStart;
            });

            if (!hasConflict) {
              timeSlots.push({
                date: dateStr,
                time: slotTime,
                datetime: slotDateTime.toISOString(),
                available: true,
              });
            }
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    const response = NextResponse.json({ 
      availability: availability.map(a => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
      timeOff: timeOff.map(t => ({
        startDate: t.startDate,
        endDate: t.endDate,
        reason: t.reason,
      })),
      timeSlots,
      totalSlots: timeSlots.length,
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error fetching public availability:', error);
    const response = NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}