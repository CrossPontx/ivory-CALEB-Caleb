# OAuth Setup Guide - Google & Apple Sign In

This guide will walk you through setting up Google and Apple OAuth authentication for your app.

## Prerequisites

- Your app must be deployed or accessible via a public URL (for production)
- For local development, you can use `http://localhost:3000`

## Part 1: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Ivory App")
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Ivory
   - **User support email**: your-email@example.com
   - **App logo**: (optional) Upload your app logo
   - **App domain**: your-domain.com
   - **Authorized domains**: Add your domain (e.g., `yourdomain.com`)
   - **Developer contact**: your-email@example.com
5. Click "Save and Continue"
6. **Scopes**: Click "Add or Remove Scopes"
   - Select: `userinfo.email`, `userinfo.profile`, `openid`
   - Click "Update" → "Save and Continue"
7. **Test users** (for development): Add your email
8. Click "Save and Continue" → "Back to Dashboard"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name it: "Ivory Web Client"
5. **Authorized JavaScript origins**:
   - For local: `http://localhost:3000`
   - For production: `https://yourdomain.com`
6. **Authorized redirect URIs**:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Click "Create"
8. **Copy your credentials**:
   - Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-abc123xyz`)

### Step 5: Add to Environment Variables

Add to your `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Part 2: Apple Sign In Setup

### Step 1: Apple Developer Account

1. You need an [Apple Developer Account](https://developer.apple.com/) ($99/year)
2. Log in to your account

### Step 2: Register an App ID

1. Go to "Certificates, Identifiers & Profiles"
2. Click "Identifiers" → "+" button
3. Select "App IDs" → "Continue"
4. Select "App" → "Continue"
5. Fill in:
   - **Description**: Ivory App
   - **Bundle ID**: `com.yourdomain.ivory` (must match your app)
6. Under "Capabilities", check "Sign in with Apple"
7. Click "Continue" → "Register"

### Step 3: Create a Services ID

1. Go back to "Identifiers" → "+" button
2. Select "Services IDs" → "Continue"
3. Fill in:
   - **Description**: Ivory Web Auth
   - **Identifier**: `com.yourdomain.ivory.web` (different from App ID)
4. Check "Sign in with Apple"
5. Click "Configure" next to "Sign in with Apple"
6. **Primary App ID**: Select your App ID from Step 2
7. **Web Domain**: `yourdomain.com` (without https://)
8. **Return URLs**:
   - For local: `http://localhost:3000/api/auth/callback/apple`
   - For production: `https://yourdomain.com/api/auth/callback/apple`
9. Click "Save" → "Continue" → "Register"

### Step 4: Create a Key for Sign in with Apple

1. Go to "Keys" → "+" button
2. **Key Name**: "Ivory Sign in with Apple Key"
3. Check "Sign in with Apple"
4. Click "Configure" → Select your Primary App ID
5. Click "Save" → "Continue" → "Register"
6. **Download the key file** (.p8 file) - you can only download this once!
7. Note your **Key ID** (10 characters, e.g., `ABC123DEFG`)
8. Note your **Team ID** (found in top right of developer portal, e.g., `XYZ987TEAM`)

### Step 5: Generate Client Secret

Apple requires a JWT as the client secret. You need to generate this programmatically.

Create a script `scripts/generate-apple-secret.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Your values from Apple Developer Portal
const TEAM_ID = 'YOUR_TEAM_ID'; // 10 characters
const KEY_ID = 'YOUR_KEY_ID'; // 10 characters
const CLIENT_ID = 'com.yourdomain.ivory.web'; // Your Services ID
const KEY_FILE = './AuthKey_YOUR_KEY_ID.p8'; // Path to your .p8 file

// Read the private key
const privateKey = fs.readFileSync(KEY_FILE, 'utf8');

// Generate the client secret (valid for 6 months)
const clientSecret = jwt.sign(
  {
    iss: TEAM_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15777000, // 6 months
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: KEY_ID,
    },
  }
);

console.log('Apple Client Secret:');
console.log(clientSecret);
```

Run it:
```bash
npm install jsonwebtoken
node scripts/generate-apple-secret.js
```

### Step 6: Add to Environment Variables

Add to your `.env.local` file:

```bash
APPLE_CLIENT_ID=com.yourdomain.ivory.web
APPLE_CLIENT_SECRET=your-generated-jwt-token-here
```

## Part 3: Update Your Environment Files

### Local Development (`.env.local`)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz

# Apple OAuth
APPLE_CLIENT_ID=com.yourdomain.ivory.web
APPLE_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsImtpZCI6IkFCQzEyM0RFRkcifQ...
```

### Production (Vercel/Your Host)

Add the same environment variables to your hosting platform:

**Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add each variable:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `APPLE_CLIENT_ID`
   - `APPLE_CLIENT_SECRET`
3. Make sure to use production URLs in your OAuth provider settings

## Part 4: Testing

### Test Google OAuth

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign in with Google"
4. You should be redirected to Google's login page
5. After signing in, you should be redirected back and logged in

### Test Apple OAuth

1. Click "Sign in with Apple"
2. You should be redirected to Apple's login page
3. After signing in, you should be redirected back and logged in

### Troubleshooting

**Google OAuth Issues:**
- "redirect_uri_mismatch": Make sure your redirect URI in Google Console exactly matches your app URL
- "invalid_client": Check your Client ID and Secret are correct
- "access_denied": User cancelled or denied permissions

**Apple OAuth Issues:**
- "invalid_client": Check your Services ID and Client Secret
- "invalid_request": Verify your redirect URI is registered in Apple Developer Portal
- Client Secret expires after 6 months - regenerate it using the script

## Part 5: Security Checklist

- [ ] Never commit `.env.local` to git (it's in `.gitignore`)
- [ ] Use different OAuth credentials for development and production
- [ ] Keep your Client Secrets secure
- [ ] For Apple, regenerate the Client Secret every 6 months
- [ ] Monitor your OAuth usage in Google Cloud Console
- [ ] Enable 2FA on your Google and Apple developer accounts
- [ ] Review OAuth scopes - only request what you need

## Part 6: Going to Production

Before launching:

1. **Google:**
   - Submit your app for verification if you need more than 100 users
   - Update OAuth consent screen with production info
   - Add production redirect URIs

2. **Apple:**
   - Ensure your domain is verified
   - Test on actual iOS devices
   - Update redirect URIs to production URLs

3. **Both:**
   - Update environment variables on your hosting platform
   - Test the full OAuth flow on production
   - Monitor error logs

## Support

If you encounter issues:
- Google OAuth: [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Apple Sign In: [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- Check the browser console for errors
- Check your server logs for OAuth callback errors

## Notes

- OAuth credentials are already configured in the code
- The callback endpoints are at:
  - `/api/auth/callback/google`
  - `/api/auth/callback/apple`
- Users can sign in with OAuth even if they originally signed up with email/password (as long as emails match)
