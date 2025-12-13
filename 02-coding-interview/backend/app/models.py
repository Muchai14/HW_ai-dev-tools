from __future__ import annotations
from sqlalchemy import Table, Column, String, Integer, Text, ForeignKey, MetaData
from sqlalchemy.orm import registry, relationship

mapper_registry = registry()
metadata = mapper_registry.metadata


class RoomModel:
    __tablename__ = 'rooms'
    id = Column(String(32), primary_key=True)
    code = Column(Text, nullable=False)
    language = Column(String(16), nullable=False)
    created_at = Column(Integer, nullable=False)


class ParticipantModel:
    __tablename__ = 'participants'
    id = Column(String(32), primary_key=True)
    room_id = Column(String(32), ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(128), nullable=True)
    joined_at = Column(Integer, nullable=False)


def start_mappers():
    # Register mappings if not already done
    try:
        mapper_registry.map_imperatively(RoomModel, Table(
            RoomModel.__tablename__, metadata,
            Column('id', String(32), primary_key=True),
            Column('code', Text, nullable=False),
            Column('language', String(16), nullable=False),
            Column('created_at', Integer, nullable=False),
        ))
        mapper_registry.map_imperatively(ParticipantModel, Table(
            ParticipantModel.__tablename__, metadata,
            Column('id', String(32), primary_key=True),
            Column('room_id', String(32), ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False),
            Column('name', String(128), nullable=True),
            Column('joined_at', Integer, nullable=False),
        ))
    except Exception:
        # mapping may already exist
        pass
