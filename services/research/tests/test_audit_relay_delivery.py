import json
import os
import uuid
from unittest.mock import Mock
from datetime import timedelta

import httpx
import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.tasks import audit
from ksu_common.internal_client import PooledIntegrationClient


@pytest.mark.asyncio
async def test_research_capture_rollback_and_http_relay(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "research_delivery_" + uuid.uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0,
                                 execution_options={"schema_translate_map": {"research": schema}})
    factory = async_sessionmaker(engine)
    monkeypatch.setattr(audit, "AsyncSessionLocal", factory)
    event = {"id": str(uuid.uuid4()), "service_name": "research", "action": "probe"}
    received = []

    async def handler(request):
        assert engine.pool.checkedout() == 0
        assert request.url.path == "/api/v1/internal/audit/batch"
        events = json.loads(request.content)["events"]
        received.extend(events)
        return httpx.Response(202, json={"status": "accepted", "received": len(events), "inserted": len(events)})

    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(audit.audit_relay.create)
        async with factory() as session:
            await audit.capture_request_audit(session, event)
            await session.rollback()
        async with factory() as session:
            assert await session.scalar(sa.select(sa.func.count()).select_from(audit.audit_relay)) == 0
        await audit.dispatch_audit(event)
        metrics = Mock()
        monkeypatch.setattr(audit.celery_app, "_ksu_metrics", metrics)
        async with factory.begin() as session:
            await session.execute(audit.audit_relay.update().values(available_at=sa.func.now() - timedelta(seconds=180)))
        await audit._observe_pending()
        age = next(call.args[1] for call in metrics.gauge.call_args_list if call.args[0] == "audit.relay.ready_age")
        assert age >= 180
        metrics.gauge.assert_any_call("audit.relay.retained_failure", 0, tags={"service": "research"})
        async with PooledIntegrationClient(transport=httpx.MockTransport(handler)) as pool:
            monkeypatch.setattr("ksu_common.internal_client.get_integration_pool", lambda: pool)
            assert await audit._relay_pending() == 1
            assert await audit._relay_pending() == 0
        assert received == [event]
        metrics.reset_mock()
        await audit._observe_pending()
        metrics.gauge.assert_any_call("audit.relay.ready_age", 0, tags={"service": "research"})
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()
