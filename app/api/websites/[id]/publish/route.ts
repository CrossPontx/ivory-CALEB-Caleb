import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites, techProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

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

    const { published } = await request.json();
    if (typeof published !== 'boolean') {
      return NextResponse.json({ error: 'Published must be a boolean' }, { status: 400 });
    }

    // Verify website ownership
    const [website] = await db
      .select({
        id: techWebsites.id,
        isPublished: techWebsites.isPublished,
        techProfileId: techWebsites.techProfileId,
      })
      .from(techWebsites)
      .innerJoin(techProfiles, eq(techWebsites.techProfileId, techProfiles.id))
      .where(
        and(
          eq(techWebsites.id, websiteId),
          eq(techProfiles.userId, session.id)
        )
      )
      .limit(1);

    if (!website) {
      return NextResponse.json({ error: 'Website not found or access denied' }, { status: 404 });
    }

    // Update publish status
    await db
      .update(techWebsites)
      .set({ 
        isPublished: published,
        updatedAt: new Date(),
      })
      .where(eq(techWebsites.id, websiteId));

    return NextResponse.json({ 
      success: true, 
      isPublished: published 
    });

  } catch (error) {
    console.error('Error updating publish status:', error);
    return NextResponse.json(
      { error: 'Failed to update publish status' },
      { status: 500 }
    );
  }
}