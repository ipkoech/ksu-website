from app.routes.v1 import router


def test_chat_and_history_routes_are_registered():
    paths = {
        (route.path, method)
        for route in router.routes
        if "library/assistant" in route.path
        for method in (route.methods or set())
    }

    assert ("/library/assistant/answer", "POST") in paths
    assert ("/library/assistant/conversations", "GET") in paths
    assert ("/library/assistant/conversations/{conversation_id}", "GET") in paths
    assert ("/library/assistant/conversations/{conversation_id}/messages", "GET") in paths
    assert ("/library/assistant/conversations/{conversation_id}/continue", "POST") in paths
