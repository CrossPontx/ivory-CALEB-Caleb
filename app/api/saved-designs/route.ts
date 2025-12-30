import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedDesigns, collections } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/saved-designs - Get user's saved designs
export async function GET(request: NextRequest) {
  try {
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    let query = db
      .select({
        id: savedDesigns.id,
        imageUrl: savedDesigns.imageUrl,
        title: savedDesigns.title,
        sourceUrl: savedDesigns.sourceUrl,
        sourceType: savedDesigns.sourceType,
        notes: savedDesigns.notes,
        tags: savedDesigns.tags,
        isFavorite: savedDesigns.isFavorite,
        createdAt: savedDesigns.createdAt,
        collectionId: savedDesigns.collectionId,
        collectionName: collections.name,
      })
      .from(savedDesigns)
      .leftJoin(collections, eq(savedDesigns.collectionId, collections.id))
      .where(eq(savedDesigns.userId, user.id))
      .$dynamic();

    if (collectionId) {
      query = query.where(eq(savedDesigns.collectionId, parseInt(collectionId)));
    }

    const designs = await query.orderBy(desc(savedDesigns.createdAt));

    return NextResponse.json({ designs });
  } catch (error: any) {
    console.error('Error fetching saved designs:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch saved designs' },
      { status: 500 }
    );
  }
}

// POST /api/saved-designs - Save new design
export async function POST(request: NextRequest) {
  try {
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);
    const body = await request.json();
    const { imageUrl, title, sourceUrl, sourceType, notes, tags, collectionId } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // If no collection specified, use default
    let targetCollectionId = collectionId;
    if (!targetCollectionId) {
      const [defaultCollection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.userId, user.id), eq(collections.isDefault, true)))
        .limit(1);

      if (defaultCollection) {
        targetCollectionId = defaultCollection.id;
      }
    }

    const [newDesign] = await db
      .insert(savedDesigns)
      .values({
        userId: user.id,
        collectionId: targetCollectionId,
        imageUrl,
        title: title?.trim() || null,
        sourceUrl: sourceUrl?.trim() || null,
        sourceType: sourceType || 'upload',
        notes: notes?.trim() || null,
        tags: tags || null,
        isFavorite: false,
      })
      .returning();

    return NextResponse.json({ design: newDesign }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving design:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save design' },
      { status: 500 }
    );
  }
}
