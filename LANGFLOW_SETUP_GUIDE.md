# Langflow Setup Guide for Ivory's Choice Chatbot

## Quick Start

### Step 1: Install Langflow

Run the setup script:
```bash
./setup-langflow.sh
```

Or manually:
```bash
pip3 install langflow
```

### Step 2: Start Langflow Server

```bash
./start-langflow.sh
```

Or manually:
```bash
langflow run --port 7860
```

The server will start at `http://localhost:7860`

### Step 3: Create Your Chatbot Flow

1. **Open Langflow UI**: Navigate to `http://localhost:7860`

2. **Create New Flow**:
   - Click "New Flow"
   - Choose "Vector Store RAG" template (Retrieval-Augmented Generation)

3. **Configure the Flow**:

   **A. Add File Loader Component**:
   - Drag "File" component to canvas
   - Upload `CUSTOMER_SERVICE_KNOWLEDGE_BASE.md`
   - This contains all the customer service information

   **B. Add Text Splitter**:
   - Drag "Text Splitter" component
   - Connect File output to Text Splitter input
   - Settings:
     - Chunk size: 1000
     - Chunk overlap: 200

   **C. Add Vector Store (Embeddings)**:
   - Drag "OpenAI Embeddings" component
   - Add your OpenAI API key
   - Connect Text Splitter to Embeddings

   **D. Add Vector Database**:
   - Drag "Chroma" or "FAISS" component
   - Connect Embeddings to Vector Store
   - This creates searchable knowledge base

   **E. Add Chat Model**:
   - Drag "ChatOpenAI" component
   - Add your OpenAI API key
   - Model: gpt-4 or gpt-3.5-turbo
   - Temperature: 0.7

   **F. Add Retrieval QA Chain**:
   - Drag "RetrievalQA" component
   - Connect Vector Store to retriever
   - Connect Chat Model to llm
   - This combines retrieval with generation

   **G. Add Chat Input/Output**:
   - Drag "Chat Input" component
   - Drag "Chat Output" component
   - Connect Input → RetrievalQA → Output

4. **Save and Deploy**:
   - Click "Save" (top right)
   - Name it: "Ivory's Choice Support"
   - Click "Deploy"
   - Copy the **Flow ID** (you'll need this)

### Step 4: Update Flow ID in Code

The flow ID is currently set to: `fb51d726-4af1-4101-8b7e-221884191359`

Update it in `components/customer-service-chatbot.tsx`:

```typescript
flow_id: "YOUR_NEW_FLOW_ID_HERE"
```

### Step 5: Enable Chatbot in App

Uncomment the chatbot in these files:

**File: `components/landing-page.tsx`**
```tsx
{/* Customer Service Chatbot */}
<CustomerServiceChatbot position="landing" />
```

**File: `app/home/page.tsx`**
```tsx
{/* Customer Service Chatbot */}
<CustomerServiceChatbot position="app" />
```

### Step 6: Test the Chatbot

1. Make sure Langflow is running on port 7860
2. Start your Next.js app: `npm run dev`
3. Open `http://localhost:3000`
4. Click the chatbot button
5. Ask a question like "How do I cancel my subscription?"

## Simplified Setup (Alternative)

If the above is too complex, use this simpler approach:

### Option 1: Basic Q&A Bot

1. **Create Simple Flow**:
   - Chat Input → ChatOpenAI → Chat Output
   - Add system prompt with knowledge base content

2. **System Prompt**:
```
You are a customer service assistant for Ivory's Choice, an AI-powered nail design platform.

Use this knowledge to answer questions:
[Paste key sections from CUSTOMER_SERVICE_KNOWLEDGE_BASE.md]

Be helpful, friendly, and accurate. If you don't know something, direct users to email support@ivoryschoice.com
```

### Option 2: Use Langflow Cloud

Instead of running locally:

1. Sign up at https://www.langflow.org/
2. Create flow in cloud
3. Get hosted URL
4. Update `host_url` in chatbot component

## Production Deployment

### Deploy Langflow to Production

**Option 1: Deploy with Docker**

```bash
docker run -p 7860:7860 langflowai/langflow:latest
```

**Option 2: Deploy to Cloud**

- **Heroku**: Use Langflow buildpack
- **AWS**: Deploy on EC2 or ECS
- **Google Cloud**: Deploy on Cloud Run
- **Vercel**: Not recommended (needs persistent server)

### Update Production URL

In `components/customer-service-chatbot.tsx`, the production URL is already set:

```typescript
if (window.location.hostname === 'www.ivoryschoice.com' || 
    window.location.hostname === 'ivoryschoice.com') {
  return 'https://www.ivoryschoice.com'
}
```

Make sure Langflow is accessible at this URL in production.

## Environment Variables

Add to `.env.local`:

```bash
# Langflow Configuration
NEXT_PUBLIC_LANGFLOW_URL=http://localhost:7860
NEXT_PUBLIC_LANGFLOW_FLOW_ID=fb51d726-4af1-4101-8b7e-221884191359

# OpenAI API Key (for Langflow)
OPENAI_API_KEY=your_openai_api_key_here
```

## Troubleshooting

### Langflow won't start

```bash
# Check Python version (needs 3.8+)
python3 --version

# Upgrade pip
pip3 install --upgrade pip

# Reinstall Langflow
pip3 uninstall langflow
pip3 install langflow
```

### Chatbot shows white screen

- Make sure Langflow is running on port 7860
- Check browser console for errors
- Verify flow ID is correct
- Check CORS settings in Langflow

### Can't connect to Langflow

- Verify server is running: `curl http://localhost:7860`
- Check firewall settings
- Try different port: `langflow run --port 8080`

### Flow not responding

- Check OpenAI API key is valid
- Verify knowledge base is uploaded
- Test flow in Langflow UI first
- Check Langflow logs for errors

## Knowledge Base Updates

When you update `CUSTOMER_SERVICE_KNOWLEDGE_BASE.md`:

1. Open Langflow UI
2. Go to your flow
3. Update the File component with new file
4. Re-deploy the flow
5. Test with new questions

## Cost Considerations

**Langflow Server**: Free (self-hosted)

**OpenAI API Costs**:
- Embeddings: ~$0.0001 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- GPT-3.5-turbo: ~$0.002 per 1K tokens

**Estimated Monthly Cost** (1000 conversations):
- With GPT-3.5: ~$20-50/month
- With GPT-4: ~$100-200/month

## Support

For Langflow issues:
- Documentation: https://docs.langflow.org/
- GitHub: https://github.com/logspace-ai/langflow
- Discord: https://discord.gg/langflow

For chatbot integration issues:
- Check `CHATBOT_INTEGRATION.md`
- Review browser console errors
- Test Langflow API directly

---

**Status**: Ready to set up
**Last Updated**: January 3, 2026
