import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, techWebsites, users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Test website creation request received');
    
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain } = await request.json();

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Check user credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: 'Website creation requires 1 credit. Please purchase more credits to continue.'
        },
        { status: 402 }
      );
    }

    // Get tech profile
    const [techProfile] = await db
      .select({
        id: techProfiles.id,
        businessName: techProfiles.businessName,
        location: techProfiles.location,
        bio: techProfiles.bio,
        phoneNumber: techProfiles.phoneNumber,
        website: techProfiles.website,
        instagramHandle: techProfiles.instagramHandle,
        user: {
          username: users.username,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(techProfiles)
      .innerJoin(users, eq(techProfiles.userId, users.id))
      .where(eq(techProfiles.userId, session.id))
      .limit(1);

    if (!techProfile) {
      return NextResponse.json(
        { error: 'Tech profile not found' },
        { status: 404 }
      );
    }

    // Check if subdomain is available
    const existingWebsite = await db
      .select()
      .from(techWebsites)
      .where(eq(techWebsites.subdomain, subdomain))
      .limit(1);

    if (existingWebsite.length > 0) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }

    // Create a test website without V0
    const testChatId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const testDemoUrl = `https://example.com/demo/${testChatId}`;

    // Deduct 1 credit
    await db
      .update(users)
      .set({ 
        credits: user.credits - 1,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.id));

    // Log credit transaction
    await db.insert(creditTransactions).values({
      userId: session.id,
      amount: -1,
      type: 'website_creation',
      description: 'Test website creation',
      balanceAfter: user.credits - 1,
    });

    // Save website to database
    const [website] = await db
      .insert(techWebsites)
      .values({
        techProfileId: techProfile.id,
        subdomain,
        v0ChatId: testChatId,
        demoUrl: testDemoUrl,
        themeSettings: {
          colorScheme: 'modern',
          style: 'professional',
        },
        seoSettings: {
          title: `${techProfile.businessName || techProfile.user.username} - Professional Nail Services`,
          description: techProfile.bio || `Book professional nail services with ${techProfile.businessName || techProfile.user.username}`,
          keywords: ['nail tech', 'nail art', 'manicure', 'pedicure', techProfile.location].filter(Boolean),
        },
      })
      .returning();

    console.log('Test website created successfully:', website.id);

    return NextResponse.json({
      websiteId: website.id,
      chatId: testChatId,
      demoUrl: testDemoUrl,
      subdomain: `${subdomain}.ivoryschoice.com`,
      files: [],
      creditsRemaining: user.credits - 1,
      isTest: true,
    });
  } catch (error) {
    console.error('Error creating test website:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create test website',
        debug: {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        }
      },
      { status: 500 }
    );
  }
}