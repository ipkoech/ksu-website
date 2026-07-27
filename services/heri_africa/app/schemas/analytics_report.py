from __future__ import annotations

from datetime import date

from pydantic import BaseModel


class AnalyticsReport(BaseModel):
    start_date: date
    end_date: date
    total_events: int
    page_views: int
    content_views: int
    form_submissions: int
    downloads: int
    registrations: int
    top_pages: list[dict[str, object]]
    top_search_terms: list[dict[str, object]]
    cta_conversions: list[dict[str, object]]
