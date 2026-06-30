"""Read-only Ask AI advisor schemas for the research admin portal."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from .base import BaseSchema


class ResearchAskAIContextRequest(BaseSchema):
    path: str = Field(default="/research", max_length=256)
    section: str | None = Field(default=None, max_length=64)
    resource_key: str | None = Field(default=None, max_length=96)
    record_id: str | None = Field(default=None, max_length=96)


class ResearchAskAIRequest(BaseSchema):
    conversation_id: UUID | None = None
    message: str = Field(min_length=1, max_length=2000)
    context: ResearchAskAIContextRequest = Field(default_factory=ResearchAskAIContextRequest)


class ResearchAskAIPrompt(BaseSchema):
    id: str
    label: str
    text: str
    intent: str


class ResearchAskAIReference(BaseSchema):
    label: str
    type: str
    href: str
    resource_key: str | None = None


class ResearchAskAIContext(BaseSchema):
    section_key: str
    section_label: str
    path: str
    resource_key: str | None = None
    record_id: str | None = None
    capabilities: list[str] = Field(default_factory=list)
    guided_prompts: list[ResearchAskAIPrompt] = Field(default_factory=list)
    references: list[ResearchAskAIReference] = Field(default_factory=list)


class ResearchAIConversationRead(BaseSchema):
    id: UUID
    title: str
    section_key: str | None = None
    resource_key: str | None = None
    record_id: str | None = None
    context: dict | None = None
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime


class ResearchAIMessageRead(BaseSchema):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    content_format: str = "markdown"
    context_snapshot: dict | None = None
    references: list[dict] | None = None
    metadata: dict | None = None
    created_at: datetime


class ResearchAskAIResponse(BaseSchema):
    mode: str = "read_only"
    conversation_id: UUID | None = None
    user_message_id: UUID | None = None
    assistant_message_id: UUID | None = None
    answer: str
    content_format: str = "markdown"
    context: ResearchAskAIContext
    service_exposure: dict = Field(default_factory=dict)
    references: list[ResearchAskAIReference] = Field(default_factory=list)
    suggested_prompts: list[ResearchAskAIPrompt] = Field(default_factory=list)
