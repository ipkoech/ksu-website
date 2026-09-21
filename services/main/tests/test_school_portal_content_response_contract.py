from __future__ import annotations

from app.api.v1.school_portal.content import router


def test_school_portal_content_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == 6
    assert all(route.response_model is not None for route in body_routes)
