from __future__ import annotations

from app.schemas.analytics import AnalyticsEventPayload


def test_analytics_event_requires_name_and_path() -> None:
    event = AnalyticsEventPayload(event_name="cta_click", path="/partner-with-us")
    assert event.event_name == "cta_click"
    assert event.properties == {}
