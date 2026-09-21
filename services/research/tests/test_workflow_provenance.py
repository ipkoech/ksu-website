import importlib.util
import os
import time
from pathlib import Path
from uuid import uuid4

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations
from fastapi import HTTPException
from ksu_common.auth import TokenPayload
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Partner
from app.models.workflow import ResearchWorkflowEvent
from app.routes.v1.workflow import workflow_history
from app.schemas.partnership import PartnerCreate
from app.services.partnership import PartnerService
from app.services.research_workflow_commands import create_editorial_record, transition_record


@pytest.mark.asyncio
async def test_workflow_state_and_provenance_commit_and_rollback_together(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "workflow_" + uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0,
                                 execution_options={"schema_translate_map": {"research": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    record_id = uuid4()
    actor = TokenPayload("real-actor", "real-session", raw={"mfa_enabled": True, "mfa_verified_at": time.time(), "scope_grants": [
        {"scope_type": "research_domain", "scope_id": "farm",
         "permissions": ["farm.submit", "farm.review", "farm.publish"]},
    ]})
    foreign = TokenPayload("other", "session", raw={"scope_grants": [
        {"scope_type": "research_domain", "scope_id": "sustainability", "permissions": ["sustainability.view"]},
    ]})
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(Partner.__table__.create)
            await connection.execute(sa.text(f"SET LOCAL search_path TO {schema}"))
            path = Path(__file__).parents[1] / "migrations/versions/20260907_0016_workflow_provenance.py"
            spec = importlib.util.spec_from_file_location("provenance_migration", path)
            migration = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(migration)

            def upgrade(sync):
                monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
                migration.upgrade()

            await connection.run_sync(upgrade)
        async with sessions.begin() as db:
            db.add(Partner(id=record_id, name="Partner", slug="partner", partner_type="community",
                           status="draft", is_active=False))
        with pytest.raises(RuntimeError):
            async with sessions.begin() as db:
                await transition_record(db, actor, "partners", Partner, record_id, "pending", note="Rolled back")
                raise RuntimeError("Simulated transaction failure")
        async with sessions() as db:
            assert await db.scalar(sa.select(Partner.status)) == "draft"
            assert await db.scalar(sa.select(sa.func.count()).select_from(ResearchWorkflowEvent)) == 0
        async with sessions.begin() as db:
            await transition_record(db, actor, "partners", Partner, record_id, "pending", note="Please review evidence")
        async with sessions() as db:
            history = await workflow_history("partners", record_id, page=1, per_page=25, db=db, user=actor)
            event = history["data"][0]
            assert event.actor_id == "real-actor"
            assert event.note == "Please review evidence"
            assert event.previous_state == "draft" and event.target_state == "pending"
            with pytest.raises(HTTPException) as denied:
                await workflow_history("partners", record_id, page=1, per_page=25, db=db, user=foreign)
            assert denied.value.status_code == 403
        with pytest.raises(RuntimeError):
            async with sessions.begin() as db:
                await create_editorial_record(db, actor, "partners", PartnerService,
                                              PartnerCreate(name="Rolled back", slug="rolled-back", partner_type="community"))
                raise RuntimeError("Simulated creation failure")
        async with sessions() as db:
            assert await db.scalar(sa.select(sa.func.count()).select_from(Partner)) == 1
            assert await db.scalar(sa.select(sa.func.count()).select_from(ResearchWorkflowEvent)) == 1
        async with sessions.begin() as db:
            created = await create_editorial_record(db, actor, "partners", PartnerService,
                                                    PartnerCreate(name="Created", slug="created", partner_type="community"))
            created_id = created.id
        async with sessions() as db:
            event = await db.scalar(sa.select(ResearchWorkflowEvent).where(ResearchWorkflowEvent.resource_id == created_id))
            assert event.previous_state == "absent"
            assert event.actor_id == actor.sub
            assert event.target_state == "published"
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
