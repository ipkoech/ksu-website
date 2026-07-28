from app.routes.v1 import router


def test_guest_and_verification_routes_are_registered():
    paths = {
        (route.path, method)
        for route in router.routes
        if "library/assistant" in route.path
        for method in (route.methods or set())
    }

    assert ("/library/assistant/guest/session", "POST") in paths
    assert ("/library/assistant/verification/request", "POST") in paths
    assert ("/library/assistant/verification/confirm", "POST") in paths
    assert ("/library/assistant/verification/confirm", "GET") in paths
