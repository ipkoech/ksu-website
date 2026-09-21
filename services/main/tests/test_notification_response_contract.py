from __future__ import annotations

from app.api.v1.notifications import router


def test_notification_routes_declare_bounded_response_models() -> None:
    expected = {
        "",
        "/unread-count",
        "/read-all",
        "/preferences",
        "/{notification_id}/read",
        "/{notification_id}/archive",
    }
    routes = {route.path: route for route in router.routes if route.path in expected}
    assert set(routes) == expected
    assert all(route.response_model is not None for route in routes.values())
    assert all(route.response_model_exclude_unset for route in routes.values())
