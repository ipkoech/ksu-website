from __future__ import annotations

from app.api.v1.social_posts import router


def test_social_post_body_routes_declare_bounded_responses() -> None:
    routes = [route for route in router.routes if route.status_code != 204]
    assert len(routes) == 11
    assert all(route.response_model is not None for route in routes)
    assert all(route.response_model_exclude_unset for route in routes)
