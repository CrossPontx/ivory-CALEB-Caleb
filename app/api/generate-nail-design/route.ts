import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, originalImage, selectedDesignImage } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Enhanced prompt to incorporate the original hand image context
    let finalPrompt = prompt
    
    if (originalImage && selectedDesignImage) {
      // When we have both original hand and selected design
      finalPrompt = `${prompt} IMPORTANT: Apply this nail design to a realistic human hand that matches the pose and skin tone from the reference. The hand should look natural with the design applied only to the nails. Preserve the hand's natural appearance, lighting, and position.`
    } else if (originalImage) {
      // When we only have the original hand
      finalPrompt = `${prompt} Apply to a realistic human hand with natural skin tones, professional photography, studio lighting.`
    }

    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('DALL-E generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate nail design' },
      { status: 500 }
    )
  }
}
