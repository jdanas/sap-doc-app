# ADK Service CORS Setup Instructions

Follow these steps to implement the CORS solution for communication between the frontend and ADK service:

## Steps to Apply Changes

1. **Stop existing containers**:

   ```bash
   docker-compose down
   ```

2. **Rebuild the ADK service container**:

   ```bash
   docker-compose build adk-service
   ```

3. **Start all services**:

   ```bash
   docker-compose up -d
   ```

4. **Check if services are running**:

   ```bash
   docker-compose ps
   ```

5. **View logs to ensure everything started correctly**:
   ```bash
   docker-compose logs -f adk-service
   ```

## Verifying the CORS Setup

1. Open your browser and navigate to `http://localhost:5173/adk` to access the ADK Query Page
2. Enter a question in the query box and submit it
3. The request should be sent to `http://localhost:8001/query` (CORS proxy)
4. The proxy forwards the request to the ADK API server and returns the response
5. You should see the response in the UI without any CORS errors

## Troubleshooting

If you still encounter CORS issues:

1. Open your browser's developer tools (F12)
2. Check the Console tab for CORS-related errors
3. Verify that both ports (8000 and 8001) are accessible:
   ```bash
   curl http://localhost:8000/
   curl http://localhost:8001/
   ```
4. Ensure the GOOGLE_API_KEY environment variable is properly set:
   ```bash
   docker-compose exec adk-service bash -c 'echo $GOOGLE_API_KEY'
   ```
5. Review the logs for any errors:
   ```bash
   docker-compose logs adk-service
   ```
6. If needed, restart the service:
   ```bash
   docker-compose restart adk-service
   ```

## Manual Testing (Optional)

You can test the CORS proxy directly from your terminal:

```bash
# Test the CORS proxy health endpoint
curl http://localhost:8001/

# Send a test query to the proxy
curl -X POST http://localhost:8001/query \
  -H "Content-Type: application/json" \
  -d '{"message": "When is the next available appointment?", "conversation_history": []}'
```
