import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { bookings, services, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const SERVICE_FEE_PERCENTAGE = 0.125; // 12.5%

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get booking details
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        service: true,
        techProfile: {
          with: {
            user: true,
          },
        },
        look: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user owns this booking
    if (booking.clientId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // Calculate prices
    const servicePrice = parseFloat((booking.service as any).price || '0');
    const serviceFee = servicePrice * SERVICE_FEE_PERCENTAGE;
    const totalPrice = servicePrice + serviceFee;

    // Update booking with price breakdown
    await db
      .update(bookings)
      .set({
        servicePrice: servicePrice.toFixed(2),
        serviceFee: serviceFee.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      })
      .where(eq(bookings.id, bookingId));

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: (booking.service as any).name,
              description: `Appointment with ${(booking.techProfile as any).businessName || (booking.techProfile as any).user.username}`,
              images: (booking.look as any)?.imageUrl ? [(booking.look as any).imageUrl] : undefined,
            },
            unit_amount: Math.round(servicePrice * 100), // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Service Fee',
              description: 'Platform service fee (12.5%)',
            },
            unit_amount: Math.round(serviceFee * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings?payment=success&booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings?payment=cancelled`,
      customer_email: (session.user as any).email,
      metadata: {
        bookingId: bookingId.toString(),
        userId: session.userId.toString(),
        type: 'booking_payment',
      },
      payment_intent_data: {
        metadata: {
          bookingId: bookingId.toString(),
          userId: session.userId.toString(),
          type: 'booking_payment',
        },
      },
    });

    // Save checkout session ID
    await db
      .update(bookings)
      .set({
        stripeCheckoutSessionId: checkoutSession.id,
      })
      .where(eq(bookings.id, bookingId));

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating booking checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
