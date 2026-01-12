import { NextRequest, NextResponse } from 'next/server';
import { websiteBuilder } from '@/lib/website-builder';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { techWebsites, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Customization prompt is required' },
        { status: 400 }
      );
    }

    // Verify website ownership
    const [website] = await db
      .select({
        id: techWebsites.id,
        techProfileId: techWebsites.techProfileId,
      })
      .from(techWebsites)
      .innerJoin(techProfiles, eq(techWebsites.techProfileId, techProfiles.id))
      .where(
        eq(techWebsites.id, websiteId) && 
        eq(techProfiles.userId, session.id)
      )
      .limit(1);

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      );
    }

    // Customize website (includes subscription and credit checks)
    const result = await websiteBuilder.customizeWebsite(websiteId, prompt, session.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error customizing website:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to customize website' },
      { status: 500 }
    );
  }
}