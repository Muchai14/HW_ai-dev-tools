#!/usr/bin/env python3
"""
Lightweight verification script for the running Coding Interview backend.

Usage:
  python verify_api.py

Environment:
  API_URL - optional base URL (default: http://localhost:3000)

This script exercises the REST endpoints and the WebSocket `/ws` endpoint.
It exits with code 0 on success, or non-zero on failure.
"""
import asyncio
import json
import os
import sys

import httpx
import websockets


API_URL = os.environ.get("API_URL", "http://localhost:3000")
WS_URL = API_URL.replace("http://", "ws://").replace("https://", "wss://")


async def test_rest(base: str):
    async with httpx.AsyncClient(base_url=base, timeout=10.0) as client:
        # Create room
        r = await client.post("/rooms", json={})
        r.raise_for_status()
        room = r.json()
        rid = room["id"]
        print(f"Created room {rid}")

        # Get room
        r = await client.get(f"/rooms/{rid}")
        r.raise_for_status()

        # Join
        r = await client.post(f"/rooms/{rid}/join")
        r.raise_for_status()

        # Update language
        r = await client.patch(f"/rooms/{rid}/language", json={"language": "python"})
        r.raise_for_status()
        assert r.json()["language"] == "python"

    return rid


async def test_websocket(base: str, ws_base: str, room_id: str):
    uri = ws_base + "/ws"
    print(f"Connecting to WebSocket at {uri}")

    async with websockets.connect(uri) as ws:
        # subscribe
        await ws.send(json.dumps({"action": "subscribe", "roomId": room_id}))
        print(f"Subscribed to room {room_id}")

        # trigger an update using httpx
        new_code = 'console.log("verify_api")'
        async with httpx.AsyncClient(base_url=base, timeout=10.0) as client:
            r = await client.patch(f"/rooms/{room_id}/code", json={"code": new_code})
            r.raise_for_status()

        # await message
        msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
        data = json.loads(msg)
        if data.get("type") != "ROOM_UPDATE":
            raise RuntimeError("Unexpected websocket message type: %r" % data)
        if data.get("roomId") != room_id:
            raise RuntimeError("Websocket ROOM_UPDATE for different room: %r" % data)
        if data.get("room", {}).get("code") != new_code:
            raise RuntimeError("ROOM_UPDATE did not contain new code")

        print("WebSocket ROOM_UPDATE received and validated.")


async def main():
    try:
        print(f"Verifying REST endpoints against {API_URL}")
        rid = await test_rest(API_URL)
        print("REST checks passed; now testing WebSocket broadcasts")
        await test_websocket(API_URL, WS_URL, rid)
    except Exception as e:
        print("Verification failed:", str(e), file=sys.stderr)
        raise


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception:
        sys.exit(2)
    print("All checks passed")
    sys.exit(0)
