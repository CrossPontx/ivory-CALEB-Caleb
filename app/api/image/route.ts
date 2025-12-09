import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
    }

    // Fetch from R2 using server credentials
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
    })

    const response = await s3Client.send(command)
    const buffer = await response.Body?.transformToByteArray()

    if (!buffer) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error: any) {
    console.error('Image fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}
