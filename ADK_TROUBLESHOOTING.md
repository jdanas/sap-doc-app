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
docker-compose exec adk-service curl -s -X POST http://localhost:8001/run \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "sap-doc-app",
    "userId": "test-user",
    "sessionId": "test-session",
    "newMessage": {
      "role": "user",
      "parts": [{ "text": "What appointments are available?" }]
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

## ADK API Endpoint Format

The real Google ADK API server uses the `/run` endpoint with this format:

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

The response format may vary based on the endpoint and configuration.
