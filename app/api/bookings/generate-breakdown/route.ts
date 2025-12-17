import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designBreakdowns, bookings, looks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get booking with design
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        look: true,
        service: true,
        techProfile: {
          with: {
            user: true,
          },
        },
        client: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only generate if there's a design attached
    if (!booking.lookId || !booking.look) {
      return NextResponse.json({ 
        message: 'No design attached to this booking',
        breakdown: null 
      });
    }

    // Check if breakdown already exists
    const existing = await db.query.designBreakdowns.findFirst({
      where: eq(designBreakdowns.bookingId, bookingId),
    });

    if (existing) {
      return NextResponse.json({ breakdown: existing });
    }

    const look = booking.look as any;

    // Generate comprehensive breakdown using GPT-4 Vision
    const prompt = `You are an expert nail technician instructor analyzing a nail design for a professional nail tech to recreate for a client booking.

Analyze this nail design image and provide an extremely detailed, professional technical breakdown. Use proper nail industry terminology throughout.

CLIENT REQUEST CONTEXT:
- Service: ${(booking.service as any).name}
- Duration: ${booking.duration} minutes
${booking.clientNotes ? `- Client Notes: ${booking.clientNotes}` : ''}

REQUIRED ANALYSIS:

1. DESIGN OVERVIEW
   - Overall style and aesthetic
   - Nail shape recommendation
   - Length recommendation
   - Color palette (be specific with color names/codes if possible)

2. PREPARATION & BASE
   - Nail prep steps (filing, buffing, dehydration)
   - Base coat type needed (regular, builder gel, rubber base, etc.)
   - Any nail extensions or tips needed

3. COLOR APPLICATION
   - Specific colors needed (describe shades precisely)
   - Brand recommendations if recognizable
   - Number of coats required
   - Application technique (full coverage, ombre, gradient, etc.)
   - Curing times for each layer (if gel/UV)

4. DESIGN TECHNIQUE BREAKDOWN
   - Primary technique (hand-painted, stamping, chrome, foil, etc.)
   - Secondary techniques if applicable
   - Detailed step-by-step for each design element
   - Which nails get which designs
   - Order of operations

5. CHROME/SPECIAL EFFECTS (if applicable)
   - Type of chrome (mirror, aurora, holographic, etc.)
   - Application method
   - When to apply in the process
   - Buffing/rubbing technique

6. TOOLS & PRODUCTS NEEDED
   - Specific brushes (liner, detail, flat, etc.)
   - Dotting tools or other implements
   - Gel polish vs regular polish vs acrylic
   - Top coat type (glossy, matte, no-wipe, etc.)
   - Any special products (chrome powder, foils, rhinestones, etc.)

7. STEP-BY-STEP PROCESS
   - Numbered steps in exact order
   - Timing for each step
   - Pro tips for each step
   - What to watch out for

8. FINISHING
   - Top coat application technique
   - Cap the free edge instructions
   - Final curing
   - Cleanup around cuticles
   - Oil application

9. DIFFICULTY & TIME
   - Skill level required (beginner/intermediate/advanced)
   - Realistic time estimate
   - What makes it challenging

10. PRO TIPS & COMMON MISTAKES
    - Professional tricks for best results
    - Common errors to avoid
    - Troubleshooting tips

Use nail tech terminology like: "float the color", "encapsulate", "cap the free edge", "cure for 60 seconds", "buff to 180 grit", "dehydrate the nail plate", "apply in thin coats", "avoid flooding the cuticle", etc.

Format your response as JSON with this structure:
{
  "overview": {
    "style": "description",
    "nailShape": "shape recommendation",
    "length": "length recommendation",
    "colorPalette": ["color 1", "color 2", ...]
  },
  "difficulty": "beginner|intermediate|advanced",
  "estimatedTime": number (in minutes),
  "preparation": {
    "steps": ["step 1", "step 2", ...],
    "baseCoatType": "type of base coat"
  },
  "productsNeeded": [
    {
      "category": "category name",
      "items": ["item 1", "item 2", ...]
    }
  ],
  "toolsNeeded": ["tool 1", "tool 2", ...],
  "techniques": ["technique 1", "technique 2", ...],
  "colorApplication": {
    "colors": [
      {
        "name": "color name/description",
        "coats": number,
        "cureTime": "time if gel",
        "application": "technique"
      }
    ]
  },
  "designProcess": [
    {
      "stepNumber": number,
      "title": "step title",
      "description": "detailed description with nail tech terminology",
      "duration": "estimated time",
      "tips": "pro tips for this step",
      "cureTime": "cure time if applicable"
    }
  ],
  "specialEffects": {
    "hasChrome": boolean,
    "chromeType": "type if applicable",
    "chromeApplication": "detailed instructions",
    "otherEffects": ["effect 1", "effect 2", ...]
  },
  "finishing": {
    "topCoatType": "type",
    "application": "technique",
    "finalSteps": ["step 1", "step 2", ...]
  },
  "proTips": [
    {
      "category": "category",
      "tip": "detailed tip"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "what to avoid",
      "solution": "how to prevent/fix"
    }
  ],
  "clientConsiderations": "any specific notes based on client request"
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
      max_tokens: 4000,
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
      console.error('Failed to parse breakdown JSON:', e);
      // If parsing fails, create a simple structure with the raw text
      breakdown = {
        overview: { style: 'Analysis provided', nailShape: 'As shown', length: 'As shown', colorPalette: [] },
        difficulty: 'intermediate',
        estimatedTime: booking.duration || 60,
        preparation: { steps: [], baseCoatType: 'Standard base coat' },
        productsNeeded: [],
        toolsNeeded: [],
        techniques: [],
        colorApplication: { colors: [] },
        designProcess: [{ 
          stepNumber: 1, 
          title: 'Design Analysis', 
          description: rawText, 
          duration: '', 
          tips: '',
          cureTime: ''
        }],
        specialEffects: { hasChrome: false, chromeType: '', chromeApplication: '', otherEffects: [] },
        finishing: { topCoatType: 'Glossy top coat', application: 'Standard', finalSteps: [] },
        proTips: [],
        commonMistakes: [],
        clientConsiderations: booking.clientNotes || ''
      };
    }

    // Extract simplified data for database columns
    const productsArray = breakdown.productsNeeded?.flatMap((cat: any) => cat.items || []) || [];
    const techniques = breakdown.techniques || [];

    // Save to database
    const [newBreakdown] = await db.insert(designBreakdowns).values({
      lookId: booking.lookId,
      bookingId: booking.id,
      generatedFor: (booking.techProfile as any).userId,
      breakdown,
      rawText,
      difficulty: breakdown.difficulty || 'intermediate',
      estimatedTime: breakdown.estimatedTime || booking.duration,
      productsNeeded: productsArray,
      techniques: techniques,
    }).returning();

    return NextResponse.json({ 
      breakdown: newBreakdown,
      message: 'Design breakdown generated successfully'
    });
  } catch (error) {
    console.error('Error generating booking breakdown:', error);
    return NextResponse.json({ 
      error: 'Failed to generate breakdown',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
