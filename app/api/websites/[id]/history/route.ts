import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { websiteBuilder } from '@/lib/website-builder';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const websiteId = parseInt(id);
    if (isNaN(websiteId)) {
      return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 });
    }

    // Get chat history
    const history = await websiteBuilder.getChatHistory(websiteId, session.id);

    return NextResponse.json(history);

  } catch (error) {
    console.error('Error getting chat history:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get chat history',
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        } : undefined
      },
      { status: 500 }
    );
  }
}