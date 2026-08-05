from app.routes.v1 import router


def _api_routes(current_router):
    for route in current_router.routes:
        nested = getattr(route, "original_router", None)
        if nested is not None:
            yield from _api_routes(nested)
        elif getattr(route, "routes", None) is not None:
            yield from _api_routes(route)
        elif hasattr(route, "path"):
            yield route


def test_guest_and_verification_routes_are_registered():
    paths = {
        (route.path, method)
        for route in _api_routes(router)
        if "library/assistant" in route.path
        for method in (route.methods or set())
    }

    assert ("/library/assistant/guest/session", "POST") in paths
    assert ("/library/assistant/verification/request", "POST") in paths
    assert ("/library/assistant/verification/confirm", "POST") in paths
    assert ("/library/assistant/verification/confirm", "GET") in paths
