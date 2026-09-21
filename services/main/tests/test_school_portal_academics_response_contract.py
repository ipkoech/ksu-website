from __future__ import annotations

from app.api.v1.school_portal.departments import router as departments_router
from app.api.v1.school_portal.profile import router as profile_router
from app.api.v1.school_portal.programmes import router as programmes_router


def test_school_portal_profile_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in profile_router.routes if route.status_code != 204]
    assert len(body_routes) == 5
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_school_portal_department_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in departments_router.routes if route.status_code != 204]
    assert len(body_routes) == 6
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_school_portal_programme_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in programmes_router.routes if route.status_code != 204]
    assert len(body_routes) == 6
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)
