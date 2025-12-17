import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designBreakdowns, looks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST - Generate design breakdown for nail tech
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

    // Only nail techs can generate breakdowns
    if (session.user.userType !== 'tech') {
      return NextResponse.json({ error: 'Only nail techs can generate design breakdowns' }, { status: 403 });
    }

    const body = await request.json();
    const { lookId, bookingId } = body;

    if (!lookId) {
      return NextResponse.json({ error: 'Look ID is required' }, { status: 400 });
    }

    // Get the look/design
    const look = await db.query.looks.findFirst({
      where: eq(looks.id, lookId),
    });

    if (!look) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    // Check if breakdown already exists
    const existing = await db.query.designBreakdowns.findFirst({
      where: eq(designBreakdowns.lookId, lookId),
    });

    if (existing) {
      return NextResponse.json({ breakdown: existing });
    }

    // Generate breakdown using GPT-4 Vision
    const prompt = `You are an expert nail technician instructor. Analyze this nail design image and provide a detailed, professional breakdown for a nail tech to recreate it.

Use proper nail tech terminology and be specific about:
1. Preparation steps (base coat, nail prep)
2. Color application (brands if recognizable, layering technique)
3. Design technique (freehand, stamping, stickers, chrome, etc.)
4. Specific tools needed (dotting tool, striping brush, etc.)
5. Products needed (gel polish, acrylic, builder gel, top coat type)
6. Step-by-step application process
7. Curing times if gel/UV
8. Finishing touches
9. Estimated difficulty level (beginner/intermediate/advanced)
10. Estimated time to complete

Be conversational but professional. Use terms like "cure", "float", "encapsulate", "cap the free edge", etc.

Format your response as JSON with this structure:
{
  "difficulty": "beginner|intermediate|advanced",
  "estimatedTime": number (in minutes),
  "productsNeeded": ["product 1", "product 2", ...],
  "techniques": ["technique 1", "technique 2", ...],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed description",
      "tips": "Pro tips for this step"
    }
  ],
  "proTips": ["general tip 1", "general tip 2", ...],
  "commonMistakes": ["mistake to avoid 1", "mistake to avoid 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: look.imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const rawText = response.choices[0].message.content || '';
    
    // Parse JSON from response
    let breakdown;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawText;
      breakdown = JSON.parse(jsonStr);
    } catch (e) {
      // If parsing fails, create a simple structure
      breakdown = {
        difficulty: 'intermediate',
        estimatedTime: 60,
        productsNeeded: [],
        techniques: [],
        steps: [{ stepNumber: 1, title: 'Analysis', description: rawText, tips: '' }],
        proTips: [],
        commonMistakes: [],
      };
    }

    // Save to database
    const [newBreakdown] = await db.insert(designBreakdowns).values({
      lookId,
      bookingId: bookingId || null,
      generatedFor: session.userId,
      breakdown,
      rawText,
      difficulty: breakdown.difficulty,
      estimatedTime: breakdown.estimatedTime,
      productsNeeded: breakdown.productsNeeded,
      techniques: breakdown.techniques,
    }).returning();

    return NextResponse.json({ breakdown: newBreakdown });
  } catch (error) {
    console.error('Error generating design breakdown:', error);
    return NextResponse.json({ error: 'Failed to generate breakdown' }, { status: 500 });
  }
}

// GET - Fetch existing breakdown
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lookId = searchParams.get('lookId');

    if (!lookId) {
      return NextResponse.json({ error: 'Look ID is required' }, { status: 400 });
    }

    const breakdown = await db.query.designBreakdowns.findFirst({
      where: eq(designBreakdowns.lookId, parseInt(lookId)),
      with: {
        look: true,
      },
    });

    if (!breakdown) {
      return NextResponse.json({ error: 'Breakdown not found' }, { status: 404 });
    }

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Error fetching breakdown:', error);
    return NextResponse.json({ error: 'Failed to fetch breakdown' }, { status: 500 });
  }
}
