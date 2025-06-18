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

When the frontend makes a request to `http://localhost:8001/query`:

1. The request is received by the CORS proxy
2. The CORS proxy adds the appropriate CORS headers to allow the frontend origin
3. The proxy forwards the request to the ADK API server at `http://localhost:8000/query`
4. The ADK API server processes the request and returns a response
5. The proxy forwards the response back to the frontend with the CORS headers

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
2. Verify that the frontend is making requests to the correct proxy endpoint (`http://localhost:8001/query`)
3. Check the Docker logs for any errors:
   ```
   docker-compose logs adk-service
   ```
4. If needed, add additional origins to the CORS configuration in `proxy.py`
