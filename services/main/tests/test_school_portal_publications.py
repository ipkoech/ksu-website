import unittest
import uuid
from unittest.mock import AsyncMock, patch

import httpx
from fastapi import FastAPI

from app.api.v1 import register_routes
from app.clients.research import ResearchClient


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

    async def test_research_client_retries_reads_but_not_non_idempotent_writes(self):
        client = ResearchClient(
            base_url="http://research.test",
            authorization="Bearer token",
            request_id="request-1",
        )
        with patch.object(
            client,
            "_request_once",
            AsyncMock(
                side_effect=[
                    httpx.ConnectError("temporary"),
                    {"items": []},
                ]
            ),
        ) as request_once:
            result = await client.list_school_publications()

        self.assertEqual({"items": []}, result)
        self.assertEqual(2, request_once.await_count)

        with patch.object(
            client,
            "_request_once",
            AsyncMock(side_effect=httpx.ConnectError("write failed")),
        ) as request_once:
            with self.assertRaises(httpx.ConnectError):
                await client.create_school_publication({"title": "Paper"})
        self.assertEqual(1, request_once.await_count)

    async def test_client_forwards_auth_and_request_id(self):
        client = ResearchClient(
            base_url="http://research.test",
            authorization="Bearer scoped-token",
            request_id="request-2",
        )
        with patch("httpx.AsyncClient.request", AsyncMock()) as request:
            response = httpx.Response(
                200,
                json={"data": []},
                request=httpx.Request("GET", "http://research.test"),
            )
            request.return_value = response
            await client.list_school_publications()

        headers = request.await_args.kwargs["headers"]
        self.assertEqual("Bearer scoped-token", headers["Authorization"])
        self.assertEqual("request-2", headers["X-Request-ID"])


if __name__ == "__main__":
    unittest.main()
