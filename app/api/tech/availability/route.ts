import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techAvailability, techTimeOff, techProfiles } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET - Fetch tech availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const techProfileId = searchParams.get('techProfileId');

    if (!techProfileId) {
      return NextResponse.json({ error: 'Tech profile ID required' }, { status: 400 });
    }

    const availability = await db.query.techAvailability.findMany({
      where: and(
        eq(techAvailability.techProfileId, parseInt(techProfileId)),
        eq(techAvailability.isActive, true)
      ),
      orderBy: (techAvailability, { asc }) => [asc(techAvailability.dayOfWeek)],
    });

    // Get time off periods
    const now = new Date();
    const timeOff = await db.query.techTimeOff.findMany({
      where: and(
        eq(techTimeOff.techProfileId, parseInt(techProfileId)),
        gte(techTimeOff.endDate, now)
      ),
      orderBy: (techTimeOff, { asc }) => [asc(techTimeOff.startDate)],
    });

    return NextResponse.json({ availability, timeOff });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST - Set tech availability (tech only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (session.user.userType !== 'tech') {
      return NextResponse.json({ error: 'Only nail techs can set availability' }, { status: 403 });
    }

    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { schedule } = body; // Array of { dayOfWeek, startTime, endTime }

    // Delete existing availability
    await db.delete(techAvailability).where(eq(techAvailability.techProfileId, techProfile.id));

    // Insert new availability
    if (schedule && schedule.length > 0) {
      await db.insert(techAvailability).values(
        schedule.map((slot: any) => ({
          techProfileId: techProfile.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: true,
        }))
      );
    }

    const newAvailability = await db.query.techAvailability.findMany({
      where: eq(techAvailability.techProfileId, techProfile.id),
    });

    return NextResponse.json({ availability: newAvailability });
  } catch (error) {
    console.error('Error setting availability:', error);
    return NextResponse.json({ error: 'Failed to set availability' }, { status: 500 });
  }
}
