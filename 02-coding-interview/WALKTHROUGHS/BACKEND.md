# Backend Walkthrough

Purpose
- Explain how to run, test, and troubleshoot the FastAPI backend used in this repository.

Run locally (development)
1. Create a virtualenv and install deps:
   ```bash
   cd 02-coding-interview/backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start the app (dev):
   ```bash
   # run uvicorn directly
   PYTHONPATH=$(pwd) uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
   ```

Run with Docker (compose)
- In the compose setup the `backend` service is built from the repo `Dockerfile` and runs `uvicorn` on port `3000` inside the container and is published as host port `3001`.

Database configuration
- The backend uses SQLAlchemy and reads `DATABASE_URL` environment variable. Example connection strings:
  - Postgres (compose): `postgresql+psycopg2://postgres:postgres@db:5432/coding_interview`
  - SQLite (local dev fallback): `sqlite:///./backend_dev.db`
- We call `db.init_db()` at app startup to create tables if they do not exist.

Tests
1. Install test deps (requirements already include pytest/httpx). Run tests from the `backend` directory:
   ```bash
   PYTHONPATH=$(pwd) pytest -q
   ```

Verification
- A `backend/verify_api.py` script exists to perform HTTP + WebSocket checks; you can run it against a running stack for quick validation.

Files of interest
- `app/main.py` — FastAPI routes and startup handler.
- `app/db.py` — SQLAlchemy session + CRUD helpers.
- `app/models.py` — SQLAlchemy models and mappers.
- `app/schemas.py` — Pydantic models used by endpoints.

Troubleshooting
- If endpoints fail with "no such table", ensure `DATABASE_URL` points to a reachable DB and confirm `db.init_db()` runs on startup; if running tests, set `PYTHONPATH=$(pwd)`.
- For DB connection errors in Docker, check `docker compose logs backend` and `docker compose logs db`.
