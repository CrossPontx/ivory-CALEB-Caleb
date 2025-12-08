import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, userType } = body;

    if (!userId || !userType) {
      return NextResponse.json({ error: 'userId and userType are required' }, { status: 400 });
    }

    const updated = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, parseInt(userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updated[0].id,
      username: updated[0].username,
      email: updated[0].email,
      userType: updated[0].userType,
      avatar: updated[0].avatar,
    });
  } catch (error) {
    console.error('Update user type error:', error);
    return NextResponse.json({ error: 'Failed to update user type' }, { status: 500 });
  }
}
