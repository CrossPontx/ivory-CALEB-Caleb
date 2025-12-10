// Runtime configuration example
// Copy this to lib/config.ts and fill in your values
// OR use environment variables (recommended for production)

export const config = {
  // Cloudflare R2 Storage
  R2_ENDPOINT: process.env.R2_ENDPOINT || 'https://your-account-id.r2.cloudflarestorage.com',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || 'your-access-key-id',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || 'your-secret-access-key',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'your-bucket-name',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || 'https://your-public-url.r2.dev',
  
  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || 'your-blob-token',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key',
} as const
