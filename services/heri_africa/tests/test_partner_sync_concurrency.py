import asyncio
import os
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from ksu_common.auth import TokenPayload
from fastapi import HTTPException
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models.audit import AuditLog
from app.models.partners import Partner
from app.services import partner_sync as routes


@pytest.mark.asyncio
async def test_competing_syncs_create_one_projection_and_preserve_local_fields(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "heri_sync_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"heri": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    source_id = uuid4()
    source = {"id": str(source_id), "name": "Research partner", "slug": "partner"}
    monkeypatch.setattr(routes, "get_settings", lambda: SimpleNamespace(RESEARCH_SERVICE_API_KEY="test"))
    monkeypatch.setattr(routes, "_fetch_partner_snapshot", AsyncMock(return_value=([source], {})))
    actor = TokenPayload(str(uuid4()), "session", raw={
        "scope_grants": [{"scope_type": "heri", "scope_id": "heri", "permissions": ["heri.integrations.sync"]}],
        "mfa_enabled": True, "mfa_verified_at": time.time(),
    })
    async def sync():
        async with sessions.begin() as db:
            return await routes.sync_partners(db, actor=actor)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Partner, AuditLog):
                await conn.run_sync(model.__table__.create)
        results = await asyncio.wait_for(asyncio.gather(sync(), sync()), 10)
        assert sorted(result["created"] for result in results) == [0, 1]
        assert sorted(result["updated"] for result in results) == [0, 1]
        async with sessions.begin() as db:
            assert await db.scalar(sa.select(sa.func.count()).select_from(Partner)) == 1
            await db.execute(sa.update(Partner).values(relationship_notes="Local note", display_order=7))
        source["name"] = "Updated Research name"
        await sync()
        async with sessions() as db:
            partner = await db.scalar(sa.select(Partner))
            assert (partner.name, partner.relationship_notes, partner.display_order) == ("Updated Research name", "Local note", 7)
            assert set((await db.scalars(sa.select(AuditLog.actor_id))).all()) == {actor.sub}
        async with sessions.begin() as db:
            db.add(Partner(slug="local", name="Local partner", is_active=True))
        monkeypatch.setattr(routes, "_fetch_partner_snapshot", AsyncMock(return_value=([], {})))
        removed = await sync()
        assert removed["deactivated"] == 1
        assert (await sync())["deactivated"] == 0
        async with sessions() as db:
            projection = await db.scalar(sa.select(Partner).where(Partner.research_partner_id == source_id))
            assert projection.is_active is False and projection.relationship_notes == "Local note"
            assert await db.scalar(sa.select(Partner.is_active).where(Partner.research_partner_id.is_(None))) is True
        monkeypatch.setattr(routes, "_fetch_partner_snapshot", AsyncMock(return_value=([source], {})))
        assert (await sync())["updated"] == 1
        async with sessions() as db:
            projection = await db.scalar(sa.select(Partner).where(Partner.research_partner_id == source_id))
            assert projection.is_active is True and projection.relationship_notes == "Local note"
        async with sessions.begin() as holder:
            await holder.execute(sa.text("SELECT pg_advisory_xact_lock(1263752521)"))
            with pytest.raises(HTTPException) as busy:
                await asyncio.wait_for(sync(), 8)
            assert busy.value.status_code == 503
            assert busy.value.headers == {"Retry-After": "5"}
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
