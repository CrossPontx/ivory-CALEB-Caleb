import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techTimeOff, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Add time off period
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
      return NextResponse.json({ error: 'Only nail techs can add time off' }, { status: 403 });
    }

    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { startDate, endDate, reason } = body;

    const [timeOff] = await db.insert(techTimeOff).values({
      techProfileId: techProfile.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || null,
    }).returning();

    return NextResponse.json({ timeOff });
  } catch (error) {
    console.error('Error adding time off:', error);
    return NextResponse.json({ error: 'Failed to add time off' }, { status: 500 });
  }
}

// DELETE - Remove time off period
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Time off ID required' }, { status: 400 });
    }

    // Verify ownership
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    const timeOffRecord = await db.query.techTimeOff.findFirst({
      where: eq(techTimeOff.id, parseInt(id)),
    });

    if (!timeOffRecord || timeOffRecord.techProfileId !== techProfile.id) {
      return NextResponse.json({ error: 'Time off not found' }, { status: 404 });
    }

    await db.delete(techTimeOff).where(eq(techTimeOff.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time off:', error);
    return NextResponse.json({ error: 'Failed to delete time off' }, { status: 500 });
  }
}
