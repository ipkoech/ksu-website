import asyncio
import os
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
import sqlalchemy as sa
from fastapi import APIRouter, Depends, FastAPI
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from ksu_common.response_validation import install_strict_response_validation

from app.api.v1 import _idempotency as policy
from app.models.idempotency import CommandIdempotency
from app.routes.v1 import internal


@pytest.mark.asyncio
async def test_email_handoff_retries_failure_and_replays_committed_success(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "email_replay_" + uuid4().hex
    engine = create_async_engine(url, connect_args={"server_settings": {"search_path": f"{schema},public"}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(policy, "AsyncSessionLocal", sessions)
    sender = AsyncMock(side_effect=[RuntimeError("synthetic transport failure"), "smtp-message-id"])
    monkeypatch.setattr(internal, "send_email", sender)
    app = FastAPI()
    app.include_router(internal.router, prefix="/api/v1/internal")
    app.dependency_overrides[internal.verify_internal_key] = lambda: None
    async def database():
        async with sessions.begin() as db:
            yield db
    app.dependency_overrides[internal.get_db] = database
    executed = []
    authorized = []
    def authorize():
        authorized.append(True)
    nested = APIRouter()
    @nested.post("/command", dependencies=[Depends(authorize)], response_model=dict[str, int])
    async def command(body: dict):
        executed.append(body)
        return {"sequence": len(executed)}
    outer = APIRouter()
    outer.include_router(nested, prefix="/nested")
    app.include_router(outer, prefix="/test")
    install_strict_response_validation(app.routes)
    policy.install_main_idempotency(app.routes)
    headers = {"X-Internal-Key": "disposable-service-key", "Idempotency-Key": str(uuid4())}
    payload = {"to_email": "disposable@example.org", "subject": "Test", "text_body": "Synthetic message"}
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.run_sync(CommandIdempotency.__table__.create)
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test") as client:
            first = await client.post("/api/v1/internal/email/send", headers=headers, json=payload)
            assert first.status_code == 500
            async with sessions() as db:
                assert await db.scalar(sa.select(sa.func.count()).select_from(CommandIdempotency)) == 0
            client._transport.raise_app_exceptions = True
            results = await asyncio.gather(*(client.post("/api/v1/internal/email/send", headers=headers, json=payload) for _ in range(2)))
            assert [response.status_code for response in results] == [200, 200]
            assert all(response.json() == {"provider_id": "smtp-message-id"} for response in results)
            assert sender.await_count == 2
            conflict = await client.post("/api/v1/internal/email/send", headers=headers, json={**payload, "subject": "Different"})
            assert conflict.status_code == 409 and sender.await_count == 2
            for _ in range(2):
                response = await client.post("/test/nested/command", headers=headers, json={"value": 1})
                assert response.status_code == 200, response.text
                assert response.json() == {"sequence": 1}
            assert len(executed) == 1 and len(authorized) == 2
            # No new mandatory header for existing clients.
            response = await client.post("/test/nested/command", json={"value": 2})
            assert response.status_code == 200 and response.json() == {"sequence": 2}
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
