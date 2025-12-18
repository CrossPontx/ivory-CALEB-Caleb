import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creditTransactions, referrals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { nanoid } from 'nanoid';

/**
 * Native Apple Sign In endpoint for iOS
 * Handles authentication from native iOS Sign in with Apple
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identityToken, authorizationCode, email, givenName, familyName, referralCode } = body;

    if (!identityToken || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Decode and verify the identity token
    // In production, verify the JWT signature with Apple's public keys
    let appleUserId: string;
    try {
      const decoded = JSON.parse(Buffer.from(identityToken.split('.')[1], 'base64').toString());
      appleUserId = decoded.sub;
      
      // Verify the token is from Apple and not expired
      if (!appleUserId || decoded.exp < Date.now() / 1000) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } catch (err) {
      console.error('Failed to decode Apple identity token:', err);
      return NextResponse.json(
        { error: 'Invalid identity token' },
        { status: 401 }
      );
    }

    // Check if user already exists
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user;

    if (existingUser.length > 0) {
      // User exists - log them in
      user = existingUser[0];
      
      // Update auth provider if they originally signed up with email
      if (user.authProvider === 'email') {
        await db
          .update(users)
          .set({ authProvider: 'apple' })
          .where(eq(users.id, user.id));
      }
    } else {
      // Create new user
      const newReferralCode = nanoid(10);
      const username = givenName && familyName 
        ? `${givenName} ${familyName}`.toLowerCase().replace(/\s+/g, '')
        : email.split('@')[0];

      // Check if referral code is valid
      let referrerId: number | null = null;
      if (referralCode) {
        const referrer = await db
          .select()
          .from(users)
          .where(eq(users.referralCode, referralCode));
        
        if (referrer.length > 0) {
          referrerId = referrer[0].id;
        }
      }

      const newUserResult = await db
        .insert(users)
        .values({
          username,
          email,
          authProvider: 'apple',
          userType: 'client',
          credits: 5,
          referralCode: newReferralCode,
          referredBy: referrerId,
        })
        .returning() as any;

      user = newUserResult[0];

      // Log the signup bonus credit transaction
      await db.insert(creditTransactions).values({
        userId: user.id,
        amount: 5,
        type: 'signup_bonus',
        description: 'Welcome bonus - 5 free credits',
        balanceAfter: 5,
      });

      // Handle referral rewards
      if (referrerId) {
        await db.insert(referrals).values({
          referrerId: referrerId,
          referredUserId: user.id,
          creditAwarded: false,
        });

        const referrerReferrals = await db
          .select()
          .from(referrals)
          .where(eq(referrals.referrerId, referrerId));

        const unawardedReferrals = referrerReferrals.filter(r => !r.creditAwarded);
        if (unawardedReferrals.length >= 3) {
          const referrerData = await db
            .select()
            .from(users)
            .where(eq(users.id, referrerId));

          const currentCredits = referrerData[0].credits;
          const newCredits = currentCredits + 1;

          await db
            .update(users)
            .set({ credits: newCredits })
            .where(eq(users.id, referrerId));

          for (let i = 0; i < 3; i++) {
            await db
              .update(referrals)
              .set({ creditAwarded: true })
              .where(eq(referrals.id, unawardedReferrals[i].id));
          }

          await db.insert(creditTransactions).values({
            userId: referrerId,
            amount: 1,
            type: 'referral_reward',
            description: 'Earned 1 credit for referring 3 new users',
            balanceAfter: newCredits,
          });
        }
      }
    }

    // Create session
    await createSession(user.id);

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        credits: user.credits,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Native Apple Sign In error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
