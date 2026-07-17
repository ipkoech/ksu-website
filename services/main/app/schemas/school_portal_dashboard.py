"""Typed operational dashboard contract for one authenticated school."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import Field

from .base import BaseSchema

DashboardRange = Literal["7d", "30d", "90d", "12m"]


class DashboardSummaryCard(BaseSchema):
    key: str
    label: str
    value: int
    previous_value: int | None = None
    change_percent: float | None = None
    href: str | None = None
    collection_started_after_deployment: bool = False


class DashboardTrendPoint(BaseSchema):
    bucket: str
    value: int


class DashboardDistributionItem(BaseSchema):
    key: str
    label: str
    value: int


class DashboardAttentionItem(BaseSchema):
    key: str
    label: str
    count: int
    severity: Literal["info", "warning", "critical"]
    href: str


class DashboardActivityItem(BaseSchema):
    id: uuid.UUID
    event_type: str
    resource_type: str
    resource_id: uuid.UUID
    occurred_at: datetime
    summary: str


class DashboardQuickLink(BaseSchema):
    key: str
    label: str
    count: int
    href: str


class DashboardProfileCompleteness(BaseSchema):
    percent: int = Field(ge=0, le=100)
    completed_fields: int
    total_fields: int
    missing_fields: list[str]


class SchoolPortalDashboardResponse(BaseSchema):
    school_id: uuid.UUID
    range: DashboardRange
    generated_at: datetime
    summary_cards: list[DashboardSummaryCard]
    trends: list[DashboardTrendPoint]
    distributions: dict[str, list[DashboardDistributionItem]]
    attention_items: list[DashboardAttentionItem]
    recent_activity: list[DashboardActivityItem]
    quick_links: list[DashboardQuickLink]
    profile_completeness: DashboardProfileCompleteness
    collection_notes: dict[str, str]


__all__ = [
    "DashboardActivityItem",
    "DashboardAttentionItem",
    "DashboardDistributionItem",
    "DashboardProfileCompleteness",
    "DashboardQuickLink",
    "DashboardRange",
    "DashboardSummaryCard",
    "DashboardTrendPoint",
    "SchoolPortalDashboardResponse",
]
