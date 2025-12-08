import { NextResponse } from 'next/server';
import { db } from '@/db';
import { designRequests, looks, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get request with related look and user data
    const result = await db
      .select({
        request: designRequests,
        look: looks,
        client: {
          id: users.id,
          username: users.username,
          avatar: users.avatar,
        },
      })
      .from(designRequests)
      .leftJoin(looks, eq(designRequests.lookId, looks.id))
      .leftJoin(users, eq(designRequests.clientId, users.id))
      .where(eq(designRequests.id, parseInt(params.id)));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
  }
}
