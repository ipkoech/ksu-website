from __future__ import annotations

from app.api.v1.about_content import router


def test_about_content_body_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == 38
    assert all(route.response_model is not None for route in body_routes)


def test_about_content_admin_sparse_routes_exclude_unset_fields() -> None:
    admin_routes = [
        route for route in router.routes
        if route.status_code != 204 and route.path.startswith(("/about-content", "/fact-", "/fact", "/institutional-"))
    ]
    assert admin_routes
    assert all(route.response_model_exclude_unset for route in admin_routes)
