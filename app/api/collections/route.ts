import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collections, savedDesigns } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/collections - Get user's collections
export async function GET(request: NextRequest) {
  try {
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);

    const userCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isDefault: collections.isDefault,
        createdAt: collections.createdAt,
        designCount: db.$count(savedDesigns, eq(savedDesigns.collectionId, collections.id)),
      })
      .from(collections)
      .where(eq(collections.userId, user.id))
      .orderBy(desc(collections.isDefault), desc(collections.createdAt));

    return NextResponse.json({ collections: userCollections });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const [newCollection] = await db
      .insert(collections)
      .values({
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        isDefault: false,
      })
      .returning();

    return NextResponse.json({ collection: newCollection }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create collection' },
      { status: 500 }
    );
  }
}
