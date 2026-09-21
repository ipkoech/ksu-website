from __future__ import annotations

from app.api.v1.documents import router as documents_router
from app.api.v1.exchange_programmes import router as exchange_router
from app.api.v1.policies import router as policies_router


def _assert_body_routes(router, expected: int) -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == expected
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_reference_content_routes_declare_bounded_responses() -> None:
    _assert_body_routes(policies_router, 5)
    _assert_body_routes(documents_router, 5)
    _assert_body_routes(exchange_router, 4)
