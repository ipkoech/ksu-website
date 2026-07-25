import unittest

from fastapi.routing import APIRoute

from app.routes.v1 import router as v1_router
from app.routes.v1.realtime import get_research_realtime_config


def _iter_routes(router, prefix: str = ""):
    for route in router.routes:
        if isinstance(route, APIRoute):
            yield prefix + route.path, route
            continue

        original_router = getattr(route, "original_router", None)
        include_context = getattr(route, "include_context", None)
        if original_router is not None:
            nested_prefix = prefix + getattr(include_context, "prefix", "")
            yield from _iter_routes(original_router, nested_prefix)


class ResearchRealtimeConfigTests(unittest.IsolatedAsyncioTestCase):
    def test_research_realtime_config_route_is_registered(self):
        routes = {
            (path, method)
            for path, route in _iter_routes(v1_router)
            for method in route.methods
        }

        self.assertIn(("/realtime/research/config", "GET"), routes)

    async def test_research_realtime_config_describes_research_channels(self):
        response = await get_research_realtime_config()
        config = response["data"]

        self.assertEqual("research", config["scope_type"])
        self.assertEqual("/api/v1/realtime", config["websocket_path"])
        self.assertGreaterEqual(config["heartbeat_seconds"], 10)
        self.assertIn("research.projects", config["channels"])
        self.assertIn("research.farm", config["channels"])
        self.assertIn("research.sustainability", config["channels"])
        self.assertIn("research.content", config["channels"])
        self.assertIn("notification.created", config["events"])
        self.assertIn("research.record.changed", config["events"])


if __name__ == "__main__":
    unittest.main()
