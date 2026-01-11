import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch tech profile by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const profile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, parseInt(userId)),
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching tech profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST - Create or update tech profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      businessName,
      phoneNumber,
      website,
      instagramHandle,
      tiktokHandle,
      facebookHandle,
      otherSocialLinks,
      bio,
      location,
      noShowFeeEnabled,
      noShowFeePercent,
      cancellationWindowHours,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, userId),
    });

    const profileData = {
      userId,
      businessName,
      phoneNumber,
      website,
      instagramHandle,
      tiktokHandle,
      facebookHandle,
      otherSocialLinks,
      bio,
      location,
      noShowFeeEnabled: noShowFeeEnabled || false,
      noShowFeePercent: noShowFeePercent || 50,
      cancellationWindowHours: cancellationWindowHours || 24,
      updatedAt: new Date(),
    };

    let profile;
    if (existingProfile) {
      // Update existing profile
      [profile] = await db
        .update(techProfiles)
        .set(profileData)
        .where(eq(techProfiles.userId, userId))
        .returning();
    } else {
      // Create new profile
      [profile] = await db
        .insert(techProfiles)
        .values({
          ...profileData,
          createdAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error saving tech profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}