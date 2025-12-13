# Multi-stage Dockerfile
# Stage 1: build frontend assets using Node
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

# Copy frontend sources and install deps
COPY frontend/package*.json ./
COPY frontend/ ./
RUN npm ci --silent

# Build frontend
RUN npm run build

# Stage 2: runtime image with Python for the FastAPI backend
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install system dependencies required to run Python/uvicorn
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./backend/

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend build output into backend static directory
COPY --from=frontend-build /app/frontend/dist ./backend/app/static

# Create an unprivileged user and switch to it
RUN useradd -m appuser || true
USER appuser

WORKDIR /app/backend
EXPOSE 3000

# Start the FastAPI app (serves static files from ./app/static)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
