import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Public tech profile for V0 websites (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const techId = parseInt(id);

    if (isNaN(techId)) {
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
        services: {
          columns: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
          },
        },
        portfolioImages: {
          columns: {
            id: true,
            imageUrl: true,
            caption: true,
          },
        },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: 'Tech not found' }, { status: 404 });
    }

    // Return public-safe data
    const publicTech = {
      id: tech.id,
      businessName: tech.businessName,
      location: tech.location,
      bio: tech.bio,
      phoneNumber: tech.phoneNumber,
      instagramHandle: tech.instagramHandle,
      website: tech.website,
      user: {
        username: tech.user.username,
        avatar: tech.user.avatar,
      },
      services: tech.services,
      portfolioImages: tech.portfolioImages,
    };

    // Add CORS headers for V0 websites
    const response = NextResponse.json({ tech: publicTech });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error fetching public tech profile:', error);
    return NextResponse.json({ error: 'Failed to fetch tech profile' }, { status: 500 });
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}