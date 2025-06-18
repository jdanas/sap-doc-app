from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import json
import uvicorn

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

# Async HTTP client
client = httpx.AsyncClient(base_url=ADK_URL, timeout=60.0)

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "ADK Service CORS Proxy"}

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
