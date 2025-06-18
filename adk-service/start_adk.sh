#!/bin/bash

# Copyright 2025 Google LLC
# Licensed under the Apache License, Version 2.0

"""
SAP Doc ADK Service - Real Google ADK Implementation with CORS Proxy
"""

echo "🚀 Starting SAP Doc ADK Service with Google ADK CLI..."

# Check if GOOGLE_API_KEY is set
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Error: GOOGLE_API_KEY environment variable is required"
    echo ""
    echo "To get your API key:"
    echo "1. Go to https://aistudio.google.com/app/apikey"
    echo "2. Create a new API key"
    echo "3. Set it with: export GOOGLE_API_KEY='your-api-key-here'"
    echo ""
    exit 1
fi

# Set environment variables
export ADK_HOST=${ADK_HOST:-"localhost"}
export ADK_PORT=${ADK_PORT:-8000}
export PROXY_PORT=${PROXY_PORT:-8001}

echo "📋 Configuration:"
echo "  🌐 ADK Host: $ADK_HOST"
echo "  🔌 ADK Port: $ADK_PORT"
echo "  � CORS Proxy Port: $PROXY_PORT"
echo "  �🗄️  Database: ${DB_HOST:-localhost}:${DB_PORT:-5432}"
echo "  🤖 Model: gemini-2.0-flash-001"
echo ""

echo "🎯 Starting Google ADK API Server in the background..."
adk api_server \
    --host="$ADK_HOST" \
    --port="$ADK_PORT" \
    --log_level="${LOG_LEVEL:-INFO}" \
    . &

# Save the process ID so we can terminate it properly
ADK_PID=$!

# Setup exit handler to kill ADK server when script ends
trap "kill $ADK_PID; exit" TERM INT

# Wait for ADK to start
echo "⏳ Waiting for ADK API server to start (10 seconds)..."
sleep 10

echo "🔄 Starting CORS Proxy for frontend access..."
echo "🌍 Proxy available at: http://0.0.0.0:$PROXY_PORT"
echo ""

# Start the CORS proxy
python proxy.py

# This will only run if python proxy.py exits
kill $ADK_PID
exit
