from __future__ import annotations

from app.api.v1.governance import router


def test_public_governance_routes_declare_bounded_responses() -> None:
    routes = [route for route in router.routes if route.path.startswith("/public/university-council")]
    assert len(routes) == 2
    assert all(route.response_model is not None for route in routes)
