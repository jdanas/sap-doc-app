# SAP Doc App - Medical Appointment Scheduling System

This repository contains a full-stack medical appointment scheduling application with an AI-powered booking assistant. The system allows patients to view available appointment slots, book appointments, and communicate with an AI scheduling assistant.

![SAP Doc App](https://via.placeholder.com/800x400?text=SAP+Doc+App)

## 🚀 System Architecture

The application consists of three main components:

1. **Frontend**: React-based web interface built with TypeScript, Vite and Tailwind CSS
2. **Backend**: Node.js API server for handling appointments and database operations
3. **AI Agent**: Google ADK-based AI assistant for natural language appointment scheduling

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │◄────►│   Backend   │◄────►│  Database   │
│  (React/TS) │      │  (Node.js)  │      │ (PostgreSQL)│
└──────┬──────┘      └──────┬──────┘      └─────────────┘
       │                    │
       │                    ▼
       │            ┌─────────────┐
       └───────────►│  ADK Agent  │
                    │  (Python)   │
                    └─────────────┘
```

## 🛠️ Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (v16+) and [pnpm](https://pnpm.io/) (for local development)
- [Google API Key](https://console.cloud.google.com/) (for the AI agent)

## 🚀 Quick Start with Docker

The easiest way to run the entire application is using Docker Compose, which sets up all components with a single command.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/sap-doc-app.git
cd sap-doc-app
```

### 2. Configure environment variables

Create environment files for each component:

**For the ADK Agent (./adk-service/.env):**

```bash
cp ./adk-service/.env.example ./adk-service/.env
```

Edit the file to add your Google API key:

```
GOOGLE_API_KEY=your_google_api_key_here
DB_HOST=postgres
DB_NAME=sap_doc_app
DB_USER=postgres
DB_PASSWORD=password123
DB_PORT=5432
```

**For the Backend API (./backend/.env):**

```bash
cp ./backend/.env.example ./backend/.env
```

### 3. Build and run with Docker Compose

```bash
docker-compose up --build
```

This command will:

- Build and start the frontend (accessible at http://localhost:5173)
- Build and start the backend API (accessible at http://localhost:3000)
- Build and start the AI Agent (accessible at http://localhost:8000)
- Set up the PostgreSQL database

### 4. Access the application

Once all services are running, you can access the application at:

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **ADK Agent**: http://localhost:8000

## 📋 Managing the Application

### Stopping the application

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database volumes):

```bash
docker-compose down -v
```

### Viewing logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs sap-doc-adk
```

### Rebuilding after changes

```bash
docker-compose up --build
```

## 🧑‍💻 Local Development Setup

For development, you may want to run components individually:

### Frontend

```bash
cd sap-doc-app
pnpm install
pnpm dev
```

### Backend

```bash
cd backend
pnpm install
pnpm dev
```

### ADK Agent

```bash
cd adk-service
pip install -r requirements.txt
./start_adk.sh
```

## 🔧 Troubleshooting

### CORS Issues

If you encounter CORS errors, check the `CORS_CONFIGURATION.md` file for solutions.

### ADK Agent Connection

If the ADK agent isn't responding:

1. Verify your Google API key is valid
2. Check `ADK_TROUBLESHOOTING.md` for common solutions
3. Ensure the database is properly connected

### Database Issues

The application uses PostgreSQL. If you encounter database issues:

1. Check the connection parameters in `.env` files
2. Ensure PostgreSQL is running (in Docker or locally)
3. Check database logs: `docker-compose logs postgres`

## 📊 System Features

- Interactive appointment calendar
- Real-time slot availability
- AI-powered natural language booking
- User-friendly interface with responsive design
- Secure appointment management

## 📝 License

[MIT License](LICENSE)

## 👥 Contributors

- jdanas - Research Engineer II @ NTU
