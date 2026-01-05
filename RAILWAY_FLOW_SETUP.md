# Railway Langflow - Import Your Chatbot Flow

## Problem
Railway Langflow is running but doesn't have your chatbot flow yet. The flow ID `2f70d01a-9791-48b2-980a-03eca7244b46` exists on your local Langflow but not on Railway.

## Solution: Import Flow to Railway

### Option 1: Export from Local, Import to Railway (Recommended)

#### Step 1: Export Flow from Local Langflow
1. Start your local Langflow: `./start-langflow.sh`
2. Open http://localhost:7860 (or 7861)
3. Find your customer service chatbot flow
4. Click the **Export** button (download icon)
5. Save the JSON file (e.g., `customer-service-flow.json`)

#### Step 2: Import to Railway Langflow
1. Open https://langflow-production-ed17.up.railway.app
2. Log in (create account if needed - it's just for you)
3. Click **New Flow** or **Import**
4. Upload the JSON file you exported
5. The flow will be imported with a NEW flow ID

#### Step 3: Get the New Flow ID
1. In Railway Langflow, open your imported flow
2. Click **API** or **Playground** button
3. Look for the flow ID in the URL or API endpoint
4. Copy the new flow ID (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### Step 4: Update Environment Variables
1. Update `.env` locally:
   ```
   LANGFLOW_FLOW_ID=<new-flow-id-from-railway>
   ```
2. Update Vercel environment variables:
   - Go to Vercel dashboard → Settings → Environment Variables
   - Update `LANGFLOW_FLOW_ID` to the new ID
   - Redeploy

### Option 2: Recreate Flow on Railway

If you can't export/import, recreate the flow:

1. Open https://langflow-production-ed17.up.railway.app
2. Create a new flow
3. Add the same components you had locally:
   - Chat Input
   - Your AI model (OpenAI, etc.)
   - Chat Output
4. Configure with same settings
5. Get the flow ID
6. Update environment variables

### Option 3: Use Local Langflow Temporarily

While you set up Railway, you can use local Langflow:

1. Keep local Langflow running: `./start-langflow.sh`
2. Keep ngrok running: `ngrok http 7861`
3. Use ngrok URL in Vercel temporarily
4. Set up Railway flow when ready

## Quick Test: Check if Flow Exists

Test if your flow ID works on Railway:

```bash
curl -X POST 'https://langflow-production-ed17.up.railway.app/api/v1/run/2f70d01a-9791-48b2-980a-03eca7244b46?stream=false' \
  -H 'Content-Type: application/json' \
  -d '{"input_value": "Hello", "output_type": "chat", "input_type": "chat"}'
```

If you get HTML (not JSON), the flow doesn't exist on Railway.

## What Flow ID to Use?

- **Local Langflow:** `2f70d01a-9791-48b2-980a-03eca7244b46`
- **Railway Langflow:** You'll get a NEW ID when you import/create

## Current Status

- ✅ Railway Langflow running
- ✅ Authentication disabled
- ❌ Flow not imported yet
- 🔧 Need to import flow and get new ID

## Next Steps

1. Export flow from local Langflow
2. Import to Railway Langflow
3. Get new flow ID
4. Update `LANGFLOW_FLOW_ID` in Vercel
5. Redeploy
6. Test chatbot

## Alternative: Keep Using ngrok

If Railway setup is too complex right now, you can keep using ngrok:
- It works fine for testing
- Just keep your computer on when customers might use chatbot
- Switch to Railway later when you have time

Let me know which option you prefer!
