"""Read-only Ask AI advisor schemas for the research admin portal."""

from __future__ import annotations

from datetime import datetime
from typing import NotRequired
from uuid import UUID

from ksu_common.schemas.responses import SuccessResponse
from pydantic import Field
from typing_extensions import TypedDict

from .base import JsonScalar, StrictSchema


class ResearchAskAIContextRequest(StrictSchema):
    path: str = Field(default="/research", max_length=256)
    section: str | None = Field(default=None, max_length=64)
    resource_key: str | None = Field(default=None, max_length=96)
    record_id: str | None = Field(default=None, max_length=96)


class ResearchAskAIReference(StrictSchema):
    label: str
    type: str
    href: str
    resource_key: str | None = None


class ResearchAskAIRequest(StrictSchema):
    conversation_id: UUID | None = None
    message: str = Field(min_length=1, max_length=2000)
    context: ResearchAskAIContextRequest = Field(default_factory=ResearchAskAIContextRequest)
    scope: str = Field(default="page", max_length=24)
    intent_mode: str = Field(default="summarize", max_length=32)
    references: list[ResearchAskAIReference] = Field(default_factory=list)


class ResearchAskAIPrompt(StrictSchema):
    id: str
    label: str
    text: str
    intent: str


class ResearchAskAIContext(StrictSchema):
    section_key: str
    section_label: str
    path: str
    resource_key: str | None = None
    record_id: str | None = None
    scope: str = "page"
    intent_mode: str = "summarize"
    capabilities: list[str] = Field(default_factory=list)
    guided_prompts: list[ResearchAskAIPrompt] = Field(default_factory=list)
    references: list[ResearchAskAIReference] = Field(default_factory=list)


class ResearchAskAIMessageMetadata(StrictSchema):
    mode: str
    provider: str | None = None
    service_exposure_keys: list[str] = Field(default_factory=list)


class ResearchAskAIServiceExposureResource(TypedDict):
    key: str
    label: str
    route: str
    search_fields: list[str]
    metadata_fields: list[str]
    exportable: bool


class ResearchAskAIServiceExposureExport(TypedDict):
    key: str
    label: str
    columns: list[str]
    filename: str


class ResearchAskAIServiceExposureSection(TypedDict):
    key: str
    label: str
    href: str
    resource_key: str | None
    focus: str


class ResearchAskAIServiceExposureStat(TypedDict):
    key: str
    label: str
    value: int | float
    suffix: str
    description: str
    href: str | None


class ResearchAskAIRecordSampleGroup(TypedDict):
    key: str
    label: str
    href: str
    columns: list[str]
    records: list[dict[str, JsonScalar]]


class ResearchAskAIServiceExposure(TypedDict, total=False):
    mode: str
    resources: list[ResearchAskAIServiceExposureResource]
    exports: list[ResearchAskAIServiceExposureExport]
    sections: NotRequired[list[ResearchAskAIServiceExposureSection]]
    admin_stats: NotRequired[list[ResearchAskAIServiceExposureStat]]
    record_samples: NotRequired[list[ResearchAskAIRecordSampleGroup]]


class ResearchAIConversationRead(StrictSchema):
    id: UUID
    title: str
    section_key: str | None = None
    resource_key: str | None = None
    record_id: str | None = None
    context: ResearchAskAIContext | None = None
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime


class ResearchAIMessageRead(StrictSchema):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    content_format: str = "markdown"
    context_snapshot: ResearchAskAIContext | None = None
    references: list[ResearchAskAIReference] | None = None
    metadata: ResearchAskAIMessageMetadata | None = None
    created_at: datetime


class ResearchAskAIResponse(StrictSchema):
    mode: str = "read_only"
    conversation_id: UUID | None = None
    user_message_id: UUID | None = None
    assistant_message_id: UUID | None = None
    answer: str
    content_format: str = "markdown"
    context: ResearchAskAIContext
    service_exposure: ResearchAskAIServiceExposure = Field(
        default_factory=lambda: {
            "mode": "read_only",
            "resources": [],
            "exports": [],
            "sections": [],
            "admin_stats": [],
            "record_samples": [],
        }
    )
    references: list[ResearchAskAIReference] = Field(default_factory=list)
    suggested_prompts: list[ResearchAskAIPrompt] = Field(default_factory=list)


class ResearchAskAISuccessResponse(SuccessResponse[ResearchAskAIResponse]):
    """Concrete success envelope for Ask AI responses."""


class ResearchAskAIConversationListResponse(SuccessResponse[list[ResearchAIConversationRead]]):
    """Concrete success envelope for Ask AI conversation lists."""


class ResearchAskAIMessageListResponse(SuccessResponse[list[ResearchAIMessageRead]]):
    """Concrete success envelope for Ask AI message lists."""
