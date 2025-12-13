from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal


class Room(BaseModel):
    id: str
    code: str
    language: Literal["javascript", "python"]
    createdAt: int
    participants: int


class Participant(BaseModel):
    id: str
    name: str | None = None
    joinedAt: int


class CreateRoomRequest(BaseModel):
    language: Literal["javascript", "python"] | None = None


class UpdateCodeRequest(BaseModel):
    code: str


class UpdateLanguageRequest(BaseModel):
    language: Literal["javascript", "python"]


class ErrorResponse(BaseModel):
    message: str
