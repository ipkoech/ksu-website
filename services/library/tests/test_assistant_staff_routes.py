from app.routes.v1 import router


def test_staff_inbox_routes_are_registered():
    paths = {
        (route.path, method)
        for route in router.routes
        if "/library/assistant/staff" in route.path
        for method in (route.methods or set())
    }

    assert ("/library/assistant/staff/conversations", "GET") in paths
    assert ("/library/assistant/staff/conversations/{conversation_id}", "GET") in paths
    assert ("/library/assistant/staff/conversations/{conversation_id}/assign", "POST") in paths
    assert ("/library/assistant/staff/conversations/{conversation_id}/status", "PATCH") in paths
    assert ("/library/assistant/staff/conversations/{conversation_id}/reply", "POST") in paths
