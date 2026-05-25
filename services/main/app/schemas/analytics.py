"""Analytics event and report schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import Field, field_validator

from .base import BaseReadSchema, BaseSchema


AnalyticsSource = Literal["web", "admin"]
AnalyticsEventType = Literal["page_view", "content_view", "search", "download", "cta_click", "admin_action"]


class AnalyticsEventCreate(BaseSchema):
    event_type: AnalyticsEventType
    source_app: AnalyticsSource
    path: str = Field(min_length=1, max_length=1024)
    referrer: str | None = Field(default=None, max_length=1024)
    referrer_host: str | None = Field(default=None, max_length=255)
    entity_type: str | None = Field(default=None, max_length=64)
    entity_id: uuid.UUID | None = None
    entity_slug: str | None = Field(default=None, max_length=255)
    entity_title: str | None = Field(default=None, max_length=500)
    session_hash: str | None = Field(default=None, max_length=128)
    user_agent: str | None = Field(default=None, max_length=512)
    device_type: str | None = Field(default=None, max_length=64)
    browser: str | None = Field(default=None, max_length=64)
    os: str | None = Field(default=None, max_length=64)
    country_code: str | None = Field(default=None, max_length=8)
    event_metadata: dict[str, Any] | None = None
    occurred_at: datetime | None = None

    @field_validator("path")
    @classmethod
    def normalize_path(cls, value: str) -> str:
        return value.strip()[:1024]


class AnalyticsEventBatchCreate(BaseSchema):
    events: list[AnalyticsEventCreate] = Field(min_length=1, max_length=50)


class AnalyticsEventRead(BaseReadSchema):
    event_type: str
    source_app: str
    path: str
    referrer: str | None = None
    referrer_host: str | None = None
    entity_type: str | None = None
    entity_id: uuid.UUID | None = None
    entity_slug: str | None = None
    entity_title: str | None = None
    session_hash: str | None = None
    device_type: str | None = None
    browser: str | None = None
    os: str | None = None
    country_code: str | None = None
    user_id: uuid.UUID | None = None
    event_metadata: dict[str, Any] | None = None
    occurred_at: datetime


class ReportMetric(BaseSchema):
    label: str
    value: int
    previous_value: int | None = None


class ReportSeriesPoint(BaseSchema):
    date: str
    value: int


class ReportDimension(BaseSchema):
    key: str
    label: str
    value: int


class ReportsOverview(BaseSchema):
    total_events: int
    page_views: int
    content_views: int
    admin_events: int
    unique_sessions: int
    traffic_by_day: list[ReportSeriesPoint]
    top_content: list[ReportDimension]


class TrafficReport(BaseSchema):
    page_views: int
    unique_sessions: int
    by_day: list[ReportSeriesPoint]
    top_paths: list[ReportDimension]
    referrers: list[ReportDimension]


class ContentReport(BaseSchema):
    content_views: int
    interactions: int
    top_content: list[ReportDimension]
    event_types: list[ReportDimension]


class AdminActivityReport(BaseSchema):
    admin_events: int
    active_admins: int
    by_day: list[ReportSeriesPoint]
    top_paths: list[ReportDimension]


__all__ = [
    "AnalyticsEventCreate",
    "AnalyticsEventBatchCreate",
    "AnalyticsEventRead",
    "ReportsOverview",
    "TrafficReport",
    "ContentReport",
    "AdminActivityReport",
]
