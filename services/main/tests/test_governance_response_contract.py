from __future__ import annotations

from app.api.v1.governance import router


def test_board_routes_declare_bounded_responses() -> None:
    paths = {
        "/boards", "/boards/{slug}", "/boards/id/{board_id}",
        "/boards/{slug}/members", "/boards/id/{board_id}/members",
        "/council", "/management-board", "/senate",
        "/boards", "/boards/id/{board_id}",
        "/boards/{slug}/members", "/boards/id/{board_id}/members",
    }
    routes = [route for route in router.routes if route.path in paths and route.status_code != 204]
    assert len(routes) == 12
    assert all(route.response_model is not None for route in routes)
    assert all(route.response_model_exclude_unset for route in routes)
