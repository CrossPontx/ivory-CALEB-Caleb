import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { db } from '@/db'
import { looks, savedDesigns } from '@/db/schema'
import { eq } from 'drizzle-orm'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, lookId, savedDesignId } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Check if we have cached analysis
    if (lookId) {
      try {
        const [look] = await db
          .select()
          .from(looks)
          .where(eq(looks.id, parseInt(lookId)))
          .limit(1)

        if (look?.aiAnalysis) {
          return NextResponse.json({ analysis: look.aiAnalysis, cached: true })
        }
      } catch (dbError) {
        console.error('Database error checking cache (looks):', dbError)
        // Continue to generate new analysis if DB check fails
      }
    }

    if (savedDesignId) {
      try {
        const [design] = await db
          .select()
          .from(savedDesigns)
          .where(eq(savedDesigns.id, parseInt(savedDesignId)))
          .limit(1)

        if (design?.aiAnalysis) {
          return NextResponse.json({ analysis: design.aiAnalysis, cached: true })
        }
      } catch (dbError) {
        console.error('Database error checking cache (savedDesigns):', dbError)
        // Continue to generate new analysis if DB check fails
      }
    }

    // Generate new analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional nail design analyst. Always respond with valid JSON only, no additional text or markdown formatting.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this nail design image and provide a detailed breakdown. Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):

{
  "summary": "A concise 100-125 word description of the nail design. Include 2-3 relevant emojis naturally throughout the text (like 💅, ✨, 💎, 🌸, ⭐, 🎨, 💫, 🌟, etc.) to add visual interest. Describe the overall aesthetic, key colors, main design elements, finish quality, and the vibe it creates. Keep it engaging and elegant while being brief and focused on the most important features.",
  "nailShape": "Square|Almond|Stiletto|Coffin|Oval|Custom",
  "nailLength": "Short|Medium|Long|XL",
  "baseColor": "Detailed color description with opacity and finish",
  "designElements": ["Array of design elements like French tips, chrome, 3D, swirls, gems, glitter, ombre, etc."],
  "finish": "High gloss|Soft gloss|Matte|Chrome overlay",
  "complexityLevel": "Simple|Medium|Advanced|Art-heavy",
  "wearability": "Everyday|Event|Statement"
}

The summary should be approximately 100-125 words with 2-3 emojis naturally integrated. Return ONLY the JSON object, nothing else.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Check if AI refused to analyze (not a nail design image)
    if (content.toLowerCase().includes("unable to analyze") || 
        content.toLowerCase().includes("cannot analyze") ||
        content.toLowerCase().includes("not a nail design")) {
      console.log('AI refused to analyze image:', content)
      return NextResponse.json(
        { error: 'This image does not appear to contain a nail design. Please upload an image showing completed nails with polish or nail art.' },
        { status: 400 }
      )
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim()
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '')
    }

    // Extract JSON from the response
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not parse JSON. Response was:', content)
      return NextResponse.json(
        { error: 'Unable to analyze this image. Please ensure it shows a clear view of completed nail designs.' },
        { status: 400 }
      )
    }

    let analysis
    try {
      analysis = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0])
      return NextResponse.json(
        { error: 'Unable to analyze this image. Please ensure it shows a clear view of completed nail designs.' },
        { status: 400 }
      )
    }

    // Save analysis to database
    if (lookId) {
      try {
        await db
          .update(looks)
          .set({ aiAnalysis: analysis })
          .where(eq(looks.id, parseInt(lookId)))
      } catch (dbError) {
        console.error('Database error saving analysis (looks):', dbError)
        // Still return the analysis even if save fails
      }
    }

    if (savedDesignId) {
      try {
        await db
          .update(savedDesigns)
          .set({ aiAnalysis: analysis })
          .where(eq(savedDesigns.id, parseInt(savedDesignId)))
      } catch (dbError) {
        console.error('Database error saving analysis (savedDesigns):', dbError)
        // Still return the analysis even if save fails
      }
    }

    return NextResponse.json({ analysis, cached: false })
  } catch (error) {
    console.error('Error analyzing design:', error)
    return NextResponse.json(
      { error: 'Failed to analyze design', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
