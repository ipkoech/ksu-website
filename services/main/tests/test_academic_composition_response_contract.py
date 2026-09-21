from __future__ import annotations

from app.api.v1.campus_life import router as campus_life_router
from app.api.v1.intakes import router as intakes_router
from app.api.v1.timetables import router as timetables_router


def test_campus_life_route_declares_bounded_response() -> None:
    body_routes = [route for route in campus_life_router.routes if route.status_code != 204]
    assert len(body_routes) == 1
    assert body_routes[0].response_model is not None


def test_intake_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in intakes_router.routes if route.status_code != 204]
    assert len(body_routes) == 8
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_timetable_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in timetables_router.routes if route.status_code != 204]
    assert len(body_routes) == 8
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)
