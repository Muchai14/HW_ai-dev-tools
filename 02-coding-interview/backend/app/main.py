from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from . import db
from .schemas import (
    CreateRoomRequest,
    Room,
    UpdateCodeRequest,
    UpdateLanguageRequest,
    ErrorResponse,
)
from .broadcaster import broadcaster

app = FastAPI(title="Coding Interview Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/rooms", response_model=Room, status_code=201)
async def create_room(payload: CreateRoomRequest | None = None):
    language = payload.language if payload is not None and payload.language else "javascript"
    room = db.create_room(language)
    return room


@app.post("/rooms/{room_id}/join", response_model=Room)
async def join_room(room_id: str):
    room = db.join_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    # broadcast update
    await broadcaster.broadcast(room.id, {"type": "ROOM_UPDATE", "roomId": room.id, "room": room.model_dump()})
    return room


@app.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str):
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@app.patch("/rooms/{room_id}/code", response_model=Room)
async def patch_code(room_id: str, payload: UpdateCodeRequest):
    room = db.update_code(room_id, payload.code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await broadcaster.broadcast(room.id, {"type": "ROOM_UPDATE", "roomId": room.id, "room": room.model_dump()})
    return room


@app.patch("/rooms/{room_id}/language", response_model=Room)
async def patch_language(room_id: str, payload: UpdateLanguageRequest):
    room = db.update_language(room_id, payload.language)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await broadcaster.broadcast(room.id, {"type": "ROOM_UPDATE", "roomId": room.id, "room": room.model_dump()})
    return room


@app.post("/rooms/{room_id}/leave", status_code=204)
async def post_leave(room_id: str):
    ok = db.leave_room(room_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Room not found")
    room = db.get_room(room_id)
    if room:
        await broadcaster.broadcast(room.id, {"type": "ROOM_UPDATE", "roomId": room.id, "room": room.model_dump()})
    return JSONResponse(status_code=204, content=None)


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    subscriptions: set[str] = set()
    try:
        while True:
            data = await websocket.receive_json()
            # Expect messages like {"action": "subscribe", "roomId": "ABC123"}
            action = data.get('action')
            if action == 'subscribe':
                room_id = data.get('roomId')
                if room_id:
                    await broadcaster.subscribe(websocket, room_id)
                    subscriptions.add(room_id.upper())
            elif action == 'unsubscribe':
                room_id = data.get('roomId')
                if room_id:
                    await broadcaster.unsubscribe(websocket, room_id)
                    subscriptions.discard(room_id.upper())
            else:
                # ignore unknown actions
                pass
    except WebSocketDisconnect:
        # cleanup
        await broadcaster.unsubscribe(websocket)
