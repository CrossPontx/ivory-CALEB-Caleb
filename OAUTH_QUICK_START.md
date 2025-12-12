# OAuth Quick Start

## What's Been Implemented

✅ Secure OAuth callback endpoints for Google and Apple
✅ Frontend OAuth flow with proper redirects
✅ User creation/login with OAuth providers
✅ Session management after OAuth login
✅ Protection against insecure OAuth bypass

## What You Need To Do

### 1. Get Google OAuth Credentials (15 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 2. Get Apple OAuth Credentials (30 minutes)

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with "Sign in with Apple" enabled
3. Create a Services ID
4. Create a Key and download the .p8 file
5. Generate Client Secret using the provided script
6. Copy Client ID and Client Secret

### 3. Add to Environment Variables

Create/update `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth  
APPLE_CLIENT_ID=com.yourdomain.ivory.web
APPLE_CLIENT_SECRET=your-generated-jwt-token
```

### 4. Restart Your Dev Server

```bash
npm run dev
```

### 5. Test It

1. Go to `http://localhost:3000`
2. Click "Sign in with Google" or "Sign in with Apple"
3. Complete the OAuth flow
4. You should be logged in!

## Files Created/Modified

- ✅ `app/api/auth/callback/google/route.ts` - Google OAuth callback
- ✅ `app/api/auth/callback/apple/route.ts` - Apple OAuth callback
- ✅ `app/page.tsx` - Updated to use proper OAuth flow
- ✅ `app/api/auth/signup/route.ts` - Removed OAuth blocking
- ✅ `next.config.mjs` - Added public env variables
- ✅ `OAUTH_SETUP_GUIDE.md` - Detailed setup instructions
- ✅ `OAUTH_QUICK_START.md` - This file

## Need Help?

See `OAUTH_SETUP_GUIDE.md` for detailed step-by-step instructions with screenshots and troubleshooting.

## Security Notes

- OAuth Client IDs are safe to expose (they're public)
- OAuth Client Secrets must be kept private (never commit to git)
- The app now uses proper OAuth flows with token verification
- Users are authenticated by Google/Apple before being logged in
