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
