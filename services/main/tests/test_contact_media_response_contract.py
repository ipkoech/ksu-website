from __future__ import annotations

from app.api.v1.contact_directory import router as directory_router
from app.api.v1.contacts import router as contacts_router
from app.api.v1.media import router as media_router
from app.api.v1.support import router as support_router


def _assert_body_routes(router, expected: int) -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == expected
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_contact_media_support_routes_declare_bounded_responses() -> None:
    _assert_body_routes(directory_router, 1)
    _assert_body_routes(contacts_router, 9)
    _assert_body_routes(support_router, 4)
    _assert_body_routes(media_router, 12)
