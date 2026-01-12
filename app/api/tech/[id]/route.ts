import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch tech profile details (PUBLIC - no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const techId = parseInt(id);

    // Enhanced logging for debugging
    console.log(`Tech API called with ID: "${id}"`);
    console.log(`Request URL: ${request.url}`);
    console.log(`Request headers:`, Object.fromEntries(request.headers.entries()));

    if (isNaN(techId)) {
      console.log(`Invalid tech ID received: "${id}" - this should be a number`);
      return NextResponse.json({ 
        error: 'Invalid tech ID', 
        received: id,
        expected: 'numeric ID' 
      }, { status: 400 });
    }

    const tech = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.id, techId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        services: true,
        portfolioImages: true,
        reviews: {
          limit: 10,
          orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
          with: {
            client: {
              columns: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: 'Tech not found' }, { status: 404 });
    }

    return NextResponse.json({ tech });
  } catch (error) {
    console.error('Error fetching tech:', error);
    return NextResponse.json({ error: 'Failed to fetch tech' }, { status: 500 });
  }
}
