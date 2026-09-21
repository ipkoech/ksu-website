from __future__ import annotations

from app.api.v1.academic_calendars import router


def test_academic_calendar_routes_declare_bounded_response_models() -> None:
    expected = {
        ("GET", ""),
        ("GET", "/admin"),
        ("GET", "/composition/current"),
        ("GET", "/{calendar_id}/events"),
        ("GET", "/id/{calendar_id}"),
        ("POST", ""),
        ("PATCH", "/{calendar_id}"),
        ("POST", "/{calendar_id}/events"),
        ("PATCH", "/{calendar_id}/events/{event_id}"),
        ("POST", "/{calendar_id}/documents"),
        ("POST", "/{calendar_id}/workflow/{action}"),
        ("POST", "/{calendar_id}/events/{event_id}/workflow/{action}"),
    }
    routes = {
        (method, route.path): route
        for route in router.routes
        for method in route.methods
        if (method, route.path) in expected
    }
    assert set(routes) == expected
    assert all(route.response_model is not None for route in routes.values())
