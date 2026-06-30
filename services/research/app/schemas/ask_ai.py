"""Read-only Ask AI advisor schemas for the research admin portal."""

from __future__ import annotations

from pydantic import Field

from .base import BaseSchema


class ResearchAskAIContextRequest(BaseSchema):
    path: str = Field(default="/research", max_length=256)
    section: str | None = Field(default=None, max_length=64)
    resource_key: str | None = Field(default=None, max_length=96)
    record_id: str | None = Field(default=None, max_length=96)


class ResearchAskAIRequest(BaseSchema):
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


class ResearchAskAIResponse(BaseSchema):
    mode: str = "read_only"
    answer: str
    context: ResearchAskAIContext
    references: list[ResearchAskAIReference] = Field(default_factory=list)
    suggested_prompts: list[ResearchAskAIPrompt] = Field(default_factory=list)
