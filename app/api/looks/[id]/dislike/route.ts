import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, dislikes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lookId = parseInt(params.id);
    
    // Get user from session
    const userStr = request.cookies.get('ivoryUser')?.value;
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);

    // Check if user already disliked this look
    const existingDislike = await db
      .select()
      .from(dislikes)
      .where(and(eq(dislikes.userId, user.id), eq(dislikes.lookId, lookId)))
      .limit(1);

    if (existingDislike.length > 0) {
      // Remove dislike
      await db
        .delete(dislikes)
        .where(and(eq(dislikes.userId, user.id), eq(dislikes.lookId, lookId)));

      // Decrement dislike count
      await db
        .update(looks)
        .set({ dislikeCount: db.$count(looks.dislikeCount) - 1 })
        .where(eq(looks.id, lookId));

      return NextResponse.json({ disliked: false });
    } else {
      // Add dislike
      await db.insert(dislikes).values({
        userId: user.id,
        lookId,
      });

      // Increment dislike count
      await db
        .update(looks)
        .set({ dislikeCount: db.$count(looks.dislikeCount) + 1 })
        .where(eq(looks.id, lookId));

      return NextResponse.json({ disliked: true });
    }
  } catch (error) {
    console.error('Error toggling dislike:', error);
    return NextResponse.json({ error: 'Failed to toggle dislike' }, { status: 500 });
  }
}
