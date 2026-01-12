import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites, techProfiles, users, websiteCustomizations, creditTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { websiteBuilder } from '@/lib/website-builder';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const websiteId = parseInt(id);
    if (isNaN(websiteId)) {
      return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 });
    }

    // Handle both JSON and FormData requests
    let prompt: string;
    let attachedFiles: File[] = [];

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with file uploads)
      const formData = await request.formData();
      prompt = formData.get('prompt') as string;
      
      // Extract uploaded files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('file_') && value instanceof File) {
          attachedFiles.push(value);
        }
      }
    } else {
      // Handle JSON request (backward compatibility)
      const body = await request.json();
      prompt = body.prompt;
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Customization prompt is required' }, { status: 400 });
    }

    // Get user and check credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check credits
    if (user.credits < 1) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: 'Website customization requires 1 credit. Please purchase more credits to continue.'
        },
        { status: 402 }
      );
    }

    // Verify website ownership
    const [website] = await db
      .select({
        id: techWebsites.id,
        v0ChatId: techWebsites.v0ChatId,
        demoUrl: techWebsites.demoUrl,
        techProfileId: techWebsites.techProfileId,
      })
      .from(techWebsites)
      .innerJoin(techProfiles, eq(techWebsites.techProfileId, techProfiles.id))
      .where(
        and(
          eq(techWebsites.id, websiteId),
          eq(techProfiles.userId, session.id)
        )
      )
      .limit(1);

    if (!website) {
      return NextResponse.json({ error: 'Website not found or access denied' }, { status: 404 });
    }

    // Use the website builder to customize the website
    const result = await websiteBuilder.customizeWebsite(websiteId, prompt, session.id, attachedFiles);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error customizing website:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to customize website',
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        } : undefined
      },
      { status: 500 }
    );
  }
}