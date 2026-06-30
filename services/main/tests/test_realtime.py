import uuid
import unittest
from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import FastAPI

from app.api.v1 import register_routes
from app.api.v1 import realtime


def _iter_registered_routes(app: FastAPI):
    for route in app.routes:
        path = getattr(route, "path", None)
        if path is not None:
            yield route
            continue

        original_router = getattr(route, "original_router", None)
        include_context = getattr(route, "include_context", None)
        if original_router is None:
            continue
        prefix = getattr(include_context, "prefix", "")
        for nested in original_router.routes:
            nested_path = getattr(nested, "path", None)
            if nested_path is None:
                continue
            yield SimpleNamespace(
                path=f"{prefix}{nested_path}",
                methods=getattr(nested, "methods", set()),
            )


class _Headers(dict):
    def get(self, key, default=None):
        return super().get(key.lower(), default)


class _WebSocket:
    def __init__(self, *, headers=None, query_params=None, cookies=None):
        self.headers = _Headers({(key.lower()): value for key, value in (headers or {}).items()})
        self.query_params = query_params or {}
        self.cookies = cookies or {}


class RealtimeEndpointTests(unittest.TestCase):
    def test_extract_token_prefers_bearer_header(self):
        websocket = _WebSocket(
            headers={"Authorization": "Bearer header-token"},
            query_params={"access_token": "query-token"},
            cookies={"ksu_access": "cookie-token"},
        )

        self.assertEqual("header-token", realtime._extract_websocket_token(websocket))

    def test_extract_token_supports_query_and_cookie_fallbacks(self):
        query_websocket = _WebSocket(query_params={"token": "query-token"})
        cookie_websocket = _WebSocket(cookies={"ksu_access": "cookie-token"})

        self.assertEqual("query-token", realtime._extract_websocket_token(query_websocket))
        self.assertEqual("cookie-token", realtime._extract_websocket_token(cookie_websocket))

    def test_notification_payload_is_json_safe_and_explicit(self):
        notification_id = uuid.uuid4()
        user_id = uuid.uuid4()
        created_at = datetime.now(timezone.utc)
        notification = SimpleNamespace(
            id=notification_id,
            user_id=user_id,
            title="Research grant approved",
            subject=None,
            message="Your grant has been approved.",
            notification_type="success",
            priority="high",
            action_url="/research/fundings/grants",
            scope_type="research",
            scope_id=None,
            channels=["in_app"],
            payload={"grant_id": str(uuid.uuid4())},
            is_read=False,
            read_at=None,
            expires_at=None,
            created_at=created_at,
            updated_at=created_at,
        )

        payload = realtime._notification_payload(notification)

        self.assertEqual(str(notification_id), payload["id"])
        self.assertEqual(str(user_id), payload["user_id"])
        self.assertEqual("Research grant approved", payload["title"])
        self.assertEqual("success", payload["notification_type"])
        self.assertEqual(created_at.isoformat(), payload["created_at"])

    def test_realtime_route_is_registered(self):
        app = FastAPI()
        register_routes(app)

        paths = {route.path for route in _iter_registered_routes(app)}

        self.assertIn("/api/v1/realtime", paths)

    def test_research_realtime_config_route_is_registered(self):
        app = FastAPI()
        register_routes(app)

        routes = {
            (route.path, ",".join(sorted(getattr(route, "methods", []) or [])))
            for route in _iter_registered_routes(app)
        }

        self.assertIn(("/api/v1/realtime/research/config", "GET"), routes)

    def test_research_realtime_config_payload_is_explicit(self):
        payload = realtime._research_realtime_config()

        self.assertEqual("research", payload["scope_type"])
        self.assertEqual("/api/v1/realtime", payload["websocket_path"])
        self.assertIn("notifications", payload["channels"])
        self.assertIn("research", payload["channels"])
        self.assertGreater(payload["heartbeat_seconds"], 0)


if __name__ == "__main__":
    unittest.main()
