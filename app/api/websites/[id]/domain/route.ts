import { NextRequest, NextResponse } from 'next/server';
import { websiteBuilder } from '@/lib/website-builder';
import { getSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const websiteId = parseInt(params.id);
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Setup custom domain
    const result = await websiteBuilder.setupCustomDomain(websiteId, domain, session.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error setting up custom domain:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup custom domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const websiteId = parseInt(params.id);

    // Remove custom domain
    const result = await websiteBuilder.removeCustomDomain(websiteId, session.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing custom domain:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove custom domain' },
      { status: 500 }
    );
  }
}