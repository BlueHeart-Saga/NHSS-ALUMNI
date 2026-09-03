#!/bin/bash
# Production startup script for Azure Web App FastAPI Backend (NHSS-ALUMNI-BACKEND)

# Set default port if PORT environment variable is not provided by Azure App Service
PORT=${PORT:-8000}

echo "Starting Gunicorn server for FastAPI backend on port ${PORT}..."

# Start Gunicorn with Uvicorn worker class
exec gunicorn --bind=0.0.0.0:${PORT} \
              --workers=4 \
              --worker-class uvicorn.workers.UvicornWorker \
              --timeout 120 \
              --access-logfile - \
              --error-logfile - \
              app.main:app
