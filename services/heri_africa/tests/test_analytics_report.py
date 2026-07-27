from __future__ import annotations

from datetime import date

from app.schemas.analytics_report import AnalyticsReport


def test_analytics_report_has_comparison_ready_shape() -> None:
    report = AnalyticsReport(start_date=date(2026, 1, 1), end_date=date(2026, 1, 31), total_events=10, page_views=8, content_views=2, form_submissions=1, downloads=1, registrations=0, top_pages=[], top_search_terms=[], cta_conversions=[])
    assert report.end_date > report.start_date
