#!/bin/bash

# Start Langflow Server
# This script starts Langflow on port 7860

echo "🚀 Starting Langflow server..."
echo ""
echo "Server will be available at: http://localhost:7860"
echo "Press Ctrl+C to stop the server"
echo ""

langflow run --port 7860 --host 0.0.0.0
