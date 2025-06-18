# ADK Service Troubleshooting Guide

This document provides steps to troubleshoot common issues with the ADK service.

## 404 Not Found Error

If you're getting a 404 Not Found error when trying to access `http://localhost:8001/run`:

### 1. Check if both services are running

```bash
# Check if the ADK API server is running
docker-compose logs adk-service | grep "Starting Google ADK API Server"

# Check if the CORS proxy is running
docker-compose logs adk-service | grep "Starting ADK CORS Proxy"
```

### 2. Ensure the ADK API server is fully started

The ADK API server can take a few moments to initialize. If the proxy is starting before the ADK server is ready, you might get 404 errors.

```bash
# Increase the wait time in start_adk.sh if needed
docker-compose exec adk-service sed -i 's/sleep 10/sleep 20/' start_adk.sh

# Then restart the service
docker-compose restart adk-service
```

### 3. Check the Google API Key

Make sure your GOOGLE_API_KEY is properly set and valid:

```bash
docker-compose exec adk-service bash -c 'echo $GOOGLE_API_KEY'
```

### 4. Test the endpoints directly

```bash
# Test the ADK API server directly (might not work due to startup timing)
docker-compose exec adk-service curl -s http://localhost:8000/

# Test the CORS proxy
docker-compose exec adk-service curl -s http://localhost:8001/
```

### 5. Try a manual test request

```bash
# First create a session
docker-compose exec adk-service curl -s -X POST http://localhost:8001/create-session

# This will return something like:
# {
#   "success": true,
#   "userId": "user-abc123", 
#   "sessionId": "session-xyz456",
#   "appName": "sap-doc-app"
# }

# Now use those values to make a query
docker-compose exec adk-service curl -s -X POST \
  "http://localhost:8001/apps/sap-doc-app/users/user-abc123/sessions/session-xyz456/events" \
  -H "Content-Type: application/json" \
  -d '{
    "author": "user",
    "content": {
      "role": "user",
      "parts": [{"text": "What appointments are available?"}]
    }
  }'
```

### 6. Check CORS Settings

```bash
# Test a preflight request
curl -v -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:8001/run
```

### 7. Rebuild the Services

If all else fails, try rebuilding the services:

```bash
# Stop all services
docker-compose down

# Remove any orphaned volumes
docker volume prune -f

# Rebuild the services
docker-compose build adk-service

# Start again
docker-compose up -d

# Check logs
docker-compose logs -f adk-service
```

## "Session not found" Error

If you're seeing a "Session not found" error when trying to use the ADK service:

### 1. Clear Browser LocalStorage

This will force the frontend to create a new session:

1. Open browser DevTools (F12 or right-click and select "Inspect")
2. Go to the "Application" tab
3. Select "Local Storage" from the left sidebar
4. Right-click and select "Clear"
5. Refresh the page

### 2. Verify Session Creation

Check if the session creation endpoint is working:

```bash
docker-compose exec adk-service curl -s -X POST http://localhost:8001/create-session
```

This should return success with userId, sessionId, and appName.

### 3. Check Session Existence

You can check if a session exists in the ADK API server:

```bash
# Replace with your actual user ID and session ID
USER_ID="user-abc123"
SESSION_ID="session-xyz456"

docker-compose exec adk-service curl -s \
  "http://localhost:8000/apps/sap-doc-app/users/$USER_ID/sessions/$SESSION_ID"
```

### 4. Recreate the Session Manually

Try creating a session directly with the ADK API server:

```bash
docker-compose exec adk-service curl -s -X POST \
  "http://localhost:8000/apps/sap-doc-app/users/user-test/sessions/session-test" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 5. Check ADK API Server Logs

Look for any errors related to session management:

```bash
docker-compose logs adk-service | grep -i "session"
```

## Improving Your ADK Experience

### Conversion Between API Formats

The ADK REST API uses a different format than our original simulation. Our proxy handles this conversion:

1. Original simulation used:
   ```json
   {
     "message": "What appointments are available?",
     "conversation_history": []
   }
   ```

2. Real ADK API uses:
   ```json
   {
     "appName": "sap-doc-app",
     "userId": "user-id",
     "sessionId": "session-id",
     "newMessage": {
       "role": "user",
       "parts": [{ "text": "Your question here" }]
     }
   }
   ```

The proxy handles this conversion automatically.
