import asyncio
import json

import httpx

from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


def test_saturated_path_group_does_not_block_independent_route(monkeypatch):
    monkeypatch.setenv("DB_ROUTE_BUDGETS", json.dumps([
        {"path_prefix": "/work", "max_concurrency": 1, "max_queries": 2,
         "acquire_timeout_seconds": 0},
    ]))

    async def exercise():
        entered, release = asyncio.Event(), asyncio.Event()
        calls = []

        def register(app):
            @app.get("/work/slow")
            async def slow():
                calls.append("slow")
                entered.set()
                await release.wait()
                return {"ok": True}

            @app.get("/work/other")
            async def other():
                calls.append("other")
                return {"ok": True}

            @app.get("/workbench")
            async def independent():
                return {"ok": True}

        app = create_service_app(
            ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
            cors=CorsConfig(origins=()), register_routes=register,
        )
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            owner = asyncio.create_task(client.get("/work/slow"))
            try:
                await asyncio.wait_for(entered.wait(), 2)
                rejected = await client.get("/work/other")
                assert rejected.status_code == 503
                assert rejected.json() == {"detail": "Database concurrency limit exceeded; please retry shortly."}
                assert calls == ["slow"]
                assert (await client.get("/workbench")).status_code == 200
            finally:
                release.set()
                await asyncio.wait_for(owner, 2)
            assert (await client.get("/work/other")).status_code == 200
            assert calls == ["slow", "other"]

    asyncio.run(exercise())
