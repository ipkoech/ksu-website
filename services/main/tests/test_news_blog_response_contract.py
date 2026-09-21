from __future__ import annotations

from app.api.v1.blogs import router as blogs_router
from app.api.v1.news import router as news_router


def test_news_and_blog_body_routes_declare_bounded_responses() -> None:
    routes = [
        route
        for router in (news_router, blogs_router)
        for route in router.routes
        if route.status_code != 204
    ]
    assert len(routes) == 16
    assert all(route.response_model is not None for route in routes)
    assert all(route.response_model_exclude_unset for route in routes)
