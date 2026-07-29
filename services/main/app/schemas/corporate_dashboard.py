"""Corporate Communication operational dashboard schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import Field

from .base import BaseSchema


class DashboardPeriod(BaseSchema):
    date_from: date
    date_to: date
    bucket: Literal["day", "week", "month"] | None = None


class DashboardMetric(BaseSchema):
    key: str
    label: str
    value: int | float
    unit: str = "items"
    previous_value: int | float | None = None
    change: int | float | None = None
    change_percent: float | None = None
    trend: Literal["up", "down", "flat", "unavailable"] = "unavailable"
    favourability: Literal["positive", "negative", "neutral"] = "neutral"


class DashboardSeriesPoint(BaseSchema):
    period: str
    total: int
    values: dict[str, int] = Field(default_factory=dict)


class DashboardBreakdown(BaseSchema):
    key: str
    label: str
    value: int
    submitted: int = 0
    approved: int = 0
    published: int = 0
    changes_requested: int = 0
    rejected: int = 0
    approval_rate: float | None = None
    median_decision_hours: float | None = None


class DashboardInsight(BaseSchema):
    code: str
    severity: Literal["info", "success", "warning", "critical"]
    title: str
    description: str
    value: int | float | None = None
    total: int | float | None = None
    href: str | None = None


class DashboardAttentionItem(BaseSchema):
    id: str
    title: str
    content_type: str
    content_type_label: str
    status: str
    age_hours: float | None = None
    issue_codes: list[str]
    severity: Literal["info", "warning", "critical"]
    source_label: str
    href: str


class CorporateDashboardResponse(BaseSchema):
    generated_at: datetime
    period: DashboardPeriod
    comparison_period: DashboardPeriod | None = None
    filters: dict[str, str | None]
    snapshot: dict[str, Any]
    activity: dict[str, Any]
    workflow: dict[str, Any]
    publishing: dict[str, Any]
    readiness: dict[str, Any]
    insights: list[DashboardInsight]
    attention_items: list[DashboardAttentionItem]
    data_quality: dict[str, Any]


__all__ = [
    "CorporateDashboardResponse",
    "DashboardAttentionItem",
    "DashboardBreakdown",
    "DashboardInsight",
    "DashboardMetric",
    "DashboardPeriod",
    "DashboardSeriesPoint",
]
