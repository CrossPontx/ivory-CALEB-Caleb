import { NextResponse } from 'next/server';
import { db } from '@/db';
import { designRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(designRequests)
      .where(eq(designRequests.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching design request:', error);
    return NextResponse.json({ error: 'Failed to fetch design request' }, { status: 500 });
  }
}
