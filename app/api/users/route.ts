import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      const user = await db.select().from(users).where(eq(users.email, email));
      return NextResponse.json(user[0] || null);
    }

    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, userType, authProvider = 'email', avatar } = body;

    if (!username || !email || !userType) {
      return NextResponse.json(
        { error: 'Username, email, and userType are required' },
        { status: 400 }
      );
    }

    const newUser = await db
      .insert(users)
      .values({ username, email, userType, authProvider, avatar })
      .returning();
    
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
