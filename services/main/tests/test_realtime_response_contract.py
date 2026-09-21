from __future__ import annotations

from app.api.v1.realtime import router


def test_realtime_http_routes_declare_bounded_responses() -> None:
    routes = [route for route in router.routes if route.path != "/realtime"]
    assert len(routes) == 3
    assert all(route.response_model is not None for route in routes)
