from __future__ import annotations

from app.api.v1.school_portal.inquiries import router as inquiries_router
from app.api.v1.school_portal.team import router as team_router


def test_school_portal_inquiry_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in inquiries_router.routes if route.status_code != 204]
    assert len(body_routes) == 7
    assert all(route.response_model is not None for route in body_routes)
    assert all(route.response_model_exclude_unset for route in body_routes)


def test_school_portal_team_routes_declare_bounded_responses() -> None:
    body_routes = [route for route in team_router.routes if route.status_code != 204]
    assert len(body_routes) == 14
    assert all(route.response_model is not None for route in body_routes if route.path != "/team/imports/template")
    assert all(route.response_model_exclude_unset for route in body_routes if route.path != "/team/imports/template")
