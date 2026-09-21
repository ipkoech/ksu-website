import os
import uuid
from unittest.mock import Mock

from fastapi import Depends, HTTPException
import httpx
import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.tasks import audit
from ksu_common.database import DatabaseRuntime
from ksu_common.internal_client import PooledIntegrationClient


@pytest.mark.asyncio
async def test_library_app_audits_the_committed_http_outcome(monkeypatch):
    from app import main

    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "library_http_audit_" + uuid.uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0,
                                 execution_options={"schema_translate_map": {"library": schema}})
    factory = async_sessionmaker(engine)
    runtime = DatabaseRuntime(engine, factory)
    business = sa.Table("business_probe", sa.MetaData(), sa.Column("id", sa.Integer, primary_key=True), schema=schema)
    original_register = main.register_routers

    def register(app):
        original_register(app)

        @app.post("/_audit_transaction_probe", response_model=dict[str, int])
        async def probe(item: int, fail: bool = False, db=Depends(runtime.session)):
            await db.execute(business.insert().values(id=item))
            if fail:
                raise HTTPException(409, "synthetic conflict")
            return {"id": item}

    monkeypatch.setattr(main, "register_routers", register)
    monkeypatch.setattr(main, "AsyncSessionLocal", factory)
    monkeypatch.setattr(audit, "AsyncSessionLocal", factory)
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(business.create)
            await connection.run_sync(audit.audit_relay.create)
        app = main.create_app()
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            success = await client.post("/_audit_transaction_probe?item=1")
            failure = await client.post("/_audit_transaction_probe?item=2&fail=true")
        assert success.status_code == 200 and success.json() == {"id": 1}, success.text
        assert failure.status_code == 409
        async with factory() as session:
            assert (await session.scalars(sa.select(business.c.id))).all() == [1]
            payloads = (await session.scalars(sa.select(audit.audit_relay.c.payload))).all()
            assert sorted(payload["status_code"] for payload in payloads) == [200, 409]
        assert engine.pool.checkedout() == 0
        received = []

        async def receiver(request):
            import json
            assert engine.pool.checkedout() == 0
            assert request.url.path == "/api/v1/internal/audit/batch"
            events = json.loads(request.content)["events"]
            received.extend(events)
            return httpx.Response(202, json={"status": "accepted", "received": len(events), "inserted": len(events)})

        async with PooledIntegrationClient(transport=httpx.MockTransport(receiver)) as pool:
            monkeypatch.setattr("ksu_common.internal_client.get_integration_pool", lambda: pool)
            assert await audit._relay_pending() == 2
            assert await audit._relay_pending() == 0
        assert sorted(event["status_code"] for event in received) == [200, 409]
        metrics = Mock()
        monkeypatch.setattr(audit.celery_app, "_ksu_metrics", metrics)
        await audit._observe_pending()
        metrics.gauge.assert_any_call("audit.relay.ready_age", 0, tags={"service": "library"})
        metrics.gauge.assert_any_call("audit.relay.retained_failure", 0, tags={"service": "library"})
        observed = next(call.args[1] for call in metrics.gauge.call_args_list
                        if call.args[0] == "audit.relay.observed_at")
        assert observed > 0
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()
