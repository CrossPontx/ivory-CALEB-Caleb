import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { techProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Get user from session/token
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user (implement your auth logic)
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and tech profile
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.userType !== 'tech') {
      return NextResponse.json({ error: 'Only nail techs can create payout accounts' }, { status: 403 });
    }

    const [techProfile] = await db.select().from(techProfiles).where(eq(techProfiles.userId, userId));
    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Check if account already exists
    if (techProfile.stripeConnectAccountId) {
      return NextResponse.json({ 
        accountId: techProfile.stripeConnectAccountId,
        message: 'Account already exists'
      });
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Change based on your target market
      email: user.email,
      capabilities: {
        transfers: { requested: true }, // Enable receiving transfers
      },
      business_type: 'individual', // or 'company' based on your needs
      business_profile: {
        name: techProfile.businessName || user.username,
        product_description: 'Nail art and design services',
        support_email: user.email,
      },
      metadata: {
        userId: userId.toString(),
        techProfileId: techProfile.id.toString(),
        platform: 'ivory',
      },
    });

    // Save account ID to database
    await db.update(techProfiles)
      .set({
        stripeConnectAccountId: account.id,
        stripeAccountStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(techProfiles.id, techProfile.id));

    return NextResponse.json({
      accountId: account.id,
      status: 'created',
    });

  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

// Helper function - implement based on your auth system
async function getUserIdFromToken(token: string): Promise<number | null> {
  // Implement your token verification logic here
  // This is a placeholder
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch {
    return null;
  }
}
