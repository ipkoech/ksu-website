import os
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Library, LibraryGuide, LibraryGuideSection, LibraryGuideSpecialist, LibrarySpecialist, LibraryStaff, LibraryWorkflow, LibraryWorkflowStep
from app.schemas import LibraryGuideCreate, LibraryGuideUpdate, LibrarySpecialistCreate, LibrarySpecialistUpdate
from app.services.engagement import create_guide, create_specialist, list_guides, list_workflows, update_guide, update_specialist
from app.schemas.assistant import LibraryAssistantSourceCreate
from app.services.assistant_source_policy import validate_sources
from app.models import LibraryAssistantContext, LibraryAssistantContextSource
from app.services.assistant_contexts import list_contexts


@pytest.mark.asyncio
async def test_guide_relationships_and_transfers_enforce_same_branch():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "guide_relationships_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    branches, staff_ids = [uuid4(), uuid4()], [uuid4(), uuid4()]
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, LibraryStaff, LibrarySpecialist, LibraryGuide, LibraryGuideSection, LibraryGuideSpecialist, LibraryWorkflow, LibraryWorkflowStep, LibraryAssistantContext, LibraryAssistantContextSource):
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            for index, branch in enumerate(branches):
                await db.execute(sa.insert(Library).values(id=branch, name=f"Branch {index}", slug=f"branch-{index}", is_public=True))
                await db.execute(sa.insert(LibraryStaff).values(id=staff_ids[index], library_id=branch, person_id=uuid4()))
            specialist = await create_specialist(db, LibrarySpecialistCreate(library_id=branches[0], staff_id=staff_ids[0]))
            with pytest.raises(ValueError, match="Staff reference"):
                await create_specialist(db, LibrarySpecialistCreate(library_id=branches[0], staff_id=staff_ids[1]))
            guide = await create_guide(db, LibraryGuideCreate(
                library_id=branches[0], title="Guide", slug="guide", guide_type="subject", specialist_ids=[specialist.id], owner_staff_id=staff_ids[0],
                sections=[{"heading": "Overview", "content": "Content", "guide_id": uuid4()}],
            ))
            assert guide.sections[0].guide_id == guide.id
            await db.execute(sa.update(LibraryGuideSection).values(is_active=False))
            await db.execute(sa.update(LibrarySpecialist).values(is_public=False))
            workflow_id = uuid4()
            await db.execute(sa.insert(LibraryWorkflow).values(
                id=workflow_id, library_id=branches[0], title="Workflow", slug="workflow", workflow_type="general",
            ))
            for active in (True, False):
                await db.execute(sa.insert(LibraryWorkflowStep).values(
                    workflow_id=workflow_id, title="Step", instructions="Instructions", is_active=active,
                ))
            context_id = uuid4()
            await db.execute(sa.insert(LibraryAssistantContext).values(
                id=context_id, library_id=branches[0], name="Context", slug="context", status="active", is_public=True,
            ))
            for source_type, source_id in (("guide", guide.id), ("specialist", specialist.id)):
                await db.execute(sa.insert(LibraryAssistantContextSource).values(
                    context_id=context_id, source_type=source_type, source_id=source_id, title="Approved earlier", is_approved=True,
                ))
        async with sessions() as db:
            public = (await list_guides(db, library_id=branches[0], public_only=True)).items[0]
            private = (await list_guides(db, library_id=branches[0], public_only=False)).items[0]
            assert public.sections == public.specialists == []
            assert len(private.sections) == len(private.specialists) == 1
            public_flow = (await list_workflows(db, library_id=branches[0], public_only=True)).items[0]
            private_flow = (await list_workflows(db, library_id=branches[0], public_only=False)).items[0]
            assert len(public_flow.steps) == 1 and len(private_flow.steps) == 2
            source = LibraryAssistantSourceCreate(source_type="guide", source_id=guide.id, title="Guide")
            await validate_sources(db, branches[0], [source], public_only=True)
            with pytest.raises(ValueError, match="authorized branch"):
                await validate_sources(db, branches[1], [source])
            with pytest.raises(ValueError, match="duplicate"):
                await validate_sources(db, branches[0], [source, source])
            private_source = LibraryAssistantSourceCreate(source_type="specialist", source_id=specialist.id, title="Private")
            await validate_sources(db, branches[0], [private_source])
            with pytest.raises(ValueError, match="publication visibility"):
                await validate_sources(db, branches[0], [private_source], public_only=True)
            contexts = await list_contexts(db, public_only=True)
            assert [source["source_type"] for source in contexts[0]["sources"]] == ["guide"]
            await db.execute(sa.update(LibraryGuide).where(LibraryGuide.id == guide.id).values(is_public=False))
            assert (await list_contexts(db, public_only=True))[0]["sources"] == []
            await db.execute(sa.update(Library).where(Library.id == branches[0]).values(is_public=False))
            assert await list_contexts(db, public_only=True) == []
        async with sessions.begin() as db:
            with pytest.raises(ValueError, match="Staff reference"):
                await update_guide(db, guide.id, LibraryGuideUpdate(library_id=branches[1]))
            with pytest.raises(ValueError, match="Guide specialists"):
                await update_guide(db, guide.id, LibraryGuideUpdate(library_id=branches[1], owner_staff_id=None))
            with pytest.raises(ValueError, match="only once"):
                await update_guide(db, guide.id, LibraryGuideUpdate(specialist_ids=[specialist.id, specialist.id]))
            with pytest.raises(ValueError, match="linked guides"):
                await update_specialist(db, specialist.id, LibrarySpecialistUpdate(library_id=branches[1], staff_id=None))
            # Explicitly reconcile references in the same update before moving.
            moved = await update_guide(db, guide.id, LibraryGuideUpdate(
                library_id=branches[1], owner_staff_id=staff_ids[1], specialist_ids=[],
            ))
            assert moved.library_id == branches[1]
            assert moved.specialists == []
            moved_specialist = await update_specialist(db, specialist.id, LibrarySpecialistUpdate(
                library_id=branches[1], staff_id=staff_ids[1],
            ))
            assert moved_specialist.library_id == branches[1]
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
