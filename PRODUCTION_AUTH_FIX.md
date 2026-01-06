# Production Authentication Fix

## Problem
Getting 400/401 errors on `/api/user/pending-generations` in production but works on localhost.

## Root Cause
Session cookies are not being properly validated in production. This is typically caused by:

1. **Missing or mismatched JWT_SECRET** in production environment
2. **Cookie settings** not compatible with production domain
3. **Environment variable** not properly set in Vercel

## Solution

### Step 1: Verify Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify these variables are set:
   - `JWT_SECRET` - Must be the same value used when users logged in
   - `DATABASE_URL` - Your Neon database connection string
   - `NODE_ENV` - Should be `production`

### Step 2: Generate New JWT_SECRET (if needed)

If you don't have a JWT_SECRET or need to generate a new one:

```bash
openssl rand -base64 32
```

**⚠️ WARNING:** Changing JWT_SECRET will invalidate all existing user sessions. Users will need to log in again.

### Step 3: Add Environment Variable to Vercel

1. In Vercel dashboard → Settings → Environment Variables
2. Add `JWT_SECRET` with your generated value
3. Select all environments (Production, Preview, Development)
4. Click "Save"

### Step 4: Redeploy

After adding/updating environment variables:

```bash
git add .
git commit -m "Add auth logging and fix production session handling"
git push origin main
```

Or trigger a redeploy in Vercel dashboard.

### Step 5: Check Logs

After deployment:

1. Go to Vercel dashboard → Deployments → [Latest] → Functions
2. Look for logs from `/api/user/pending-generations`
3. Check for these messages:
   - `⚠️ No session token found in cookies` - Cookie not being sent
   - `⚠️ Session expired or not found in database` - Session invalid
   - `❌ Session verification error` - JWT_SECRET mismatch

## Testing

1. Clear your browser cookies for the production site
2. Log in again (this creates a new session with current JWT_SECRET)
3. Navigate to a page that loads images
4. Check browser console for errors
5. Check Vercel function logs for auth errors

## Common Issues

### Issue: "No session token found in cookies"
**Solution:** Check cookie settings in `lib/auth.ts`. Make sure `secure: true` for production and domain matches.

### Issue: "Session verification error"
**Solution:** JWT_SECRET in production doesn't match the one used to create sessions. Update it and have users log in again.

### Issue: Works on localhost but not production
**Solution:** 
- Localhost uses `secure: false` for cookies
- Production uses `secure: true` (requires HTTPS)
- Make sure your production domain uses HTTPS (Vercel does this automatically)

## Quick Test

Run this in your browser console on the production site:

```javascript
// Check if session cookie exists
document.cookie.split(';').find(c => c.trim().startsWith('session='))

// Test API call
fetch('/api/user/pending-generations')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If you see `Unauthorized` error, the session cookie is either missing or invalid.

## Files Modified

- `lib/auth.ts` - Added logging to getSession()
- `app/api/user/pending-generations/route.ts` - Added logging for debugging

## Next Steps

After fixing:
1. Remove debug logging from production (optional)
2. Monitor Vercel logs for any auth errors
3. Consider adding session refresh logic for long-lived sessions
