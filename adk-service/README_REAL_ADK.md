# 🎯 Real ADK Setup - Simple & Clean

## **Quick Start**

1. **Get Google API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Set Environment Variable**
   ```bash
   export GOOGLE_API_KEY=your-api-key-here
   ```

3. **Start the Service**
   ```bash
   docker-compose up --build adk-service
   ```

4. **Test the Agent**
   ```bash
   curl -X POST http://localhost:8000/query \
     -H "Content-Type: application/json" \
     -d '{"message": "What appointments are available today?"}'
   ```

## **What Changed**

✅ **Removed simulation mode** - Now uses only real Google ADK  
✅ **Simplified Dockerfile** - Direct ADK CLI execution  
✅ **Clean startup process** - No mode switching  
✅ **Better error handling** - Clear API key requirements  

## **Service Architecture**

```
Frontend (React) → ADK Service (Google ADK CLI) → PostgreSQL
     :5173              :8000                       :5432
```

## **Required Environment Variables**

- `GOOGLE_API_KEY` - **Required** Google AI API key
- `DB_HOST` - Database host (default: postgres)
- `DB_PASSWORD` - Database password (default: password123)

## **ADK Commands Available**

```bash
# Test agent locally
cd adk-service && adk run .

# Start API server directly  
cd adk-service && adk api_server --port=8000 .

# Evaluate agent
cd adk-service && adk eval . path/to/eval.json
```

## **API Endpoints**

The real ADK service provides standard endpoints:

- `POST /query` - Chat with the scheduling agent
- `GET /` - Agent information and health
- `GET /agents` - List available agents

## **Frontend Integration**

No changes needed - the frontend will automatically work with real ADK since the API remains the same.

**Before:** Simulated responses  
**After:** Real AI-powered responses from Gemini

The scheduling agent now has full AI capabilities for natural language understanding and intelligent appointment booking!
