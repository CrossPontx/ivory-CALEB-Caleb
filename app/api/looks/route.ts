import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const userLooks = await db
        .select()
        .from(looks)
        .where(eq(looks.userId, parseInt(userId)))
        .orderBy(desc(looks.createdAt));
      return NextResponse.json(userLooks);
    }

    const allLooks = await db.select().from(looks).orderBy(desc(looks.createdAt));
    return NextResponse.json(allLooks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch looks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, imageUrl, originalImageUrl, aiPrompt, nailPositions, isPublic } = body;

    if (!userId || !title || !imageUrl) {
      return NextResponse.json(
        { error: 'userId, title, and imageUrl are required' },
        { status: 400 }
      );
    }

    const newLook = await db
      .insert(looks)
      .values({
        userId: parseInt(userId),
        title,
        imageUrl,
        originalImageUrl,
        aiPrompt,
        nailPositions,
        isPublic: isPublic || false,
      })
      .returning();

    return NextResponse.json(newLook[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create look' }, { status: 500 });
  }
}
