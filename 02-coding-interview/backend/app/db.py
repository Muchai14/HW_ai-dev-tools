from typing import Dict
from .schemas import Room
import time
import random


_rooms: Dict[str, Room] = {}
# store participants per room: room_id -> {participant_id: {id,name,joinedAt}}
_participants: Dict[str, Dict[str, dict]] = {}


def _generate_room_id() -> str:
    return ''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(6))


def create_room(language: str = 'javascript') -> Room:
    rid = _generate_room_id()
    default_code = '# Write your Python code here\nprint("Hello, World!")\n' if language == 'python' else '// Write your JavaScript code here\nconsole.log("Hello, World!");\n'
    room = Room(id=rid, code=default_code, language=language, createdAt=int(time.time() * 1000), participants=1)
    _rooms[rid] = room
    # initialize participants map with one anonymous participant
    pid = _generate_room_id()
    _participants[rid] = {pid: {"id": pid, "name": None, "joinedAt": int(time.time() * 1000)}}
    return room


def get_room(room_id: str) -> Room | None:
    return _rooms.get(room_id.upper())


def join_room(room_id: str) -> Room | None:
    room = get_room(room_id)
    if room:
        room.participants += 1
    return room


def add_participant(room_id: str, name: str | None = None) -> dict | None:
    room = get_room(room_id)
    if not room:
        return None
    pid = _generate_room_id()
    entry = {"id": pid, "name": name, "joinedAt": int(time.time() * 1000)}
    _participants.setdefault(room.id, {})[pid] = entry
    room.participants += 1
    return entry


def list_participants(room_id: str) -> list[dict] | None:
    room = get_room(room_id)
    if not room:
        return None
    return list(_participants.get(room.id, {}).values())


def remove_participant(room_id: str, participant_id: str) -> bool:
    room = get_room(room_id)
    if not room:
        return False
    parts = _participants.get(room.id, {})
    if participant_id in parts:
        del parts[participant_id]
        room.participants = max(0, room.participants - 1)
        return True
    return False


def leave_room(room_id: str) -> bool:
    room = get_room(room_id)
    if room:
        room.participants = max(0, room.participants - 1)
        return True
    return False


def update_code(room_id: str, code: str) -> Room | None:
    room = get_room(room_id)
    if room:
        room.code = code
        return room
    return None


def update_language(room_id: str, language: str) -> Room | None:
    room = get_room(room_id)
    if room:
        room.language = language
        return room
    return None
