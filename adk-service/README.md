# 🤖 SAP Doc ADK Scheduling Assistant

A Google ADK-powered scheduling assistant service for medical appointments.

## 🚀 Features

- **Google ADK Integration**: Built using Google's Agent Development Kit
- **Natural Language Processing**: Understands appointment-related queries
- **Real Database Integration**: Connects to PostgreSQL for live appointment data
- **RESTful API**: FastAPI-based service with comprehensive endpoints
- **Containerized**: Ready for Docker deployment

## 🛠️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│  ADK Service    │────│   PostgreSQL    │
│   (React)       │    │   (Python)      │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 ADK Tools

The agent includes these specialized tools:

- `get_available_slots` - Find available appointment times
- `find_nearest_available_slot` - Get next available slot
- `book_appointment_slot` - Book appointments
- `cancel_appointment_by_slot` - Cancel appointments
- `get_appointments_for_date` - View daily schedule
- `get_all_booked_appointments` - List all appointments
- `get_office_info` - Office hours and policies
- `send_appointment_reminder` - Reminder functionality

## 🔧 API Endpoints

### `POST /query`
Process natural language queries:
```json
{
  "message": "What's the nearest available appointment?",
  "conversation_history": []
}
```

### `GET /health`
Health check with database connectivity test

### `GET /config`
Get ADK agent configuration

### `GET /tools`
List all available tools

## 🧪 Sample Interactions

**Finding Appointments:**
```
User: "What's the nearest available appointment?"
Assistant: "Great! I found several available appointment slots..."
```

**Booking Guidance:**
```
User: "Book appointment for John Smith tomorrow at 2 PM"
Assistant: "I'll help you book that appointment. Let me check availability..."
```

## 🚀 Development

### Local Setup
```bash
cd adk-service
pip install -r requirements.txt
python server.py
```

### Docker Setup
```bash
docker-compose up adk-service
```

## 🌐 Environment Variables

- `DB_HOST` - Database host (default: postgres)
- `DB_NAME` - Database name (default: sap_doc_app)
- `DB_USER` - Database user (default: kade)
- `DB_PASSWORD` - Database password
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)

## 📊 Health Monitoring

The service includes comprehensive health checks:
- Database connectivity
- Agent readiness
- API responsiveness

Access health endpoint: `GET http://localhost:8000/health`

## 🔒 Production Considerations

- Add authentication middleware
- Configure CORS for specific origins
- Set up proper logging and monitoring
- Use environment-specific configurations
- Implement rate limiting
