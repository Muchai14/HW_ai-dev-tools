import os
import time
import random
from typing import Optional, List

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from . import models
from .schemas import Room, Participant


DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    # default to a local SQLite file in the backend folder
    DATABASE_URL = 'sqlite:///./backend_dev.db'

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith('sqlite') else {})
SessionLocal = sessionmaker(bind=engine)

# ensure mappers registered
models.start_mappers()


def _generate_id() -> str:
    return ''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(6))


def init_db() -> None:
    # create tables
    models.metadata.create_all(bind=engine)


def _room_from_model(row) -> Room:
    # row is an instance of models.RoomModel
    # count participants
    db: Session = SessionLocal()
    try:
        parts = db.query(models.ParticipantModel).filter(models.ParticipantModel.room_id == row.id).count()
    finally:
        db.close()
    return Room(id=row.id, code=row.code, language=row.language, createdAt=row.created_at, participants=parts)


def create_room(language: str = 'javascript') -> Room:
    rid = _generate_id()
    default_code = '# Write your Python code here\nprint("Hello, World!")\n' if language == 'python' else '// Write your JavaScript code here\nconsole.log("Hello, World!");\n'
    created_at = int(time.time() * 1000)
    db: Session = SessionLocal()
    try:
        room = models.RoomModel()
        room.id = rid
        room.code = default_code
        room.language = language
        room.created_at = created_at
        db.add(room)
        # create one anonymous participant
        pid = _generate_id()
        p = models.ParticipantModel()
        p.id = pid
        p.room_id = rid
        p.name = None
        p.joined_at = int(time.time() * 1000)
        db.add(p)
        db.commit()
    finally:
        db.close()

    return Room(id=rid, code=default_code, language=language, createdAt=created_at, participants=1)


def get_room(room_id: str) -> Optional[Room]:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        row = db.query(models.RoomModel).filter(models.RoomModel.id == rid).first()
        if not row:
            return None
        return _room_from_model(row)
    finally:
        db.close()


def join_room(room_id: str) -> Optional[Room]:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        row = db.query(models.RoomModel).filter(models.RoomModel.id == rid).first()
        if not row:
            return None
        # add an anonymous participant
        pid = _generate_id()
        p = models.ParticipantModel()
        p.id = pid
        p.room_id = rid
        p.name = None
        p.joined_at = int(time.time() * 1000)
        db.add(p)
        db.commit()
        return _room_from_model(row)
    finally:
        db.close()


def add_participant(room_id: str, name: Optional[str] = None) -> Optional[dict]:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        row = db.query(models.RoomModel).filter(models.RoomModel.id == rid).first()
        if not row:
            return None
        pid = _generate_id()
        p = models.ParticipantModel()
        p.id = pid
        p.room_id = rid
        p.name = name
        p.joined_at = int(time.time() * 1000)
        db.add(p)
        db.commit()
        return {"id": pid, "name": name, "joinedAt": p.joined_at}
    finally:
        db.close()


def list_participants(room_id: str) -> Optional[List[dict]]:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        row = db.query(models.RoomModel).filter(models.RoomModel.id == rid).first()
        if not row:
            return None
        parts = db.query(models.ParticipantModel).filter(models.ParticipantModel.room_id == rid).all()
        return [{"id": p.id, "name": p.name, "joinedAt": p.joined_at} for p in parts]
    finally:
        db.close()


def remove_participant(room_id: str, participant_id: str) -> bool:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        p = db.query(models.ParticipantModel).filter(models.ParticipantModel.room_id == rid, models.ParticipantModel.id == participant_id).first()
        if not p:
            return False
        db.delete(p)
        db.commit()
        return True
    finally:
        db.close()


def leave_room(room_id: str) -> bool:
    # leave room removes one anonymous participant if present
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        p = db.query(models.ParticipantModel).filter(models.ParticipantModel.room_id == rid).first()
        if p:
            db.delete(p)
            db.commit()
            return True
        return False
    finally:
        db.close()


def update_code(room_id: str, code: str) -> Optional[Room]:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        row = db.query(models.RoomModel).filter(models.RoomModel.id == rid).first()
        if not row:
            return None
        row.code = code
        db.commit()
        return _room_from_model(row)
    finally:
        db.close()


def update_language(room_id: str, language: str) -> Optional[Room]:
    rid = room_id.upper()
    db: Session = SessionLocal()
    try:
        row = db.query(models.RoomModel).filter(models.RoomModel.id == rid).first()
        if not row:
            return None
        row.language = language
        db.commit()
        return _room_from_model(row)
    finally:
        db.close()
