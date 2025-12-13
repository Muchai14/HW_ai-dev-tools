import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Set a temporary SQLite file BEFORE importing the app so DB is configured correctly
DB_FILE = tempfile.mktemp(suffix=".db")
os.environ.setdefault('DATABASE_URL', f"sqlite:///{DB_FILE}")

from app.main import app
from app import db

client = TestClient(app)


def setup_module(module):
    # ensure fresh DB for this integration test
    try:
        db.init_db()
    except Exception:
        # let tests surface errors
        pass


def teardown_module(module):
    try:
        if Path(DB_FILE).exists():
            Path(DB_FILE).unlink()
    except Exception:
        pass


def test_integration_room_lifecycle():
    # create room
    resp = client.post('/rooms', json={})
    assert resp.status_code == 201
    room = resp.json()
    room_id = room['id']

    # get room
    r = client.get(f"/rooms/{room_id}")
    assert r.status_code == 200

    # update code
    patch = client.patch(f"/rooms/{room_id}/code", json={"code": "// updated"})
    assert patch.status_code == 200
    assert patch.json().get('code') == "// updated"

    # join room
    join = client.post(f"/rooms/{room_id}/join")
    assert join.status_code == 200

    # list participants
    parts = client.get(f"/rooms/{room_id}/participants")
    assert parts.status_code == 200
    assert isinstance(parts.json(), list)

    # add participant
    add = client.post(f"/rooms/{room_id}/participants", json={"name": "Alice"})
    assert add.status_code == 201
    pid = add.json().get('id')

    # remove participant
    delete = client.delete(f"/rooms/{room_id}/participants/{pid}")
    assert delete.status_code == 204

    # leave room (removes an anonymous participant)
    leave = client.post(f"/rooms/{room_id}/leave")
    # leave may return 204 or 200 depending on state; assert no 5xx
    assert leave.status_code in (200, 204)
