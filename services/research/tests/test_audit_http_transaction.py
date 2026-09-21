import os
import uuid
from unittest.mock import AsyncMock

from fastapi import Depends, HTTPException
import httpx
import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.tasks import audit
from app.models import CommandIdempotency
from ksu_common.database import DatabaseRuntime


@pytest.mark.asyncio
async def test_research_app_audits_the_committed_http_outcome(monkeypatch):
    from app import main

    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "research_http_audit_" + uuid.uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0,
                                 execution_options={"schema_translate_map": {"research": schema}})
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
    monkeypatch.setattr(main, "_after_response", AsyncMock())
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(business.create)
            await connection.run_sync(audit.audit_relay.create)
            await connection.run_sync(CommandIdempotency.__table__.create)
        app = main.create_app()
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            success = await client.post("/_audit_transaction_probe?item=1", headers={"Idempotency-Key": "probe-success"})
            failure = await client.post("/_audit_transaction_probe?item=2&fail=true", headers={"Idempotency-Key": "probe-failure"})
        assert success.status_code == 200 and success.json() == {"id": 1}, success.text
        assert failure.status_code == 409
        async with factory() as session:
            assert (await session.scalars(sa.select(business.c.id))).all() == [1]
            payloads = (await session.scalars(sa.select(audit.audit_relay.c.payload))).all()
            assert sorted(payload["status_code"] for payload in payloads) == [200, 409]
        assert engine.pool.checkedout() == 0
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()
