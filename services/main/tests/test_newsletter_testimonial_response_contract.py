from __future__ import annotations

from app.api.v1.newsletters import router as newsletters_router
from app.api.v1.testimonials import router as review_router


def test_newsletter_and_testimonial_body_routes_declare_bounded_responses() -> None:
    routes = [
        route
        for router in (newsletters_router, review_router)
        for route in router.routes
        if route.status_code != 204
    ]
    assert len(routes) == 18
    assert all(route.response_model is not None for route in routes)
    assert all(route.response_model_exclude_unset for route in routes)
