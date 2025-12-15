# Production URL Configuration Update

## Changes Made

Updated all environment files to use the production domain: `https://www.ivoryschoice.com`

### Files Updated:

1. ✅ `.env` - Production environment
2. ✅ `.env.local` - Local override
3. ✅ `.env.example` - Template for new developers
4. ✅ `.env.development` - Already set to localhost (no change needed)

### Environment Variables Changed:

```bash
NEXTAUTH_URL=https://www.ivoryschoice.com
NEXT_PUBLIC_BASE_URL=https://www.ivoryschoice.com
```

## Vercel Environment Variables

⚠️ **IMPORTANT**: You also need to update these in your Vercel dashboard:

1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. Update or add:
   - `NEXTAUTH_URL` = `https://www.ivoryschoice.com`
   - `NEXT_PUBLIC_BASE_URL` = `https://www.ivoryschoice.com`
3. Redeploy your app for changes to take effect

## OAuth Provider Updates

You'll also need to update redirect URIs in your OAuth providers:

### Google OAuth
- Console: https://console.cloud.google.com/apis/credentials
- Update Authorized redirect URIs to:
  - `https://www.ivoryschoice.com/api/auth/callback/google`

### Apple OAuth
- Console: https://developer.apple.com/account/resources/identifiers/list/serviceId
- Update Return URLs to:
  - `https://www.ivoryschoice.com/api/auth/callback/apple`

## Cloudflare R2 CORS

Update your R2 bucket CORS policy to include the new domain:

```json
[
  {
    "AllowedOrigins": [
      "https://ivoryschoice.com",
      "https://www.ivoryschoice.com",
      "https://ivory-blond.vercel.app",
      "https://*.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD",
      "PUT",
      "POST"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## Testing Checklist

After deployment, test:
- [ ] OAuth login (Google)
- [ ] OAuth login (Apple)
- [ ] Image uploads to R2
- [ ] Drawing canvas functionality
- [ ] Email sending (password reset, etc.)
- [ ] API endpoints

## Notes

- Local development still uses `http://localhost:3000` (via `.env.development`)
- Production uses `https://www.ivoryschoice.com`
- The API proxy for images will work automatically with the new domain
