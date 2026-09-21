import asyncio
import os
import time
from types import SimpleNamespace
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
import sqlalchemy as sa
from fastapi import HTTPException
from ksu_common.auth import TokenPayload
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models.audit import AuditLog
from app.models.content import NewsArticle, Page, PageSection, PublicationStatus, ResearchProject, ResearchPublication, ResearchTheme
from app.services.workflow import transition_record


@pytest.mark.asyncio
async def test_competing_transitions_recheck_locked_state_and_audit_actor():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "heri_workflow_" + uuid4().hex
    engine = create_async_engine(url, connect_args={"server_settings": {"search_path": f"{schema},public"}}, execution_options={"schema_translate_map": {"heri": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    actor = TokenPayload(str(uuid4()), "session", raw={
        "scope_grants": [{"scope_type": "heri", "scope_id": "heri", "permissions": ["heri.content.publish"]}],
        "mfa_enabled": True, "mfa_verified_at": time.time(),
    })
    identifier = uuid4()
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (NewsArticle, AuditLog, Page, PageSection, ResearchTheme, ResearchProject, ResearchPublication):
                await conn.run_sync(lambda connection, table=model.__table__: table.create(connection, checkfirst=True))
        async with sessions.begin() as db:
            db.add(NewsArticle(id=identifier, title="Test", slug="test", status=PublicationStatus.APPROVED))
        async def publish():
            try:
                async with sessions.begin() as db:
                    await transition_record(db, NewsArticle, identifier, "published", actor=actor, entity_type="news")
                return "published"
            except HTTPException as exc:
                return exc.status_code
        results = await asyncio.wait_for(asyncio.gather(publish(), publish()), 10)
        assert sorted(map(str, results)) == ["422", "published"]
        async with sessions() as db:
            assert await db.scalar(sa.select(NewsArticle.status)) == PublicationStatus.PUBLISHED
            events = (await db.scalars(sa.select(AuditLog))).all()
            assert len(events) == 1
            assert events[0].actor_id == actor.sub
            assert events[0].previous_value == {"status": "approved"}
        from app.routes.v1 import admin_content, admin_resources
        from app.schemas.admin_content import NewsUpdate
        request = SimpleNamespace(client=None)
        async with sessions.begin() as db:
            theme = await admin_resources.create_resource("themes", {
                "slug": "draft-theme", "name": "Draft theme", "status": "published",
            }, request, db, actor)
            assert theme.status is PublicationStatus.DRAFT
            from app.services.public import is_public_record
            assert not is_public_record(theme)
            theme_id = theme.id
        for resource in ("projects", "publications"):
            async with sessions.begin() as db:
                with pytest.raises(HTTPException) as missing_theme:
                    await admin_resources.create_resource(resource, {
                        "slug": resource, "title": "Test", "theme_id": str(uuid4()),
                    }, request, db, actor)
                assert missing_theme.value.status_code == 422
                child = await admin_resources.create_resource(resource, {
                    "slug": resource, "title": "Test", "theme_id": str(theme_id),
                }, request, db, actor)
                child_id = child.id
            async with sessions.begin() as db:
                with pytest.raises(HTTPException) as linked_theme:
                    await admin_resources.delete_resource("themes", theme_id, request, db, actor)
                assert linked_theme.value.status_code == 409
                await admin_resources.update_resource(resource, child_id, {"theme_id": None}, request, db, actor)
        async with sessions.begin() as db:
            await admin_resources.delete_resource("themes", theme_id, request, db, actor)
        async with sessions.begin() as db:
            with pytest.raises(HTTPException) as deleted_theme:
                await admin_resources.update_resource("publications", child_id, {"theme_id": str(theme_id)}, request, db, actor)
            assert deleted_theme.value.status_code == 422
        async with sessions.begin() as db:
            for command in (
                lambda: admin_content.update_news(identifier, NewsUpdate(title="Changed"), request, db, actor),
                lambda: admin_resources.update_resource("news", identifier, {"title": "Changed"}, request, db, actor),
                lambda: admin_resources.delete_resource("news", identifier, request, db, actor),
            ):
                with pytest.raises(HTTPException) as denied_edit:
                    await command()
                assert denied_edit.value.status_code == 409
            assert await db.scalar(sa.select(NewsArticle.title)) == "Test"
        page_id = uuid4()
        async with sessions.begin() as db:
            db.add(Page(id=page_id, slug="page", title="Page", status=PublicationStatus.DRAFT))
        async with sessions.begin() as db:
            section = await admin_resources.create_resource("page-sections", {
                "page_id": str(page_id), "section_type": "text", "position": 1,
            }, request, db, actor)
            section_id = section.id
        async with sessions.begin() as db:
            with pytest.raises(HTTPException) as moved:
                await admin_resources.update_resource("page-sections", section_id, {
                    "page_id": str(uuid4()),
                }, request, db, actor)
            assert moved.value.status_code == 422
            await db.execute(sa.update(Page).values(status=PublicationStatus.PUBLISHED))
        async with sessions.begin() as db:
            for command in (
                lambda: admin_resources.create_resource("page-sections", {
                    "page_id": str(page_id), "section_type": "text",
                }, request, db, actor),
                lambda: admin_resources.update_resource("page-sections", section_id, {"position": 2}, request, db, actor),
                lambda: admin_resources.delete_resource("page-sections", section_id, request, db, actor),
            ):
                with pytest.raises(HTTPException) as denied_section:
                    await command()
                assert denied_section.value.status_code == 409
            assert await db.scalar(sa.select(PageSection.position)) == 1
            readable = await admin_resources.get_resource("page-sections", section_id, db, actor)
            assert readable.id == section_id
        # A section editor holding an old draft object must wait for the parent
        # transition and recheck the committed state instead of using that object.
        async with sessions.begin() as db:
            await db.execute(sa.update(Page).values(status=PublicationStatus.DRAFT))
        loaded, proceed = asyncio.Event(), asyncio.Event()
        async def stale_section_edit():
            async with sessions.begin() as db:
                stale_page = await db.get(Page, page_id)
                assert stale_page.status is PublicationStatus.DRAFT
                loaded.set()
                await proceed.wait()
                try:
                    await admin_resources.update_resource("page-sections", section_id, {"position": 3}, request, db, actor)
                except HTTPException as exc:
                    return exc.status_code
                return 200
        editor = asyncio.create_task(stale_section_edit())
        try:
            await asyncio.wait_for(loaded.wait(), 2)
            actor.raw["scope_grants"][0]["permissions"].append("heri.content.submit")
            async with sessions.begin() as db:
                await transition_record(db, Page, page_id, "in_review", actor=actor, entity_type="pages")
                proceed.set()
                with pytest.raises(TimeoutError):
                    await asyncio.wait_for(asyncio.shield(editor), 0.1)
            assert await asyncio.wait_for(editor, 2) == 409
            async with sessions() as db:
                assert await db.scalar(sa.select(PageSection.position)) == 1
        finally:
            if not editor.done():
                editor.cancel()
            await asyncio.gather(editor, return_exceptions=True)
        actor.raw["scope_grants"][0]["permissions"].append("heri.content.schedule")
        scheduled_id = uuid4()
        due = datetime.now(timezone.utc) + timedelta(days=1)
        async with sessions.begin() as db:
            draft = await admin_resources.create_resource("news", {
                "slug": "typed-draft", "title": "Typed draft", "scheduled_at": due.isoformat(),
            }, request, db, actor)
            draft_id = draft.id
        async with sessions.begin() as db:
            source = await db.scalar(sa.select(AuditLog).where(AuditLog.entity_id == str(draft_id)))
            await admin_resources.update_resource("news", draft_id, {"scheduled_at": None}, request, db, actor)
            restored = await admin_resources.restore_resource("news", draft_id, {
                "audit_id": str(source.id), "direction": "new",
            }, request, db, actor)
            assert restored.scheduled_at == due
        async with sessions() as db:
            assert await db.scalar(sa.select(NewsArticle.scheduled_at).where(NewsArticle.id == draft_id)) == due
        async with sessions.begin() as db:
            db.add(NewsArticle(id=scheduled_id, title="Scheduled", slug="scheduled", status=PublicationStatus.APPROVED))
        async with sessions.begin() as db:
            with pytest.raises(HTTPException) as missing_time:
                await transition_record(db, NewsArticle, scheduled_id, "scheduled", actor=actor, entity_type="news")
            assert missing_time.value.status_code == 422
            scheduled = await transition_record(db, NewsArticle, scheduled_id, "scheduled", actor=actor,
                                                entity_type="news", scheduled_at=due.isoformat())
            from app.services.public import is_public_record
            assert not is_public_record(scheduled)
            assert is_public_record(scheduled, now=due)
        async with sessions.begin() as db:
            schedule_audit = await db.scalar(sa.select(AuditLog).where(
                AuditLog.entity_id == str(scheduled_id), AuditLog.action == "transition",
            ))
            cancelled = await admin_resources.restore_resource("news", scheduled_id, {
                "audit_id": str(schedule_audit.id), "direction": "previous",
            }, request, db, actor)
            assert cancelled.scheduled_at is None
            assert not is_public_record(cancelled, now=due)
        async with sessions() as db:
            restored_audit = await db.scalar(sa.select(AuditLog).where(
                AuditLog.entity_id == str(scheduled_id), AuditLog.action == "restore",
            ))
            assert restored_audit.previous_value["scheduled_at"] == due.isoformat()
            assert restored_audit.new_value["scheduled_at"] is None
            assert restored_audit.actor_id == actor.sub
        actor.raw["scope_grants"][0]["permissions"].append("heri.content.unpublish")
        actor.raw["mfa_verified_at"] = 0
        async with sessions.begin() as db:
            with pytest.raises(HTTPException) as denied:
                await transition_record(db, NewsArticle, identifier, "archived", actor=actor, entity_type="news")
            assert denied.value.status_code == 403
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
