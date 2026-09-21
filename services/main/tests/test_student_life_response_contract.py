from __future__ import annotations

from app.api.v1.accommodations import router as accommodations_router
from app.api.v1.arts_culture import router as arts_router
from app.api.v1.sports import router as sports_router
from app.api.v1.student_governance import router as governance_router


def _assert_body_routes(router, expected: int) -> None:
    body_routes = [route for route in router.routes if route.status_code != 204]
    assert len(body_routes) == expected
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_student_life_crud_routes_declare_bounded_responses() -> None:
    _assert_body_routes(accommodations_router, 4)
    _assert_body_routes(sports_router, 4)
    _assert_body_routes(arts_router, 4)
    _assert_body_routes(governance_router, 4)
