"""Strict request contracts for school-authored editorial content."""

from __future__ import annotations

import re
from typing import Any, Literal

from pydantic import ConfigDict, Field, field_validator

from .base import BaseSchema

SchoolContentType = Literal[
    "news",
    "event",
    "story",
    "announcement",
    "calendar_entry",
    "gallery_link",
    "document",
    "download",
]

SERVER_MANAGED_FIELDS = frozenset(
    {
        "school_id",
        "scope_id",
        "scope_type",
        "owner_portal",
        "owner_scope_id",
        "owner_scope_type",
        "status",
        "workflow_status",
        "is_public",
        "is_published",
        "author_user_id",
        "submitted_by_id",
        "submitted_at",
        "reviewed_by_id",
        "reviewed_at",
        "approved_by_id",
        "approved_at",
        "published_by_id",
        "published_at",
        "scheduled_publish_at",
        "archived_at",
    }
)
UNSAFE_RICH_TEXT = re.compile(
    r"<\s*/?\s*(?:script|iframe|object|embed|style)\b"
    r"|\son[a-z]+\s*="
    r"|(?:href|src)\s*=\s*['\"]?\s*(?:(?:javascript|vbscript)\s*:|data\s*:\s*text/html)",
    re.IGNORECASE,
)


class _SchoolContentPayload(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    content_type: SchoolContentType
    data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("data")
    @classmethod
    def reject_server_fields(cls, value: dict[str, Any]) -> dict[str, Any]:
        forbidden = SERVER_MANAGED_FIELDS.intersection(value)
        if forbidden:
            raise ValueError(
                f"Server-managed fields are not accepted: {', '.join(sorted(forbidden))}"
            )
        for field in ("rich_text", "content"):
            candidate = value.get(field)
            if isinstance(candidate, str) and UNSAFE_RICH_TEXT.search(candidate):
                raise ValueError(f"{field} contains unsafe HTML")
        return value


class SchoolContentCreate(_SchoolContentPayload):
    pass


class SchoolContentUpdate(_SchoolContentPayload):
    pass


class SchoolContentImportRow(_SchoolContentPayload):
    client_reference: str = Field(min_length=1, max_length=128)


class SchoolContentAction(BaseSchema):
    comments: str | None = Field(None, max_length=5000)
