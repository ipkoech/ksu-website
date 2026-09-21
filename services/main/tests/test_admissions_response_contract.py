from __future__ import annotations

from app.api.v1.admissions import router


def test_admissions_body_routes_declare_bounded_response_models() -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == 30
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)
