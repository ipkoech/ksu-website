from __future__ import annotations

from app.api.v1.analytics import router as analytics_router
from app.api.v1.me import router as me_router


def test_self_service_and_analytics_routes_declare_response_models() -> None:
    routes = [*me_router.routes, *analytics_router.routes]
    expected = {
        ("GET", "/profile"),
        ("PATCH", "/profile"),
        ("GET", "/preferences"),
        ("PATCH", "/preferences"),
        ("GET", "/portal-access"),
        ("POST", "/events"),
    }
    actual = {(method, route.path) for route in routes for method in route.methods if (method, route.path) in expected}
    assert actual == expected
    assert all(route.response_model is not None for route in routes if (next(iter(route.methods)), route.path) in expected)
