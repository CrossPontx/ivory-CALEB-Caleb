#!/bin/bash

# Start Langflow Server with public access enabled
# This script starts Langflow on port 7861 with auth disabled for public API access

echo "🚀 Starting Langflow server..."
echo ""
echo "Server will be available at: http://localhost:7861"
echo "Press Ctrl+C to stop the server"
echo ""

# Set environment variable to skip auth for public access
export LANGFLOW_SKIP_AUTH_AUTO_LOGIN=true

uvx langflow run --port 7861 --host 0.0.0.0
