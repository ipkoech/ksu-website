"""Request and response contracts for grounded Library assistant answers."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, Field


class LibraryAssistantPageContext(BaseModel):
    url: str | None = Field(default=None, max_length=1000)
    entity_type: str | None = Field(default=None, max_length=64)
    entity_id: uuid.UUID | None = None
    title: str | None = Field(default=None, max_length=255)


class LibraryAssistantAnswerRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    context_id: uuid.UUID | None = None
    conversation_id: uuid.UUID | None = None
    guest_session_id: str | None = Field(default=None, max_length=128)
    page_context: LibraryAssistantPageContext | None = None


class LibraryAssistantCitation(BaseModel):
    source_type: str
    source_id: uuid.UUID
    title: str
    url: str | None = None
    snippet: str | None = None


class LibraryAssistantAnswerDraft(BaseModel):
    answer: str
    should_escalate: bool = False
    suggested_questions: list[str] = Field(default_factory=list, max_length=5)


class LibraryAssistantAnswer(BaseModel):
    answer: str
    citations: list[LibraryAssistantCitation] = Field(default_factory=list)
    suggested_questions: list[str] = Field(default_factory=list, max_length=5)
    needs_verification: bool = False
    should_escalate: bool = False
    conversation_id: uuid.UUID | None = None
    user_message_id: uuid.UUID | None = None
    assistant_message_id: uuid.UUID | None = None
    provider: str
    metadata: dict[str, Any] = Field(default_factory=dict)
