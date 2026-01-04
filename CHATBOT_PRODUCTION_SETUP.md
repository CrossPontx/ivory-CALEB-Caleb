# Chatbot Production Setup Guide

## Problem
The chatbot works on localhost but fails on production (ivoryschoice.com) with a 500 error because Langflow is only running locally.

## Solution Options

### Option 1: Keep ngrok Running (Quick Fix)
**Pros:** Works immediately, no additional setup
**Cons:** Requires your local machine to stay on 24/7, not reliable for production

**Steps:**
1. Keep Langflow running: `./start-langflow.sh`
2. Keep ngrok running: `ngrok http 7862 --authtoken=37nYTnQjWg4jrooBAdBIsjRuLYd_75bSBjEcGQHzHJT4pjfUf`
3. Add environment variables to Vercel:
   ```
   LANGFLOW_URL=https://lashell-unfeverish-christoper.ngrok-free.dev
   LANGFLOW_FLOW_ID=2f70d01a-9791-48b2-980a-03eca7244b46
   ```
4. Redeploy your app on Vercel

**Current Status:**
- ✅ Langflow running on port 7862
- ✅ ngrok tunneling to correct port
- ⚠️ Need to add env vars to Vercel

### Option 2: Deploy Langflow to Cloud (Recommended)
**Pros:** Reliable, scalable, always available
**Cons:** Requires cloud setup and may have costs

#### A. Deploy to Railway.app (Easiest)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from Docker:
   ```dockerfile
   FROM langflowai/langflow:latest
   ENV LANGFLOW_SKIP_AUTH_AUTO_LOGIN=true
   EXPOSE 7860
   CMD ["langflow", "run", "--host", "0.0.0.0", "--port", "7860"]
   ```
4. Get the public URL (e.g., `https://your-app.railway.app`)
5. Update environment variables:
   ```
   LANGFLOW_URL=https://your-app.railway.app
   LANGFLOW_FLOW_ID=2f70d01a-9791-48b2-980a-03eca7244b46
   ```

#### B. Deploy to Render.com
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Use Docker image: `langflowai/langflow:latest`
4. Set environment variable: `LANGFLOW_SKIP_AUTH_AUTO_LOGIN=true`
5. Get the public URL
6. Update environment variables

#### C. Deploy to Fly.io
1. Install flyctl: `brew install flyctl`
2. Login: `fly auth login`
3. Create fly.toml:
   ```toml
   app = "your-langflow-app"
   
   [build]
   image = "langflowai/langflow:latest"
   
   [env]
   LANGFLOW_SKIP_AUTH_AUTO_LOGIN = "true"
   
   [[services]]
   internal_port = 7860
   protocol = "tcp"
   
   [[services.ports]]
   handlers = ["http"]
   port = 80
   
   [[services.ports]]
   handlers = ["tls", "http"]
   port = 443
   ```
4. Deploy: `fly deploy`
5. Get URL: `fly info`

#### D. Deploy to Heroku
1. Install Heroku CLI
2. Create new app: `heroku create your-langflow-app`
3. Set buildpack: `heroku buildpacks:set heroku/python`
4. Create Procfile:
   ```
   web: langflow run --host 0.0.0.0 --port $PORT
   ```
5. Set env var: `heroku config:set LANGFLOW_SKIP_AUTH_AUTO_LOGIN=true`
6. Deploy: `git push heroku main`

## Current Configuration

### Environment Variables
```bash
# Local Development (.env.local)
LANGFLOW_URL=http://localhost:7862
LANGFLOW_FLOW_ID=2f70d01a-9791-48b2-980a-03eca7244b46

# Production (.env or Vercel)
LANGFLOW_URL=https://lashell-unfeverish-christoper.ngrok-free.dev
LANGFLOW_FLOW_ID=2f70d01a-9791-48b2-980a-03eca7244b46
```

### API Route
- Location: `app/api/chatbot/route.ts`
- Automatically uses correct URL based on environment
- Has 30-second timeout for reliability
- Better error handling and logging

## Adding Environment Variables to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (ivory)
3. Go to Settings → Environment Variables
4. Add:
   - `LANGFLOW_URL` = `https://lashell-unfeverish-christoper.ngrok-free.dev`
   - `LANGFLOW_FLOW_ID` = `2f70d01a-9791-48b2-980a-03eca7244b46`
5. Redeploy your app

## Testing

### Local Testing
```bash
# Start Langflow
./start-langflow.sh

# Test API directly
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Production Testing
```bash
# Test API on production
curl -X POST https://www.ivoryschoice.com/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## Troubleshooting

### Error: "Failed to get response"
- Check if Langflow is running: `curl http://localhost:7862`
- Check if ngrok is running: `curl https://lashell-unfeverish-christoper.ngrok-free.dev`
- Check Vercel logs for detailed error messages

### Error: "Request timed out"
- Langflow may be slow to respond
- Check Langflow logs: `tail -f langflow.log`
- Increase timeout in API route if needed

### Error: "Unable to connect"
- ngrok tunnel may be down
- Restart ngrok: `ngrok http 7862 --authtoken=37nYTnQjWg4jrooBAdBIsjRuLYd_75bSBjEcGQHzHJT4pjfUf`
- Check if URL changed (ngrok free tier may change URLs)

## Monitoring

### Check Langflow Status
```bash
# Check if Langflow is running
curl http://localhost:7862/health

# Check ngrok status
curl https://lashell-unfeverish-christoper.ngrok-free.dev/health
```

### View Logs
```bash
# Langflow logs (if running in background)
tail -f langflow.log

# Vercel logs
vercel logs --follow
```

## Recommended Next Steps

1. **Immediate:** Add environment variables to Vercel and redeploy
2. **Short-term:** Keep ngrok running on your local machine
3. **Long-term:** Deploy Langflow to Railway or Render for production reliability

## Cost Considerations

- **ngrok Free:** Free, but requires local machine running
- **Railway:** ~$5-10/month for small instance
- **Render:** Free tier available, $7/month for paid
- **Fly.io:** Free tier available, pay for usage
- **Heroku:** $7/month for basic dyno

## Security Notes

- Langflow is set to skip authentication (`LANGFLOW_SKIP_AUTH_AUTO_LOGIN=true`)
- API route acts as proxy, hiding Langflow URL from client
- Consider adding rate limiting to prevent abuse
- Monitor usage to prevent unexpected costs

## Files Modified

1. `app/api/chatbot/route.ts` - Added environment variable support and better error handling
2. `.env.example` - Added Langflow configuration
3. `.env` - Added production Langflow URL
4. `.env.local` - Added local Langflow URL

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Langflow logs
3. Verify ngrok is running and accessible
4. Test API endpoint directly with curl
