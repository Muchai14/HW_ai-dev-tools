PYTHONPATH=/workspaces/HW_ai-dev-tools/02-coding-interview/backend python -m pytest -q /workspaces/HW_ai-dev-tools/02-coding-interview/backend/tests# Backend (FastAPI) for Coding Interview

This folder contains a minimal FastAPI server that implements the OpenAPI spec at `../openapi.yaml`.

Run locally (with `uv` from `AGENTS.md` or pip):

````markdown
PYTHONPATH=/workspaces/HW_ai-dev-tools/02-coding-interview/backend python -m pytest -q /workspaces/HW_ai-dev-tools/02-coding-interview/backend/tests

# Backend (FastAPI) for Coding Interview

This folder contains a minimal FastAPI server that implements the OpenAPI spec at `../openapi.yaml`.

Run locally (with `uv` from `AGENTS.md` or pip):

```bash
# Using uv (if configured in your environment):
cd 02-coding-interview/backend
uv sync
uv add fastapi uvicorn pydantic
uv run python -m uvicorn app.main:app --reload --port 3000

# Or using pip directly in a venv:
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

Notes:
- The implementation uses an in-memory mock database (`app/db.py`). Replace with a real database later.
- WebSocket endpoint `/ws` supports simple JSON subscribe messages:
  - `{ "action": "subscribe", "roomId": "ABC123" }`
  - Server will push `{ "type": "ROOM_UPDATE", "roomId": "ABC123", "room": { ... } }` messages when room state changes.

````

## Build & Run (Docker)

Build the multi-stage image (frontend is built and copied into the backend static directory):

```bash
cd /workspaces/HW_ai-dev-tools/02-coding-interview
docker build -t coding-interview-app .
```

Run the container and map port 3000:

```bash
docker run --rm -p 3000:3000 coding-interview-app
```

Verify:

- Open `http://localhost:3000/docs` to see the FastAPI docs.
- Open `http://localhost:3000/` to load the frontend (served as static files by the backend).

## Local Development (without Docker)

Backend only:

```bash
cd /workspaces/HW_ai-dev-tools/02-coding-interview/backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

Frontend only:

```bash
cd /workspaces/HW_ai-dev-tools/02-coding-interview/frontend
npm install
npm run dev
# Open the URL Vite reports (e.g. http://localhost:8080)
```

Run both concurrently (from repo root):

```bash
cd /workspaces/HW_ai-dev-tools/02-coding-interview
npm run dev
```

Notes:
- The Docker image's runtime stage uses `python:3.11-slim`; the frontend build stage uses `node:20-slim`.
- Static frontend assets are copied to `backend/app/static` during image build so the FastAPI app can serve them.
