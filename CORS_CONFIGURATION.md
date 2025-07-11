# ADK Service CORS Configuration

This document explains how the CORS (Cross-Origin Resource Sharing) is configured for the SAP Doc App to allow the frontend (running on port 5173) to communicate with the ADK service.

## Architecture

The solution implements a CORS proxy using FastAPI that sits between the frontend and the actual Google ADK API server:

```
Frontend (port 5173) → CORS Proxy (port 8001) → ADK API Server (port 8000)
```

## Components

1. **ADK API Server**: The real Google ADK API server running on port 8000
2. **CORS Proxy**: A FastAPI application running on port 8001 that:
   - Adds CORS headers to responses
   - Forwards all requests to the ADK API server
   - Returns responses from the ADK API server to the frontend

## How It Works

When the frontend makes a request to `http://localhost:8001/run`:

1. The request is received by the CORS proxy
2. The CORS proxy adds the appropriate CORS headers to allow the frontend origin
3. The proxy forwards the request to the ADK API server at `http://localhost:8000/run`
4. The ADK API server processes the request and returns a response
5. The proxy forwards the response back to the frontend with the CORS headers

> **Note:** The real Google ADK API server uses `/run` endpoint instead of the old `/query` endpoint that was used in the simulation server.

## Session Management

The real Google ADK API requires proper session management. Our solution handles this through:

1. **Session Creation**: The frontend first calls `/create-session` endpoint on the proxy
   ```
   POST http://localhost:8001/create-session
   ```

2. **Session Storage**: The proxy creates a session with the ADK API and returns details to the frontend
   ```json
   {
     "success": true,
     "userId": "user-uuid",
     "sessionId": "session-uuid",
     "appName": "sap-doc-app"
   }
   ```

3. **Session Usage**: The frontend stores these details in localStorage and uses them for all future requests
   ```
   POST http://localhost:8001/apps/sap-doc-app/users/{userId}/sessions/{sessionId}/events
   ```

4. **Event Processing**: The proxy converts event requests to the format expected by the ADK API's `/run` endpoint

## Configuration

The CORS proxy is configured to allow requests from:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

If you need to add additional origins, edit the `proxy.py` file and update the `allow_origins` list in the CORS middleware configuration.

## Starting the Services

The `start_adk.sh` script now starts both the ADK API server and the CORS proxy. The ADK API server runs in the background, while the CORS proxy runs in the foreground.

## Docker Configuration

The Docker Compose configuration exposes both ports:

- Port 8000: ADK API Server
- Port 8001: CORS Proxy

The healthcheck now uses the CORS proxy endpoint to check if the service is healthy.

## Troubleshooting

If you encounter CORS issues:

1. Check that both the ADK API server and CORS proxy are running
2. Verify that the frontend is making requests to the correct proxy endpoint (`http://localhost:8001/run`)
3. Check the Docker logs for any errors:
   ```
   docker-compose logs adk-service
   ```
4. If needed, add additional origins to the CORS configuration in `proxy.py`

### Session Errors

If you see "Session not found" errors:

1. Clear your browser's localStorage to remove old session IDs
2. Check that the `/create-session` endpoint is working:
   ```bash
   curl -X POST http://localhost:8001/create-session
   ```
3. Verify that the ADK API server is properly handling sessions by checking logs:
   ```bash
   docker-compose logs adk-service
   ```
