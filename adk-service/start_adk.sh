#!/bin/bash

# Copyright 2025 Google LLC
# Licensed under the Apache License, Version 2.0

"""
SAP Doc ADK Service - Real Google ADK Implementation
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

# Set ADK environment variables
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-8000}

echo "📋 Configuration:"
echo "  🌐 Host: $HOST"
echo "  🔌 Port: $PORT"
echo "  🗄️  Database: ${DB_HOST:-localhost}:${DB_PORT:-5432}"
echo "  🤖 Model: gemini-2.0-flash-001"
echo ""

echo "🎯 Starting Google ADK API Server..."
echo "🌍 Available at: http://$HOST:$PORT"
echo ""

# Use the real Google ADK CLI command
exec adk api_server \
    --host="$HOST" \
    --port="$PORT" \
    --log_level="${LOG_LEVEL:-INFO}" \
    .
