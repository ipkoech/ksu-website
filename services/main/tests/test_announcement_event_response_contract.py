from __future__ import annotations

from app.api.v1.announcements import router as announcements_router
from app.api.v1.events import router as events_router


def test_announcement_and_event_body_routes_declare_bounded_responses() -> None:
    routes = [
        route
        for router in (announcements_router, events_router)
        for route in router.routes
        if route.status_code != 204
    ]
    assert len(routes) == 16
    assert all(route.response_model is not None for route in routes)
    assert all(route.response_model_exclude_unset for route in routes)
