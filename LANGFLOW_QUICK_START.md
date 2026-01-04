# Langflow Quick Start - 5 Minutes

## Install & Run (Terminal 1)

```bash
# Install Langflow
pip3 install langflow

# Start server
langflow run --port 7860
```

Server will be at: **http://localhost:7860**

## Create Flow (Browser)

1. Open http://localhost:7860
2. Click "New Flow"
3. Choose "Vector Store RAG" template
4. Upload `CUSTOMER_SERVICE_KNOWLEDGE_BASE.md`
5. Click "Deploy"
6. Copy the Flow ID

## Update Code

Edit `components/customer-service-chatbot.tsx`:

```typescript
flow_id: "YOUR_FLOW_ID_HERE"  // Line 122 and 207
```

## Test (Terminal 2)

```bash
# Start Next.js app
npm run dev
```

Open http://localhost:3000 and click the chatbot button!

## Done! 🎉

The chatbot is now:
- ✅ Enabled on landing page
- ✅ Enabled on home screen  
- ✅ Connected to Langflow
- ✅ Using your knowledge base

---

**Need help?** See `LANGFLOW_SETUP_GUIDE.md` for detailed instructions.
