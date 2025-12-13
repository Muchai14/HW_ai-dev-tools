# Docker Compose Walkthrough

Purpose
- Explain how to build and run the full stack (Postgres + FastAPI backend + frontend served by nginx) using `docker compose`.

Quick start
1. From the repository root:
   ```bash
   cd 02-coding-interview
   docker compose up --build
   ```
2. After services start:
   - Frontend (nginx) -> http://localhost:3000
   - Backend (uvicorn) -> http://localhost:3001

What the compose file does
- `db` — Postgres 15 with a named volume `db-data`.
- `backend` — built from the root `Dockerfile`; container listens on internal port `3000` and is published as host `3001`.
- `frontend` — builds from `frontend/Dockerfile`, serves the SPA with nginx on container port `80` and publishes host port `3000`.

Important env vars
- `DATABASE_URL` — used by backend to connect to Postgres in compose. (See `docker-compose.yml`.)

Notes on duplicate frontend builds
- The root `Dockerfile` currently performs a frontend build and copies `dist` into the backend image. The `frontend` service also builds the frontend and serves it with nginx. This means the frontend is built twice when running `docker compose up --build`.

Recommended cleanup options
1. Keep as-is (fast to iterate locally). No extra work required.
2. Simplify root `Dockerfile` to only build backend and rely on `frontend` service for the SPA. This speeds rebuilds in compose. I can apply this change on request.

Monitoring and logs
- Tail logs for services:
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f db
  ```

Stopping and cleaning data
- To stop and remove containers:
  ```bash
  docker compose down
  ```
- To remove volumes (data will be lost):
  ```bash
  docker compose down -v
  ```
