# Railway Langflow Configuration Fix

## Problem
Railway deployed Langflow successfully, but it requires authentication. The chatbot API can't connect without proper configuration.

## Solution: Disable Authentication on Railway

### Step 1: Add Environment Variable to Railway

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Click on your **langflow-production-ed17** project
3. Click on the **Variables** tab
4. Add this environment variable:
   - **Key:** `LANGFLOW_SKIP_AUTH_AUTO_LOGIN`
   - **Value:** `true`
5. Click **Add** or **Save**
6. Railway will automatically redeploy (takes ~2 minutes)

### Step 2: Wait for Redeploy

Watch the **Deployments** tab until it shows "Success" or "Active"

### Step 3: Test the API

Once redeployed, test if it works:

```bash
curl -X POST 'https://langflow-production-ed17.up.railway.app/api/v1/run/2f70d01a-9791-48b2-980a-03eca7244b46?stream=false' \
  -H 'Content-Type: application/json' \
  -d '{"input_value": "Hello", "output_type": "chat", "input_type": "chat"}'
```

You should see a JSON response (not HTML).

### Step 4: Test Your Chatbot

After Railway redeploys:
1. Go to https://www.ivoryschoice.com
2. Click the red message button
3. Type a message
4. Should work! ✅

## Alternative: Use API Key (If Above Doesn't Work)

If disabling auth doesn't work, you can use an API key:

1. Visit https://langflow-production-ed17.up.railway.app
2. Log in (create account if needed)
3. Go to Settings → API Keys
4. Create a new API key
5. Copy the key
6. Add to Vercel environment variables:
   - `LANGFLOW_API_KEY` = your-api-key
7. Update `app/api/chatbot/route.ts` to include the key in headers

## Why This Happened

Railway deployed Langflow with default settings, which includes authentication. We need to disable it for public API access (your Next.js app acts as the security layer).

## Current Status

- ✅ Railway deployment successful
- ✅ Langflow running on Railway
- ⚠️ Authentication blocking API calls
- 🔧 Need to add environment variable

## Next Steps

1. Add `LANGFLOW_SKIP_AUTH_AUTO_LOGIN=true` to Railway
2. Wait for redeploy (~2 minutes)
3. Test chatbot on production
4. Done! 🎉
