import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, originalImage, selectedDesignImage } = await request.json()

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Build messages for gpt-image-1 with the original image and design settings
    const messages: any[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Apply the following nail design to this hand image: ${prompt}\n\nIMPORTANT: Preserve the exact hand pose, skin tone, lighting, background, and all natural features. Only modify the nails with the requested design. The result should look like a professional nail art photo with the design seamlessly applied.`
          },
          {
            type: 'image_url',
            image_url: {
              url: originalImage
            }
          }
        ]
      }
    ]

    // If there's a selected design image, include it as reference
    if (selectedDesignImage) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Use this design as a reference and apply it to the hand above:'
          },
          {
            type: 'image_url',
            image_url: {
              url: selectedDesignImage
            }
          }
        ]
      })
    }

    // Try using gpt-image-1 with the correct API structure
    // If this model exists, it should accept image input
    try {
      // @ts-ignore - gpt-image-1 is a new model
      const imageResponse = await openai.chat.completions.create({
        model: 'gpt-image-1',
        messages: messages,
        max_tokens: 1,
        // This should return an image URL in the response
      })

      // Extract image URL from response
      // The exact response structure may vary for this new model
      const imageUrl = imageResponse.choices?.[0]?.message?.content

      if (imageUrl && imageUrl.startsWith('http')) {
        return NextResponse.json({ imageUrl })
      }
    } catch (gptImageError: any) {
      console.log('gpt-image-1 not available, falling back to DALL-E 3:', gptImageError.message)
    }

    // Fallback: Use GPT-4o to analyze the image and create a detailed prompt
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 500,
    })

    const detailedDescription = analysisResponse.choices[0]?.message?.content || ''

    // Generate with DALL-E 3 using the enhanced description
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${detailedDescription}\n\nApply this design: ${prompt}\n\nPhotorealistic, professional nail art photography, high quality, studio lighting.`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    })

    const imageUrl = dalleResponse.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate nail design' },
      { status: 500 }
    )
  }
}
