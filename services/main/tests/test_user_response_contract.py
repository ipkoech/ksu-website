from __future__ import annotations

from app.api.v1.users import router


def test_user_crud_routes_declare_bounded_response_models() -> None:
    expected = {
        ("GET", ""),
        ("GET", "/{user_id}"),
        ("POST", ""),
        ("PATCH", "/{user_id}"),
    }
    routes = {
        (method, route.path): route
        for route in router.routes
        for method in route.methods
        if (method, route.path) in expected
    }
    assert set(routes) == expected
    assert all(route.response_model is not None for route in routes.values())
    assert all(route.response_model_exclude_unset for route in routes.values())
