from __future__ import annotations

from app.api.v1.vice_chancellor import router


def test_vice_chancellor_body_routes_declare_bounded_responses() -> None:
    routes = [route for route in router.routes if route.status_code != 204]
    assert len(routes) == 34
    assert all(route.response_model is not None for route in routes)
