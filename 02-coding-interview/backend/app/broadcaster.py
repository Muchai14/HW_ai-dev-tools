from typing import Dict, Set
from fastapi import WebSocket
import asyncio


class Broadcaster:
    def __init__(self):
        # Map room_id -> set of WebSocket connections
        self.subscribers: Dict[str, Set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def subscribe(self, websocket: WebSocket, room_id: str):
        async with self.lock:
            conns = self.subscribers.setdefault(room_id.upper(), set())
            conns.add(websocket)

    async def unsubscribe(self, websocket: WebSocket, room_id: str | None = None):
        async with self.lock:
            if room_id:
                conns = self.subscribers.get(room_id.upper(), set())
                conns.discard(websocket)
            else:
                for conns in self.subscribers.values():
                    conns.discard(websocket)

    async def broadcast(self, room_id: str, message: dict):
        room_key = room_id.upper()
        async with self.lock:
            conns = set(self.subscribers.get(room_key, set()))

        # send without holding lock
        dead: Set[WebSocket] = set()
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)

        if dead:
            async with self.lock:
                conns = self.subscribers.get(room_key, set())
                for d in dead:
                    conns.discard(d)


broadcaster = Broadcaster()
