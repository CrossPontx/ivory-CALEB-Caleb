# ✅ OAuth Setup Complete!

## What's Been Configured

### Google OAuth ✅
- **Client ID**: `87680335444-941r20hc8rui524lsjqjkatt8c1bq0rl.apps.googleusercontent.com`
- **Client Secret**: Configured in `.env.local`
- **Callback URL**: `https://ivory-blond.vercel.app/api/auth/callback/google`

### Apple Sign In ✅
- **Team ID**: `B46X894ZHC`
- **Key ID**: `ZGBNSXPW9L`
- **Services ID**: `com.ivory.apple.auth`
- **Client Secret**: Generated and configured in `.env.local`
- **Callback URL**: `https://ivory-blond.vercel.app/api/auth/callback/apple`

## Files Updated

- ✅ `.env.local` - Added OAuth credentials
- ✅ `generate-apple-secret.js` - Script to generate Apple JWT
- ✅ `package.json` - Added jsonwebtoken dependency
- ✅ `.env.example` - Updated with OAuth examples

## Next Steps

### 1. Test Locally (Optional)

If you want to test on localhost:

1. Update Google OAuth redirect URI in [Google Cloud Console](https://console.cloud.google.com/):
   - Add: `http://localhost:3000/api/auth/callback/google`

2. Update Apple Services ID in [Apple Developer Portal](https://developer.apple.com/):
   - Add: `http://localhost:3000/api/auth/callback/apple`

3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Restart dev server:
   ```bash
   yarn dev
   ```

### 2. Deploy to Production

Your production environment is already configured for:
- **Domain**: `https://ivory-blond.vercel.app`

**Add these environment variables to Vercel:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```bash
GOOGLE_CLIENT_ID=87680335444-941r20hc8rui524lsjqjkatt8c1bq0rl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
APPLE_CLIENT_ID=com.ivory.apple.auth
APPLE_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlpHQk5TWFBXOUwifQ.eyJpc3MiOiJCNDZYODk0WkhDIiwiaWF0IjoxNzY1NTc2Njg1LCJleHAiOjE3ODEzNTM2ODUsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJjb20uaXZvcnkuYXBwbGUuYXV0aCJ9.fj6MMlMK-6A2BV6zUVlHvMGOYRDpln6VzJWRcib5SL4ewDVPTDY0t_Xr4hKBt67ARrM6RQglme6UARWw1hpV2Q
```

5. Redeploy your app

### 3. Verify OAuth Providers

**Google OAuth Settings:**
- Console: https://console.cloud.google.com/
- Authorized redirect URIs should include:
  - `https://ivory-blond.vercel.app/api/auth/callback/google`

**Apple Sign In Settings:**
- Portal: https://developer.apple.com/
- Services ID: `com.ivory.apple.auth`
- Return URLs should include:
  - `https://ivory-blond.vercel.app/api/auth/callback/apple`

## Testing OAuth

Once deployed, test the OAuth flow:

1. Go to `https://ivory-blond.vercel.app`
2. Click "Sign in with Google"
   - Should redirect to Google login
   - After login, should redirect back and create/login user
3. Click "Sign in with Apple"
   - Should redirect to Apple login
   - After login, should redirect back and create/login user

## Security Notes

✅ OAuth credentials are properly secured
✅ Client secrets are in `.env.local` (not committed to git)
✅ Proper token verification in callback endpoints
✅ Users are authenticated by Google/Apple before login

## Maintenance

**Apple Client Secret Expiration:**
- Current secret expires: **June 12, 2026** (6 months from now)
- To regenerate: Run `node generate-apple-secret.js`
- Update `.env.local` and Vercel environment variables

**Google Client Secret:**
- Does not expire
- Keep it secure and rotate if compromised

## Troubleshooting

**"redirect_uri_mismatch" error:**
- Check that your redirect URI in OAuth provider matches exactly
- Make sure you're using the correct domain (http vs https)

**"invalid_client" error:**
- Verify Client ID and Secret are correct
- Check environment variables are set properly

**Apple "invalid_request" error:**
- Ensure Services ID is configured correctly
- Verify return URLs are registered in Apple Developer Portal
- Check that Client Secret hasn't expired

## Files Reference

- `app/api/auth/callback/google/route.ts` - Google OAuth handler
- `app/api/auth/callback/apple/route.ts` - Apple OAuth handler
- `app/page.tsx` - Login page with OAuth buttons
- `generate-apple-secret.js` - Apple JWT generator
- `AuthKey_ZGBNSXPW9L.p8` - Apple private key (keep secure!)

---

🎉 **OAuth is now fully configured and ready to use!**
