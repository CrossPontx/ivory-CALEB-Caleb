import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(accountId);

    // Check verification status
    const requirements = account.requirements;
    const hasRequirements = requirements?.currently_due && requirements.currently_due.length > 0;
    const hasErrors = requirements?.errors && requirements.errors.length > 0;

    // Determine status
    let status = 'pending';
    let payoutsEnabled = false;
    let chargesEnabled = false;

    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active';
      payoutsEnabled = true;
      chargesEnabled = true;
    } else if (account.details_submitted) {
      status = 'pending';
    } else {
      status = 'not_setup';
    }

    // If account is restricted
    if (hasErrors || account.requirements?.disabled_reason) {
      status = 'restricted';
    }

    // Update database
    const [techProfile] = await db.select()
      .from(techProfiles)
      .where(eq(techProfiles.stripeConnectAccountId, accountId));

    if (techProfile) {
      await db.update(techProfiles)
        .set({
          stripeAccountStatus: status,
          payoutsEnabled,
          chargesEnabled,
          updatedAt: new Date(),
        })
        .where(eq(techProfiles.id, techProfile.id));
    }

    return NextResponse.json({
      status,
      payoutsEnabled,
      chargesEnabled,
      requirements: {
        currentlyDue: requirements?.currently_due || [],
        eventuallyDue: requirements?.eventually_due || [],
        pastDue: requirements?.past_due || [],
        errors: requirements?.errors || [],
        disabledReason: requirements?.disabled_reason,
      },
      detailsSubmitted: account.details_submitted,
    });

  } catch (error: any) {
    console.error('Error verifying account status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify status' },
      { status: 500 }
    );
  }
}
