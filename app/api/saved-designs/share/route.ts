import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedDesigns, looks, sessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/saved-designs/share - Create a shareable look from a saved design
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { savedDesignId } = body;

    if (!savedDesignId) {
      return NextResponse.json({ error: 'savedDesignId is required' }, { status: 400 });
    }

    // Get the saved design and verify ownership
    const [savedDesign] = await db
      .select()
      .from(savedDesigns)
      .where(and(eq(savedDesigns.id, savedDesignId), eq(savedDesigns.userId, user.id)))
      .limit(1);

    if (!savedDesign) {
      return NextResponse.json({ error: 'Saved design not found' }, { status: 404 });
    }

    // Check if a shareable look already exists for this saved design
    const existingLook = await db.query.looks.findFirst({
      where: (looks, { and, eq }) => and(
        eq(looks.userId, user.id),
        eq(looks.imageUrl, savedDesign.imageUrl),
        eq(looks.title, savedDesign.title || 'Untitled Design')
      ),
    });

    if (existingLook) {
      // Return the existing look ID
      return NextResponse.json({ lookId: existingLook.id });
    }

    // Create a new shareable look from the saved design
    const [newLook] = await db
      .insert(looks)
      .values({
        userId: user.id,
        title: savedDesign.title || 'Untitled Design',
        imageUrl: savedDesign.imageUrl,
        originalImageUrl: savedDesign.imageUrl, // Use the same image as original
        aiPrompt: null, // Saved designs don't have AI prompts
        nailPositions: null, // Saved designs don't have nail positions
        designMetadata: {
          source: 'saved-design',
          savedDesignId: savedDesign.id,
          sourceUrl: savedDesign.sourceUrl,
          notes: savedDesign.notes,
          tags: savedDesign.tags,
        },
        isPublic: true, // Make it shareable
        viewCount: 0,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ lookId: newLook.id });
  } catch (error: any) {
    console.error('Error creating shareable look:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create shareable link' },
      { status: 500 }
    );
  }
}