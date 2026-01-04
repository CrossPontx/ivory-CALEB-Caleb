# Quick Fix: Chatbot on Production

## The Problem
Chatbot works on localhost but fails on ivoryschoice.com because Langflow is only running on your local machine.

## Quick Fix (5 minutes)

### Step 1: Verify Services Are Running
Both services are currently running:
- ✅ Langflow on port 7862
- ✅ ngrok tunneling to https://lashell-unfeverish-christoper.ngrok-free.dev

### Step 2: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **ivory** project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - Name: `LANGFLOW_URL`
   - Value: `https://lashell-unfeverish-christoper.ngrok-free.dev`
   - Environment: Production

   **Variable 2:**
   - Name: `LANGFLOW_FLOW_ID`
   - Value: `2f70d01a-9791-48b2-980a-03eca7244b46`
   - Environment: Production

5. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~2 minutes)

### Step 4: Test
1. Go to https://www.ivoryschoice.com
2. Click the chatbot button
3. Send a message
4. Should work now! ✅

## Important Notes

⚠️ **Your local machine must stay on** for this to work because:
- Langflow is running on your computer
- ngrok is tunneling from your computer to the internet
- If you turn off your computer, the chatbot will stop working

## Long-Term Solution

For a production-ready setup, deploy Langflow to a cloud service:
- **Railway.app** (easiest, ~$5-10/month)
- **Render.com** (free tier available)
- **Fly.io** (free tier available)

See `CHATBOT_PRODUCTION_SETUP.md` for detailed instructions.

## Troubleshooting

### If chatbot still doesn't work after redeploying:

1. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

2. **Verify ngrok is accessible:**
   ```bash
   curl https://lashell-unfeverish-christoper.ngrok-free.dev/health
   ```

3. **Check if Langflow is running:**
   ```bash
   curl http://localhost:7862/health
   ```

4. **Restart services if needed:**
   ```bash
   # Stop and restart Langflow
   pkill -f langflow
   ./start-langflow.sh
   
   # Restart ngrok (already running correctly)
   # No need to restart unless it stops
   ```

## Current Status

✅ Code updated and pushed to GitHub
✅ Langflow running on port 7862
✅ ngrok tunneling correctly
⏳ **Next:** Add environment variables to Vercel and redeploy

Once you complete Step 2 and Step 3 above, the chatbot will work on production!
