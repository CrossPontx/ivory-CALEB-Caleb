import { NextRequest, NextResponse } from 'next/server';
import { stripe, getCreditPackage } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get session using the auth library
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has an active subscription (only paid users can buy additional credits)
    if (!user.subscriptionTier || user.subscriptionTier === 'free' || user.subscriptionStatus !== 'active') {
      return NextResponse.json({ 
        error: 'Subscription required',
        message: 'You need an active subscription to purchase additional credits. Please subscribe to a plan first.'
      }, { status: 403 });
    }

    const { packageId } = await request.json();
    const creditPackage = getCreditPackage(packageId);

    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.credits} credits for AI nail design generation`,
              images: ['https://ivory-blond.vercel.app/icon-512x512.png'],
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/credits?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id.toString(),
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
      // Enable Apple Pay and other payment methods
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
