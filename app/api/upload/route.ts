import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, generateFilename } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Generate unique filename
    const filename = generateFilename(file.name, type || 'upload')

    // Upload to configured storage (R2, Vercel Blob, etc.)
    const { url, key } = await uploadFile(file, filename, {
      folder: type === 'image' ? 'captures' : 'uploads',
      contentType: file.type,
    })

    return NextResponse.json({ url, key })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
