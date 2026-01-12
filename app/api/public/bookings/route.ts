import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, techProfiles, services, users, notifications } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

// POST - Create booking from V0 website (no auth required, uses email/phone)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      techProfileId, 
      serviceId, 
      appointmentDate, 
      clientEmail,
      clientPhone,
      clientName,
      clientNotes 
    } = body;

    // Validate required fields
    if (!techProfileId || !serviceId || !appointmentDate || !clientEmail || !clientName) {
      return NextResponse.json({ 
        error: 'Missing required fields: techProfileId, serviceId, appointmentDate, clientEmail, clientName' 
      }, { status: 400 });
    }

    // Get service details for duration and price
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify tech profile exists
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.id, techProfileId),
      with: { user: true },
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Check for conflicts
    const appointmentStart = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentStart.getTime() + (service.duration || 60) * 60000);

    // Find all bookings for this tech that are confirmed or pending
    const existingBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookings.techProfileId, techProfileId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        )
      ),
    });

    // Check for time conflicts
    const conflicts = existingBookings.filter(booking => {
      const existingStart = new Date(booking.appointmentDate);
      const existingEnd = new Date(existingStart.getTime() + (booking.duration || 60) * 60000);
      
      return appointmentStart < existingEnd && appointmentEnd > existingStart;
    });

    if (conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Time slot not available',
        conflictingBookings: conflicts.length 
      }, { status: 409 });
    }

    // Try to find existing user by email, or create guest booking
    let clientId = null;
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, clientEmail),
    });

    if (existingUser) {
      clientId = existingUser.id;
    }

    // Calculate prices
    const servicePrice = parseFloat(service.price || '0');
    const serviceFee = servicePrice * 0.15; // 15% convenience fee
    const totalPrice = servicePrice + serviceFee;

    // Create booking (with or without clientId for guest bookings)
    const [newBooking] = await db.insert(bookings).values({
      clientId: clientId, // Can be null for guest bookings
      techProfileId,
      serviceId,
      appointmentDate: appointmentStart,
      duration: service.duration || 60,
      servicePrice: servicePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      paymentStatus: 'pending',
      clientNotes: clientNotes || null,
      status: 'pending',
      // Store guest info for non-registered users
      guestEmail: clientId ? null : clientEmail,
      guestPhone: clientId ? null : clientPhone,
      guestName: clientId ? null : clientName,
    }).returning();

    // Create notification for tech
    await db.insert(notifications).values({
      userId: techProfile.userId,
      type: 'booking_request',
      title: 'New Website Booking Request',
      message: `New booking request from ${clientName} for ${service.name}`,
      relatedId: newBooking.id,
    });

    // Return booking details with payment info
    const response = NextResponse.json({ 
      booking: {
        id: newBooking.id,
        appointmentDate: newBooking.appointmentDate,
        duration: newBooking.duration,
        totalPrice: newBooking.totalPrice,
        servicePrice: newBooking.servicePrice,
        serviceFee: newBooking.serviceFee,
        status: newBooking.status,
        service: {
          name: service.name,
          description: service.description,
        },
        tech: {
          businessName: techProfile.businessName,
          location: techProfile.location,
        }
      }
    }, { status: 201 });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error creating public booking:', error);
    const response = NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}