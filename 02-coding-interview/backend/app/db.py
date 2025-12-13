from typing import Dict
from .schemas import Room
import time
import random


_rooms: Dict[str, Room] = {}


def _generate_room_id() -> str:
    return ''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(6))


def create_room(language: str = 'javascript') -> Room:
    rid = _generate_room_id()
    default_code = '# Write your Python code here\nprint("Hello, World!")\n' if language == 'python' else '// Write your JavaScript code here\nconsole.log("Hello, World!");\n'
    room = Room(id=rid, code=default_code, language=language, createdAt=int(time.time() * 1000), participants=1)
    _rooms[rid] = room
    return room


def get_room(room_id: str) -> Room | None:
    return _rooms.get(room_id.upper())


def join_room(room_id: str) -> Room | None:
    room = get_room(room_id)
    if room:
        room.participants += 1
    return room


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
