from __future__ import annotations

from app.api.v1.school_portal.audit import router as audit_router
from app.api.v1.school_portal.context import router as context_router
from app.api.v1.school_portal.media import router as media_router
from app.api.v1.school_portal.notifications import router as notifications_router


def test_school_portal_foundation_routes_declare_bounded_responses() -> None:
    routes = [
        *audit_router.routes,
        *context_router.routes,
        *media_router.routes,
        *notifications_router.routes,
    ]
    body_routes = [route for route in routes if route.status_code != 204]
    assert len(body_routes) == 13
    assert all(route.response_model is not None for route in body_routes)
