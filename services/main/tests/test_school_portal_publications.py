import unittest
from unittest.mock import AsyncMock, patch

import httpx
from app.api.v1 import register_routes
from app.clients.research import ResearchClient
from fastapi import FastAPI


class SchoolPortalPublicationTests(unittest.IsolatedAsyncioTestCase):
    def test_main_facade_routes_do_not_accept_school_id(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]

        self.assertIn("/api/v1/school-portal/publications", paths)
        self.assertIn(
            "/api/v1/school-portal/publications/{publication_id}", paths
        )
        create_schema = paths["/api/v1/school-portal/publications"]["post"][
            "requestBody"
        ]["content"]["application/json"]["schema"]
        self.assertNotIn("school_id", str(create_schema))

    async def test_research_client_leaves_retry_policy_to_the_integration_pool(self):
        client = ResearchClient(
            base_url="http://research.test",
            authorization="Bearer token",
            request_id="request-1",
        )
        with patch.object(
            client,
            "_request_once",
            AsyncMock(return_value={"items": []}),
        ) as request_once:
            result = await client.list_school_publications()

        self.assertEqual({"items": []}, result)
        self.assertEqual(1, request_once.await_count)

        with patch.object(client, "_request_once", AsyncMock(return_value={"id": "new"})) as request_once:
            await client.create_school_publication({"title": "Paper"})
        self.assertEqual(1, request_once.await_count)

    async def test_client_forwards_auth_and_request_id(self):
        client = ResearchClient(
            base_url="http://research.test",
            authorization="Bearer scoped-token",
            request_id="request-2",
        )
        pool = type("Pool", (), {})()
        response = httpx.Response(200, json={"data": []}, request=httpx.Request("GET", "http://research.test"))
        pool.request_authenticated = AsyncMock(return_value=response)
        with patch("app.clients.research.get_integration_pool", return_value=pool):
            await client.list_school_publications()

        kwargs = pool.request_authenticated.await_args.kwargs
        self.assertEqual("Bearer scoped-token", kwargs["auth_headers"]["Authorization"])
        self.assertEqual("request-2", kwargs["request_id"])


if __name__ == "__main__":
    unittest.main()
