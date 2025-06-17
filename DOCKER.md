# Docker Setup for SAP Doc App

This project includes Docker containerization for both frontend and backend services with PostgreSQL database.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Build and start all services:**

   ```bash
   docker-compose up --build
   ```

2. **Access the applications:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

## Services

### Frontend (React + Vite)

- **Port**: 5173
- **Container**: sap-doc-frontend
- Hot reload enabled for development

### Backend (Express.js)

- **Port**: 3001
- **Container**: sap-doc-backend
- Auto-runs database migrations on startup
- Hot reload enabled with nodemon

### Database (PostgreSQL)

- **Port**: 5432
- **Container**: sap-doc-postgres
- **Database**: sap_doc_app
- **User**: kade
- **Password**: password123
- Data persisted in Docker volume

## Development Commands

```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# View logs
docker-compose logs [service-name]

# Execute commands in containers
docker-compose exec backend npm run migrate
docker-compose exec postgres psql -U kade -d sap_doc_app
```

## Connecting TablePlus to Dockerized Database

When using Docker, connect TablePlus with:

- **Host**: localhost
- **Port**: 5432
- **Database**: sap_doc_app
- **User**: kade
- **Password**: password123

## Environment Variables

The Docker setup uses environment variables defined in the docker-compose.yml file. For production, create a `.env` file with:

```env
DB_PASSWORD=your_secure_password
POSTGRES_PASSWORD=your_secure_password
```

## Production Build

For production, you can modify the Dockerfiles to:

1. Use multi-stage builds
2. Serve frontend with nginx
3. Use production environment variables

## Troubleshooting

- If services fail to start, check logs: `docker-compose logs`
- If database connection fails, ensure PostgreSQL container is healthy
- For permission issues, check Docker volume permissions
- To reset everything: `docker-compose down -v && docker-compose up --build`
