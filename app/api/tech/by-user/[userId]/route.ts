import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Find tech profile by user ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const userIdNum = parseInt(userId);

    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, userIdNum),
      columns: {
        id: true,
        businessName: true,
        location: true,
      },
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    return NextResponse.json({ techProfileId: techProfile.id, ...techProfile });
  } catch (error) {
    console.error('Error finding tech profile:', error);
    return NextResponse.json({ error: 'Failed to find tech profile' }, { status: 500 });
  }
}
