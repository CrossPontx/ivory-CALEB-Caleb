import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, services, portfolioImages, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { templateWebsiteGenerator } from '@/lib/template-website-generator';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Website creation request received');
    console.log('V0_API_KEY available:', !!process.env.V0_API_KEY);
    
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, preferences } = await request.json();

    if (!subdomain || !preferences) {
      return NextResponse.json(
        { error: 'Subdomain and preferences are required' },
        { status: 400 }
      );
    }

    // Check if request was aborted early
    if (request.signal?.aborted) {
      return NextResponse.json(
        { error: 'Request was cancelled' },
        { status: 499 } // Client Closed Request
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

    // Get tech profile with related data
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

    // Get services
    const techServices = await db
      .select({
        name: services.name,
        description: services.description,
        price: services.price,
        duration: services.duration,
      })
      .from(services)
      .where(eq(services.techProfileId, techProfile.id));

    // Get portfolio images
    const portfolio = await db
      .select({
        imageUrl: portfolioImages.imageUrl,
        caption: portfolioImages.caption,
      })
      .from(portfolioImages)
      .where(eq(portfolioImages.techProfileId, techProfile.id));

    // Create website using template generator (reliable, no external dependencies)
    const result = await templateWebsiteGenerator.createTechWebsite(
      {
        ...techProfile,
        services: techServices.map(s => ({
          ...s,
          price: s.price?.toString() || '0',
        })),
        portfolioImages: portfolio,
      },
      preferences,
      subdomain,
      session.id,
      request.signal // Pass the abort signal
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating website:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      v0KeyAvailable: !!process.env.V0_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorConstructor: error instanceof Error ? error.constructor.name : 'Unknown',
    });
    
    // Handle cancellation specifically
    if (error instanceof Error && (
      error.message.includes('cancelled') || 
      error.message.includes('Request was cancelled') ||
      request.signal?.aborted
    )) {
      return NextResponse.json(
        { 
          error: 'Website creation was cancelled',
          cancelled: true
        },
        { status: 499 } // Client Closed Request
      );
    }

    // Handle specific V0 API errors
    if (error instanceof Error) {
      // V0 SDK errors
      if (error.message.includes('V0 API key is not configured')) {
        return NextResponse.json(
          { error: 'Website builder service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      // Network/timeout errors
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return NextResponse.json(
          { error: 'Website creation is taking longer than expected due to high demand. Please try again in a few minutes.' },
          { status: 408 }
        );
      }
      
      // Rate limiting
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'The AI service is experiencing high demand. Please try again in a few minutes.' },
          { status: 429 }
        );
      }
      
      // Authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Website builder service authentication failed. Please try again later.' },
          { status: 503 }
        );
      }
      
      // Generic API errors
      if (error.message.includes('API') || error.message.includes('v0')) {
        return NextResponse.json(
          { error: 'Website creation service is temporarily unavailable. Please try again in a few minutes.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Website creation is taking longer than expected due to high demand. Please try again in a few minutes.',
        debug: process.env.NODE_ENV === 'development' ? {
          v0KeyAvailable: !!process.env.V0_API_KEY,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tech profile ID
    const [techProfile] = await db
      .select({ id: techProfiles.id })
      .from(techProfiles)
      .where(eq(techProfiles.userId, session.id))
      .limit(1);

    if (!techProfile) {
      return NextResponse.json(
        { error: 'Tech profile not found' },
        { status: 404 }
      );
    }

    // Get website data using template generator
    const websiteData = await templateWebsiteGenerator.getWebsiteData ? 
      await templateWebsiteGenerator.getWebsiteData(techProfile.id) :
      null;

    if (!websiteData) {
      // No website exists yet - this is normal for new users
      return NextResponse.json(
        { error: 'No website found' },
        { status: 404 }
      );
    }

    return NextResponse.json(websiteData);
  } catch (error) {
    console.error('Error getting website:', error);
    return NextResponse.json(
      { error: 'Failed to get website data' },
      { status: 500 }
    );
  }
}