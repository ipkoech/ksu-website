from __future__ import annotations

from app.api.v1.governance import router


def test_governance_body_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == 58
    assert all(route.response_model is not None for route in body_routes)
