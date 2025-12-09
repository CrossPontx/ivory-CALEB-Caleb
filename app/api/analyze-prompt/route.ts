import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Use GPT to analyze the prompt and extract design parameters
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a nail art design expert. Analyze user prompts and extract: nail_length (short/medium/long/extra-long), nail_shape (oval/square/round/almond/stiletto/coffin), base_color (hex code), finish (glossy/matte/satin/metallic/chrome), texture (smooth/glitter/shimmer/textured/holographic), pattern_type, style_vibe, accent_color (hex code). Return as JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    const inferredSettings = JSON.parse(analysisResponse.choices[0]?.message?.content || '{}')

    // Generate 3 design variations based on the prompt
    const designPrompts = [
      `Ultra-detailed nail art design applied ONLY inside a fingernail area. ${prompt}. Nail length: ${inferredSettings.nail_length || 'medium'}, Nail shape: ${inferredSettings.nail_shape || 'oval'}. Base color: ${inferredSettings.base_color || '#FF6B9D'}. Finish: ${inferredSettings.finish || 'glossy'}. Texture: ${inferredSettings.texture || 'smooth'}. Design style: ${inferredSettings.pattern_type || 'artistic'} pattern, ${inferredSettings.style_vibe || 'elegant'} aesthetic. Accent color: ${inferredSettings.accent_color || '#FFFFFF'}. Highly realistic nail polish appearance: smooth polish, clean edges, even color distribution, professional salon quality, subtle natural reflections. Design must: stay strictly within the nail surface, follow realistic nail curvature, respect nail boundaries, appear physically painted onto the nail. High resolution, realistic lighting, natural skin reflection preserved.`
    ]

    const designs: string[] = []
    
    for (const designPrompt of designPrompts) {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: designPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })

      const imageUrl = imageResponse.data[0]?.url
      if (imageUrl) {
        designs.push(imageUrl)
      }
    }

    return NextResponse.json({ 
      designs,
      inferredSettings: {
        nailLength: inferredSettings.nail_length,
        nailShape: inferredSettings.nail_shape,
        baseColor: inferredSettings.base_color,
        finish: inferredSettings.finish,
        texture: inferredSettings.texture,
        patternType: inferredSettings.pattern_type,
        styleVibe: inferredSettings.style_vibe,
        accentColor: inferredSettings.accent_color
      }
    })
  } catch (error) {
    console.error('Prompt analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    )
  }
}
