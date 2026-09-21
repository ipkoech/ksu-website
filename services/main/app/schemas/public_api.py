"""Bounded response models for aggregated public API payloads."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import Field

from .base import BaseSchema, optional_snapshot
from .public_page import PublicSitePageRead


class NavigationItem(BaseSchema):
    id: uuid.UUID | None = None
    name: str | None = None
    slug: str | None = None
    code: str | None = None
    division_type: str | None = None
    department_type: str | None = None


class NavigationPayload(BaseSchema):
    schools: list[NavigationItem]
    divisions: list[NavigationItem]
    departments: list[NavigationItem]
    clubs: list[NavigationItem]
    wings: list[NavigationItem]


class PublicEntityContentPayload(BaseSchema):
    entity: dict[str, Any]
    content_type: str
    records: list[dict[str, Any]]
    meta: dict[str, Any]


class PublicTeamPayload(BaseSchema):
    entity: dict[str, Any]
    assignments: list[dict[str, Any]]
    persons: dict[str, dict[str, Any]]
    groups: list[dict[str, Any]]
    hierarchy: list[dict[str, Any]]
    counts: dict[str, int]


class PublicAcademicOrganizationPayload(BaseSchema):
    id: uuid.UUID | str | None = None
    key: str
    label: str
    entity: dict[str, Any]
    tiers: list[dict[str, Any]]
    hierarchy: list[dict[str, Any]]
    counts: dict[str, int]


class PublicResearchContextPayload(BaseSchema):
    resolved_entity: dict[str, Any]
    entity: dict[str, Any]
    division: dict[str, Any] | None = None
    wing: dict[str, Any] | None = None
    department: dict[str, Any] | None = None
    team: dict[str, Any]
    leadership: dict[str, Any]
    relationships: dict[str, Any]


class ForwardedServiceResponse(BaseSchema):
    """Compatibility envelope for responses proxied from another service."""

    data: Any = None
    meta: dict[str, Any] | None = None
    message: str | None = None
    error: Any = None


class PublicInquirySubmission(BaseSchema):
    id: uuid.UUID
    reference_number: str | None = None
    status: str | None = None
    target_entity_name: str | None = None


class BulkWorkflowResult(BaseSchema):
    content_id: str
    ok: bool
    error: str | None = None


class SyncAttemptPayload(BaseSchema):
    attempt: int = Field(ge=1)
    status: str
    finished_at: datetime
    error: str | None = None


class SyncJobPayload(BaseSchema):
    job_id: str
    status: str
    attempts: int = 0
    retryable: bool = True
    history: list[SyncAttemptPayload] = Field(default_factory=list)
    result: Any = None
    error: str | None = None


class SyncEnvelope(BaseSchema):
    data: Any = None
    message: str | None = None
    meta: dict[str, Any] | None = None


PublicSitePageSnapshot = optional_snapshot("PublicSitePageSnapshot", PublicSitePageRead)


class PublicSitePageListPayload(BaseSchema):
    items: list[dict[str, Any]] = Field(default_factory=list)


class PublicSchoolTeamPayload(BaseSchema):
    id: uuid.UUID | str | None = None
    key: str | None = None
    label: str | None = None
    entity: dict[str, Any] | None = None
    tiers: list[dict[str, Any]] = Field(default_factory=list)
    groups: list[dict[str, Any]] = Field(default_factory=list)
    members: list[dict[str, Any]] = Field(default_factory=list)
    assignments: list[dict[str, Any]] = Field(default_factory=list)
    persons: dict[str, dict[str, Any]] = Field(default_factory=dict)
    counts: dict[str, int] = Field(default_factory=dict)


__all__ = [
    "NavigationPayload",
    "PublicEntityContentPayload",
    "PublicTeamPayload",
    "PublicAcademicOrganizationPayload",
    "PublicResearchContextPayload",
    "ForwardedServiceResponse",
    "PublicInquirySubmission",
    "BulkWorkflowResult",
    "SyncJobPayload",
    "SyncEnvelope",
    "PublicSitePageSnapshot",
    "PublicSchoolTeamPayload",
]
