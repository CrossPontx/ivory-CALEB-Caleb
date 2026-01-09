import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, notifications, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        techProfile: {
          with: { user: true },
        },
        client: true,
        service: true,
        look: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PATCH - Update booking status (confirm, cancel, complete, no_show)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await request.json();
    const { status, techNotes, cancellationReason } = body;

    // Get existing booking with tech profile for no-show fee settings
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        techProfile: true,
        client: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Authorization check
    const isTech = booking.techProfile.userId === session.userId;
    const isClient = booking.clientId === session.userId;

    if (!isTech && !isClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update booking
    const updateData: any = { updatedAt: new Date() };
    
    if (status) updateData.status = status;
    if (techNotes && isTech) updateData.techNotes = techNotes;
    
    // Handle cancellation
    if (status === 'cancelled') {
      updateData.cancellationReason = cancellationReason || 'No reason provided';
      updateData.cancelledBy = session.userId;
      updateData.cancelledAt = new Date();
      
      // Check if within cancellation window (for client cancellations)
      if (isClient && booking.paymentStatus === 'paid') {
        const appointmentDate = new Date(booking.appointmentDate);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const cancellationWindow = booking.techProfile.cancellationWindowHours || 24;
        
        if (hoursUntilAppointment < cancellationWindow && booking.techProfile.noShowFeeEnabled) {
          // Late cancellation - charge no-show fee
          const noShowFeePercent = booking.techProfile.noShowFeePercent || 50;
          const noShowFeeAmount = (parseFloat(booking.servicePrice as string) * noShowFeePercent) / 100;
          
          updateData.noShowFeeCharged = true;
          updateData.noShowFeeAmount = noShowFeeAmount.toFixed(2);
          
          // Calculate refund amount (total paid minus no-show fee)
          const totalPaid = parseFloat(booking.totalPrice as string);
          updateData.refundAmount = (totalPaid - noShowFeeAmount).toFixed(2);
          updateData.refundedAt = new Date();
        } else {
          // Full refund for cancellations within window
          updateData.refundAmount = booking.totalPrice;
          updateData.refundedAt = new Date();
        }
      }
    }
    
    // Handle no-show (tech marks client as no-show)
    if (status === 'no_show' && isTech) {
      if (booking.techProfile.noShowFeeEnabled && booking.paymentStatus === 'paid') {
        const noShowFeePercent = booking.techProfile.noShowFeePercent || 50;
        const noShowFeeAmount = (parseFloat(booking.servicePrice as string) * noShowFeePercent) / 100;
        
        updateData.noShowFeeCharged = true;
        updateData.noShowFeeAmount = noShowFeeAmount.toFixed(2);
        
        // Partial refund to client
        const totalPaid = parseFloat(booking.totalPrice as string);
        updateData.refundAmount = (totalPaid - noShowFeeAmount).toFixed(2);
        updateData.refundedAt = new Date();
      }
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    // Create notification
    let notificationMessage = '';
    let notificationUserId = 0;

    if (status === 'confirmed' && isTech) {
      notificationMessage = `Your booking for ${booking.service.name} has been confirmed!`;
      notificationUserId = booking.clientId;
    } else if (status === 'cancelled') {
      const cancelledByText = isTech ? 'The nail tech' : 'You';
      notificationMessage = `Booking for ${booking.service.name} has been cancelled. ${
        updateData.noShowFeeCharged 
          ? `A late cancellation fee of $${updateData.noShowFeeAmount} was applied.` 
          : ''
      }`;
      notificationUserId = isTech ? booking.clientId : booking.techProfile.userId;
    } else if (status === 'completed' && isTech) {
      notificationMessage = `Your appointment for ${booking.service.name} is complete. Please leave a review!`;
      notificationUserId = booking.clientId;
    } else if (status === 'no_show' && isTech) {
      notificationMessage = `You were marked as a no-show for your ${booking.service.name} appointment. ${
        updateData.noShowFeeCharged 
          ? `A no-show fee of $${updateData.noShowFeeAmount} was charged.` 
          : ''
      }`;
      notificationUserId = booking.clientId;
    }

    if (notificationMessage && notificationUserId) {
      await db.insert(notifications).values({
        userId: notificationUserId,
        type: `booking_${status}`,
        title: 'Booking Update',
        message: notificationMessage,
        relatedId: bookingId,
      });
    }

    return NextResponse.json({ 
      booking: updatedBooking,
      noShowFeeCharged: updateData.noShowFeeCharged || false,
      noShowFeeAmount: updateData.noShowFeeAmount || null,
      refundAmount: updateData.refundAmount || null,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
