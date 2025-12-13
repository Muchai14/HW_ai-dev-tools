from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from . import db
from .schemas import (
    CreateRoomRequest,
    Room,
    UpdateCodeRequest,
    UpdateLanguageRequest,
    ErrorResponse,
    Participant,
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

# Serve SPA static files if present in app/static
try:
    app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
except Exception:
    # ignore if StaticFiles cannot be mounted in some test environments
    pass


@app.on_event("startup")
async def startup_event():
    # ensure database tables exist when the app starts (tests rely on this)
    try:
        db.init_db()
    except Exception:
        # avoid crashing startup in case of DB issues; tests will show errors
        pass


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


@app.post("/rooms/{room_id}/participants", status_code=201)
async def create_participant(room_id: str, payload: dict | None = None):
    # payload may contain {"name": "Alice"}
    name = payload.get("name") if payload else None
    part = db.add_participant(room_id, name)
    if not part:
        raise HTTPException(status_code=404, detail="Room not found")
    # broadcast updated room state as well
    room = db.get_room(room_id)
    if room:
        await broadcaster.broadcast(room.id, {"type": "ROOM_UPDATE", "roomId": room.id, "room": room.model_dump()})
    return part


@app.get("/rooms/{room_id}/participants")
async def get_participants(room_id: str):
    parts = db.list_participants(room_id)
    if parts is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return parts


@app.delete("/rooms/{room_id}/participants/{participant_id}", status_code=204)
async def delete_participant(room_id: str, participant_id: str):
    ok = db.remove_participant(room_id, participant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Participant or room not found")
    room = db.get_room(room_id)
    if room:
        await broadcaster.broadcast(room.id, {"type": "ROOM_UPDATE", "roomId": room.id, "room": room.model_dump()})
    return JSONResponse(status_code=204, content=None)


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
                    # send current room state immediately to the new subscriber
                    try:
                        current_room = db.get_room(room_id)
                        if current_room:
                            await websocket.send_json({"type": "ROOM_UPDATE", "roomId": current_room.id, "room": current_room.model_dump()})
                    except Exception:
                        # don't let a single failure break the websocket loop
                        pass
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


@app.get("/")
async def read_index():
    # Fallback root route: serve index.html from static folder when available
    try:
        return FileResponse("app/static/index.html")
    except Exception:
        raise HTTPException(status_code=404, detail="Index not found")
