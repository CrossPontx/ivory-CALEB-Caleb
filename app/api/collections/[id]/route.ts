import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collections, savedDesigns, sessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/collections/[id] - Update collection
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('session='));
    const sessionToken = sessionCookie?.split('=')[1];

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionToken),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = { id: session.userId };
    const collectionId = parseInt(params.id);
    const body = await request.json();
    const { name, description } = body;

    // Verify ownership
    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Don't allow renaming default collection
    if (collection.isDefault && name && name !== collection.name) {
      return NextResponse.json(
        { error: 'Cannot rename default collection' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(collections)
      .set({
        name: name?.trim() || collection.name,
        description: description?.trim() || collection.description,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, collectionId))
      .returning();

    return NextResponse.json({ collection: updated });
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] - Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('session='));
    const sessionToken = sessionCookie?.split('=')[1];

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionToken),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = { id: session.userId };
    const collectionId = parseInt(params.id);

    // Verify ownership
    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Don't allow deleting default collection
    if (collection.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default collection' },
        { status: 400 }
      );
    }

    // Move designs to default collection
    const [defaultCollection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.userId, user.id), eq(collections.isDefault, true)))
      .limit(1);

    if (defaultCollection) {
      await db
        .update(savedDesigns)
        .set({ collectionId: defaultCollection.id })
        .where(eq(savedDesigns.collectionId, collectionId));
    }

    await db.delete(collections).where(eq(collections.id, collectionId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
