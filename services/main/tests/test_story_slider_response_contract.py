from __future__ import annotations

from app.api.v1.sliders import router as sliders_router
from app.api.v1.stories import router as stories_router


def test_story_and_slider_body_routes_declare_bounded_responses() -> None:
    story_routes = [route for route in stories_router.routes if route.status_code != 204]
    slider_routes = [route for route in sliders_router.routes if route.status_code != 204]
    assert len(story_routes) == 13
    assert len(slider_routes) == 11
    assert all(route.response_model is not None for route in (*story_routes, *slider_routes))


def test_story_and_slider_sparse_routes_exclude_unset_fields() -> None:
    sparse_routes = [
        route for route in (*stories_router.routes, *sliders_router.routes)
        if route.status_code != 204 and route.response_model is not None
    ]
    assert all(route.response_model_exclude_unset for route in sparse_routes)
