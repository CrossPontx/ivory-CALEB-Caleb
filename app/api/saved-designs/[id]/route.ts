import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedDesigns } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/saved-designs/[id] - Update saved design
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);
    const designId = parseInt(params.id);
    const body = await request.json();
    const { title, sourceUrl, notes, tags, collectionId, isFavorite } = body;

    // Verify ownership
    const [design] = await db
      .select()
      .from(savedDesigns)
      .where(and(eq(savedDesigns.id, designId), eq(savedDesigns.userId, user.id)))
      .limit(1);

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (tags !== undefined) updateData.tags = tags;
    if (collectionId !== undefined) updateData.collectionId = collectionId;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const [updated] = await db
      .update(savedDesigns)
      .set(updateData)
      .where(eq(savedDesigns.id, designId))
      .returning();

    return NextResponse.json({ design: updated });
  } catch (error: any) {
    console.error('Error updating saved design:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update design' },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-designs/[id] - Delete saved design
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);
    const designId = parseInt(params.id);

    // Verify ownership
    const [design] = await db
      .select()
      .from(savedDesigns)
      .where(and(eq(savedDesigns.id, designId), eq(savedDesigns.userId, user.id)))
      .limit(1);

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    await db.delete(savedDesigns).where(eq(savedDesigns.id, designId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting saved design:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete design' },
      { status: 500 }
    );
  }
}
