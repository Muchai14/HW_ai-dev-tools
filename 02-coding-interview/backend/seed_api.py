#!/usr/bin/env python3
"""
Seed the running backend with sample rooms and participants.

Usage:
  API_URL=http://localhost:3000 python seed_api.py
"""
import os
import sys
import httpx

API_URL = os.environ.get("API_URL", "http://localhost:3000")

SAMPLE = [
    {"language": "javascript", "participants": ["Alice", "Bob"]},
    {"language": "python", "participants": ["Carol"]},
]


def main():
    created = []
    with httpx.Client(base_url=API_URL, timeout=10.0) as client:
        for spec in SAMPLE:
            print(f"Creating room (language={spec['language']})...")
            r = client.post("/rooms", json={"language": spec["language"]})
            if r.status_code != 201:
                print("Failed to create room:", r.status_code, r.text)
                sys.exit(1)
            room = r.json()
            rid = room["id"]
            print("  -> created room", rid)

            parts = []
            for name in spec.get("participants", []):
                p = client.post(f"/rooms/{rid}/participants", json={"name": name})
                if p.status_code != 201:
                    print("Failed to add participant", name, p.status_code, p.text)
                    sys.exit(1)
                part = p.json()
                parts.append(part)
                print("   - added participant", part["id"], part.get("name"))

            created.append({"room": room, "participants": parts})

    print("\nSeeding complete. Summary:")
    for c in created:
        print(f"Room {c['room']['id']} ({c['room']['language']}) -> participants: {[p.get('name') for p in c['participants']]}")


if __name__ == '__main__':
    main()
