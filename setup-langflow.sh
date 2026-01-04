#!/bin/bash

# Langflow Setup Script for Ivory's Choice Customer Service Chatbot
# This script installs and configures Langflow

echo "🚀 Setting up Langflow for Ivory's Choice..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

echo "✅ pip3 found"
echo ""

# Install Langflow
echo "📦 Installing Langflow..."
pip3 install langflow

if [ $? -eq 0 ]; then
    echo "✅ Langflow installed successfully!"
else
    echo "❌ Failed to install Langflow"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./start-langflow.sh"
echo "2. Open http://localhost:7860 in your browser"
echo "3. Create a new flow with Vector Store RAG"
echo "4. Upload CUSTOMER_SERVICE_KNOWLEDGE_BASE.md"
echo "5. Copy the flow ID and update it in the chatbot component"
echo ""
