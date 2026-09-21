from __future__ import annotations

from app.api.v1.alumni import router as alumni_router
from app.api.v1.alumni_associations import router as associations_router
from app.api.v1.faqs import router as faqs_router


def _assert_body_routes(router, expected: int) -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == expected
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_alumni_and_faq_routes_declare_bounded_responses() -> None:
    _assert_body_routes(alumni_router, 4)
    _assert_body_routes(associations_router, 6)
    _assert_body_routes(faqs_router, 6)
