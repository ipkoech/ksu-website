from __future__ import annotations

from app.api.v1.admin import audit, inquiries, notifications, permissions, reports, roles, users


def _assert_typed(router, expected: int, *, skip_paths: set[str] | None = None) -> None:
    skip_paths = skip_paths or set()
    routes = [
        route
        for route in router.router.routes
        if route.status_code != 204 and route.path not in skip_paths
    ]
    assert len(routes) == expected
    assert all(route.response_model is not None for route in routes)


def test_admin_operation_routes_declare_bounded_responses() -> None:
    _assert_typed(users, 8)
    _assert_typed(roles, 7)
    _assert_typed(permissions, 2)
    _assert_typed(notifications, 8)
    _assert_typed(audit, 2)
    _assert_typed(inquiries, 7)
    _assert_typed(reports, 4, skip_paths={"/exports/{report_name}"})
