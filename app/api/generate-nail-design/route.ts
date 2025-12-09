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

    // If there's a selected design image, we need to preserve the hand from original
    // and apply the design. For now, we'll use the prompt directly with DALL-E 3
    // In production, you might want to use image editing APIs or more advanced techniques
    
    const finalPrompt = selectedDesignImage 
      ? `${prompt} Apply this exact nail design to a realistic human hand, preserving natural skin tones and hand position.`
      : prompt

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
  } catch (error) {
    console.error('DALL-E generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate nail design' },
      { status: 500 }
    )
  }
}
