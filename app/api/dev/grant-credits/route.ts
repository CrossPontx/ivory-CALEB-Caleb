import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Developer bypass for testing - only works for simplyjosh56
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow for developer account
    if (user.username !== 'simplyjosh56') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { credits } = await request.json();

    // Grant credits
    await db
      .update(users)
      .set({
        credits: (user.credits || 0) + credits,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      newBalance: (user.credits || 0) + credits,
      message: `Developer bypass: ${credits} credits granted`,
    });
  } catch (error) {
    console.error('Dev grant credits error:', error);
    return NextResponse.json(
      { error: 'Failed to grant credits' },
      { status: 500 }
    );
  }
}
