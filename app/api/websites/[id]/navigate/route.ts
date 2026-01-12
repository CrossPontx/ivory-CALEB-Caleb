import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { websiteBuilder } from '@/lib/website-builder';

export async function POST(
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

    const { versionId, action } = await request.json();

    let result;
    
    if (action === 'undo') {
      result = await websiteBuilder.undoLastCustomization(websiteId, session.id);
    } else if (action === 'redo') {
      result = await websiteBuilder.redoCustomization(websiteId, session.id);
    } else if (versionId) {
      result = await websiteBuilder.navigateToVersion(websiteId, versionId, session.id);
    } else {
      return NextResponse.json({ error: 'Either versionId or action (undo/redo) is required' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error navigating version:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to navigate version',
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        } : undefined
      },
      { status: 500 }
    );
  }
}