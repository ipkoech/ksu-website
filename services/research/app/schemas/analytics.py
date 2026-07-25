"""Research admin analytics dashboard schemas."""

from __future__ import annotations

from .base import BaseSchema


class ResearchAnalyticsPoint(BaseSchema):
    key: str
    label: str
    value: int | float
    secondary_value: int | float | None = None
    suffix: str = ""
    href: str | None = None
    description: str | None = None


class ResearchAnalyticsChart(BaseSchema):
    key: str
    title: str
    chart_type: str
    description: str | None = None
    data: list[ResearchAnalyticsPoint]


class ResearchAnalyticsKpi(BaseSchema):
    key: str
    label: str
    value: int | float
    suffix: str = ""
    description: str
    href: str | None = None


class ResearchAnalyticsAttentionItem(BaseSchema):
    key: str
    label: str
    value: int | float
    severity: str = "info"
    description: str
    href: str | None = None


class ResearchDashboardAnalytics(BaseSchema):
    scope: str = "research_admin"
    title: str = "Research operational analytics"
    kpis: list[ResearchAnalyticsKpi]
    attention: list[ResearchAnalyticsAttentionItem]
    portfolio_health: list[ResearchAnalyticsChart]
    funding_pipeline: list[ResearchAnalyticsChart]
    outputs_publications: list[ResearchAnalyticsChart]
    partnerships_sustainability: list[ResearchAnalyticsChart]
    applications_reviews: list[ResearchAnalyticsChart]
    admin_activity: list[ResearchAnalyticsChart]
