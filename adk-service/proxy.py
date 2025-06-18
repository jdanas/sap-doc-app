from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import json
import uvicorn
import uuid

app = FastAPI(title="ADK Service CORS Proxy")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ADK API server host and port
ADK_HOST = os.environ.get("ADK_HOST", "localhost")
ADK_PORT = os.environ.get("ADK_PORT", "8000")
ADK_URL = f"http://{ADK_HOST}:{ADK_PORT}"

# Session cache
user_sessions = {}

# Async HTTP client
client = httpx.AsyncClient(base_url=ADK_URL, timeout=60.0)

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "ADK Service CORS Proxy"}

@app.post("/create-session")
async def create_session():
    """Create a new session with ADK API server"""
    try:
        # Generate stable IDs for the user and session
        user_id = f"user-{uuid.uuid4()}"
        session_id = f"session-{uuid.uuid4()}"
        app_name = "sap-doc-app"
        
        # Create a session with the ADK API server using the specific session ID
        response = await client.post(
            f"/apps/{app_name}/users/{user_id}/sessions/{session_id}",
            json={"state": {}}
        )
        
        if response.status_code == 200:
            # Store the session in our cache
            user_sessions[session_id] = {
                "user_id": user_id,
                "app_name": app_name
            }
            
            return {
                "success": True,
                "userId": user_id,
                "sessionId": session_id,
                "appName": app_name
            }
        else:
            return {
                "success": False,
                "error": f"Failed to create session: {response.status_code} {response.text}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error creating session: {str(e)}"
        }

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(request: Request, path: str):
    """Forward all requests to ADK API server"""
    # Get the request body
    body = await request.body()
    
    # Get query params
    params = dict(request.query_params)
    
    # Get headers (exclude host)
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    
    # Forward the request to the ADK server
    url = f"/{path}"
    method = request.method.lower()
    
    try:
        if method == "get":
            response = await client.get(url, params=params, headers=headers)
        elif method == "post":
            response = await client.post(url, params=params, headers=headers, content=body)
        elif method == "put":
            response = await client.put(url, params=params, headers=headers, content=body)
        elif method == "delete":
            response = await client.delete(url, params=params, headers=headers, content=body)
        else:
            return Response(
                content=json.dumps({"error": "Method not supported"}),
                status_code=405,
                media_type="application/json"
            )
        
        # Return the ADK response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )
    except Exception as e:
        return Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            media_type="application/json"
        )

@app.post("/apps/{app_name}/users/{user_id}/sessions/{session_id}/events")
async def session_events(
    request: Request,
    app_name: str,
    user_id: str,
    session_id: str
):
    """Handle session events and run requests"""
    try:
        # Get the request body
        body_bytes = await request.body()
        body = json.loads(body_bytes.decode())
        
        # Create a run request for the ADK API
        run_request = {
            "appName": app_name,
            "userId": user_id,
            "sessionId": session_id,
            "newMessage": body["content"],
            "streaming": False
        }
        
        # Forward to /run endpoint
        response = await client.post(
            "/run", 
            json=run_request,
            headers={"Content-Type": "application/json"}
        )
        
        # Return the ADK response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type", "application/json")
        )
    except Exception as e:
        return Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            media_type="application/json"
        )

async def check_adk_server():
    """Check if the ADK API server is running."""
    try:
        # Try connecting to the ADK server
        response = await client.get("/")
        print(f"✅ ADK API server is running at {ADK_URL}")
        print(f"   Response: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ ADK API server not available at {ADK_URL}: {e}")
        print("   Is the ADK server starting up? We'll continue anyway and retry connections.")
        return False

if __name__ == "__main__":
    proxy_port = int(os.environ.get("PROXY_PORT", "8001"))
    print(f"🚀 Starting ADK CORS Proxy at http://0.0.0.0:{proxy_port}")
    print(f"⏩ Forwarding to ADK API at {ADK_URL}")
    
    # Start the proxy server
    uvicorn.run(app, host="0.0.0.0", port=proxy_port)
