import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// GET - Fetch current user's tech profile with all related data
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.id),
      with: {
        user: {
          columns: {
            username: true,
            email: true,
            avatar: true,
          },
        },
        services: true,
        portfolioImages: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching tech profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}