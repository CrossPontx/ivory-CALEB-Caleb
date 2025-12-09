import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { uploadFile, generateFilename } from '@/lib/storage'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Upload to R2 storage
    const filename = generateFilename(file.name, 'design')
    const { url } = await uploadFile(file, filename, {
      folder: 'designs',
      contentType: file.type,
    })

    // Use GPT-4 with vision to analyze the uploaded design image
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-image-1-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this reference nail design image (inspiration/example design) and extract the design characteristics to replicate: nail_length (short/medium/long/extra-long), nail_shape (oval/square/round/almond/stiletto/coffin), base_color (hex code of the main color), finish (glossy/matte/satin/metallic/chrome), texture (smooth/glitter/shimmer/textured/holographic), pattern_type (describe the pattern/design style), style_vibe (describe the overall aesthetic like elegant, bold, minimalist, etc.), accent_color (hex code of accent colors used). Return ONLY valid JSON with these exact keys.'
            },
            {
              type: 'image_url',
              image_url: {
                url: url
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const content = analysisResponse.choices[0]?.message?.content || '{}'
    const inferredSettings = JSON.parse(content)

    // Console log the original image URL and extracted text
    console.log('=== DESIGN ANALYSIS ===')
    console.log('Original Image URL:', url)
    console.log('Extracted Design Text:', content)
    console.log('Parsed Settings:', inferredSettings)
    console.log('======================')

    return NextResponse.json({ 
      imageUrl: url,
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
  } catch (error: any) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze design image' },
      { status: 500 }
    )
  }
}
