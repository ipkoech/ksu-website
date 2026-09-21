from __future__ import annotations

from app.api.v1.staff import router


def test_staff_routes_declare_bounded_responses() -> None:
    assert len(router.routes) == 15
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == 14
    assert all(route.response_model is not None for route in body_routes)
