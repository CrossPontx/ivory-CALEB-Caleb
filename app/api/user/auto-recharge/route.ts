import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const userStr = request.headers.get('cookie')?.match(/ivoryUser=([^;]+)/)?.[1];
    if (!userStr) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = JSON.parse(decodeURIComponent(userStr));
    const userId = userData.id;

    const [user] = await db
      .select({
        autoRechargeEnabled: users.autoRechargeEnabled,
        autoRechargeAmount: users.autoRechargeAmount,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      autoRechargeEnabled: user.autoRechargeEnabled || false,
      autoRechargeAmount: user.autoRechargeAmount || 5,
    });
  } catch (error) {
    console.error('Error fetching auto-recharge settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userStr = request.headers.get('cookie')?.match(/ivoryUser=([^;]+)/)?.[1];
    if (!userStr) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = JSON.parse(decodeURIComponent(userStr));
    const userId = userData.id;

    const body = await request.json();
    const { autoRechargeEnabled, autoRechargeAmount } = body;

    // Validate amount
    if (autoRechargeAmount !== 5 && autoRechargeAmount !== 10) {
      return NextResponse.json(
        { error: 'Auto-recharge amount must be 5 or 10' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        autoRechargeEnabled: autoRechargeEnabled,
        autoRechargeAmount: autoRechargeAmount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      autoRechargeEnabled,
      autoRechargeAmount,
    });
  } catch (error) {
    console.error('Error updating auto-recharge settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
