"""Services for library guides, specialists, workflows, and policy pages."""

from __future__ import annotations

import uuid
from typing import Any, Sequence

import sqlalchemy as sa
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_loader_criteria

from ksu_common.pagination import PaginatedResult, paginate

from ..models import (
    Library,
    LibraryGuide,
    LibraryGuideSection,
    LibraryPolicyPage,
    LibrarySpecialist,
    LibraryWorkflow,
    LibraryWorkflowStep,
)
from ..schemas import (
    LibraryGuideCreate,
    LibraryGuideSectionCreate,
    LibraryGuideSectionUpdate,
    LibraryGuideUpdate,
    LibraryPolicyPageCreate,
    LibraryPolicyPageUpdate,
    LibrarySpecialistCreate,
    LibrarySpecialistUpdate,
    LibraryWorkflowCreate,
    LibraryWorkflowStepCreate,
    LibraryWorkflowStepUpdate,
    LibraryWorkflowUpdate,
)


def _public_parent_filter(model: type) -> Any:
    return sa.or_(
        model.library_id.is_(None),
        sa.select(Library.id)
        .where(
            Library.id == model.library_id,
            Library.is_active.is_(True),
            Library.is_public.is_(True),
            Library.deleted_at.is_(None),
        )
        .exists(),
    )


def _updates(data: BaseModel) -> dict[str, Any]:
    return data.model_dump(exclude_unset=True)


def public_guides_query():
    return LibraryGuide.active_query().where(
        LibraryGuide.is_public.is_(True),
        LibraryGuide.is_active.is_(True),
        _public_parent_filter(LibraryGuide),
    )


def public_specialists_query():
    return LibrarySpecialist.active_query().where(
        LibrarySpecialist.is_public.is_(True),
        LibrarySpecialist.is_active.is_(True),
        _public_parent_filter(LibrarySpecialist),
    )


def public_workflows_query():
    return LibraryWorkflow.active_query().where(
        LibraryWorkflow.is_public.is_(True),
        LibraryWorkflow.is_active.is_(True),
        _public_parent_filter(LibraryWorkflow),
    )


def public_policy_pages_query():
    return LibraryPolicyPage.active_query().where(
        LibraryPolicyPage.is_public.is_(True),
        LibraryPolicyPage.status == "active",
        _public_parent_filter(LibraryPolicyPage),
    )


async def list_guides(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    guide_type: str | None = None,
    subject: str | None = None,
    course_code: str | None = None,
    audience: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    load_options: Sequence = (),
    public_only: bool = True,
) -> PaginatedResult:
    query = public_guides_query() if public_only else LibraryGuide.active_query()
    if library_id is not None:
        query = query.where(LibraryGuide.library_id == library_id)
    if guide_type is not None:
        query = query.where(LibraryGuide.guide_type == guide_type)
    if subject is not None:
        query = query.where(LibraryGuide.subject == subject)
    if course_code is not None:
        query = query.where(LibraryGuide.course_code == course_code)
    if audience is not None:
        query = query.where(LibraryGuide.audience == audience)
    if load_options:
        query = query.options(*load_options)
    query = query.order_by(LibraryGuide.sort_order, LibraryGuide.title)
    return await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )


async def get_guide_by_slug(
    db: AsyncSession,
    slug: str,
    *,
    load_options: Sequence = (),
    public_only: bool = True,
) -> LibraryGuide:
    query = (public_guides_query() if public_only else LibraryGuide.active_query()).where(
        LibraryGuide.slug == slug
    )
    query = query.options(
        selectinload(LibraryGuide.sections),
        with_loader_criteria(
            LibraryGuideSection, LibraryGuideSection.is_active.is_(True)
        ),
    )
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    guide = result.scalar_one_or_none()
    if guide is None:
        raise ValueError("Library guide not found")
    return guide


async def get_guide_entity(db: AsyncSession, guide_id: uuid.UUID) -> LibraryGuide:
    return await LibraryGuide.get_or_raise(db, guide_id, error_message="Library guide not found")


async def create_guide(db: AsyncSession, data: LibraryGuideCreate) -> LibraryGuide:
    guide = LibraryGuide(**data.model_dump())
    db.add(guide)
    await db.commit()
    await db.refresh(guide)
    return guide


async def update_guide(
    db: AsyncSession, guide_id: uuid.UUID, data: LibraryGuideUpdate
) -> LibraryGuide:
    guide = await get_guide_entity(db, guide_id)
    for field, value in _updates(data).items():
        setattr(guide, field, value)
    await db.commit()
    await db.refresh(guide)
    return guide


async def delete_guide(db: AsyncSession, guide_id: uuid.UUID) -> None:
    guide = await get_guide_entity(db, guide_id)
    guide.soft_delete()
    await db.commit()


async def list_guide_sections(
    db: AsyncSession,
    *,
    guide_id: uuid.UUID | None = None,
    section_type: str | None = None,
    is_active: bool | None = None,
) -> list[LibraryGuideSection]:
    query = LibraryGuideSection.active_query()
    if guide_id is not None:
        query = query.where(LibraryGuideSection.guide_id == guide_id)
    if section_type is not None:
        query = query.where(LibraryGuideSection.section_type == section_type)
    if is_active is not None:
        query = query.where(LibraryGuideSection.is_active.is_(is_active))
    query = query.order_by(LibraryGuideSection.sort_order, LibraryGuideSection.heading)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_guide_section_entity(
    db: AsyncSession, section_id: uuid.UUID
) -> LibraryGuideSection:
    return await LibraryGuideSection.get_or_raise(
        db, section_id, error_message="Library guide section not found"
    )


async def create_guide_section(
    db: AsyncSession, data: LibraryGuideSectionCreate
) -> LibraryGuideSection:
    section = LibraryGuideSection(**data.model_dump())
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return section


async def update_guide_section(
    db: AsyncSession, section_id: uuid.UUID, data: LibraryGuideSectionUpdate
) -> LibraryGuideSection:
    section = await get_guide_section_entity(db, section_id)
    for field, value in _updates(data).items():
        setattr(section, field, value)
    await db.commit()
    await db.refresh(section)
    return section


async def delete_guide_section(db: AsyncSession, section_id: uuid.UUID) -> None:
    section = await get_guide_section_entity(db, section_id)
    section.soft_delete()
    await db.commit()


async def list_specialists(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    subject: str | None = None,
    school: str | None = None,
    department: str | None = None,
    public_only: bool = True,
) -> list[LibrarySpecialist]:
    query = (
        public_specialists_query()
        if public_only
        else LibrarySpecialist.active_query()
    )
    if library_id is not None:
        query = query.where(LibrarySpecialist.library_id == library_id)
    if subject is not None:
        query = query.where(LibrarySpecialist.subjects.contains([subject]))
    if school is not None:
        query = query.where(LibrarySpecialist.schools.contains([school]))
    if department is not None:
        query = query.where(LibrarySpecialist.departments.contains([department]))
    query = query.order_by(LibrarySpecialist.sort_order, LibrarySpecialist.created_at)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_specialist_entity(
    db: AsyncSession, specialist_id: uuid.UUID
) -> LibrarySpecialist:
    return await LibrarySpecialist.get_or_raise(
        db, specialist_id, error_message="Library specialist not found"
    )


async def create_specialist(
    db: AsyncSession, data: LibrarySpecialistCreate
) -> LibrarySpecialist:
    specialist = LibrarySpecialist(**data.model_dump())
    db.add(specialist)
    await db.commit()
    await db.refresh(specialist)
    return specialist


async def update_specialist(
    db: AsyncSession, specialist_id: uuid.UUID, data: LibrarySpecialistUpdate
) -> LibrarySpecialist:
    specialist = await get_specialist_entity(db, specialist_id)
    for field, value in _updates(data).items():
        setattr(specialist, field, value)
    await db.commit()
    await db.refresh(specialist)
    return specialist


async def delete_specialist(db: AsyncSession, specialist_id: uuid.UUID) -> None:
    specialist = await get_specialist_entity(db, specialist_id)
    specialist.soft_delete()
    await db.commit()


async def list_workflows(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    workflow_type: str | None = None,
    audience: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    load_options: Sequence = (),
    public_only: bool = True,
) -> PaginatedResult:
    query = public_workflows_query() if public_only else LibraryWorkflow.active_query()
    if library_id is not None:
        query = query.where(LibraryWorkflow.library_id == library_id)
    if workflow_type is not None:
        query = query.where(LibraryWorkflow.workflow_type == workflow_type)
    if audience is not None:
        query = query.where(LibraryWorkflow.audience == audience)
    if load_options:
        query = query.options(*load_options)
    query = query.order_by(LibraryWorkflow.sort_order, LibraryWorkflow.title)
    return await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )


async def get_workflow_by_slug(
    db: AsyncSession,
    slug: str,
    *,
    load_options: Sequence = (),
    public_only: bool = True,
) -> LibraryWorkflow:
    query = (
        public_workflows_query() if public_only else LibraryWorkflow.active_query()
    ).where(LibraryWorkflow.slug == slug)
    query = query.options(
        selectinload(LibraryWorkflow.steps),
        with_loader_criteria(
            LibraryWorkflowStep, LibraryWorkflowStep.is_active.is_(True)
        ),
    )
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise ValueError("Library workflow not found")
    return workflow


async def get_workflow_entity(
    db: AsyncSession, workflow_id: uuid.UUID
) -> LibraryWorkflow:
    return await LibraryWorkflow.get_or_raise(
        db, workflow_id, error_message="Library workflow not found"
    )


async def create_workflow(
    db: AsyncSession, data: LibraryWorkflowCreate
) -> LibraryWorkflow:
    workflow = LibraryWorkflow(**data.model_dump())
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    return workflow


async def update_workflow(
    db: AsyncSession, workflow_id: uuid.UUID, data: LibraryWorkflowUpdate
) -> LibraryWorkflow:
    workflow = await get_workflow_entity(db, workflow_id)
    for field, value in _updates(data).items():
        setattr(workflow, field, value)
    await db.commit()
    await db.refresh(workflow)
    return workflow


async def delete_workflow(db: AsyncSession, workflow_id: uuid.UUID) -> None:
    workflow = await get_workflow_entity(db, workflow_id)
    workflow.soft_delete()
    await db.commit()


async def list_workflow_steps(
    db: AsyncSession,
    *,
    workflow_id: uuid.UUID | None = None,
    is_active: bool | None = None,
) -> list[LibraryWorkflowStep]:
    query = LibraryWorkflowStep.active_query()
    if workflow_id is not None:
        query = query.where(LibraryWorkflowStep.workflow_id == workflow_id)
    if is_active is not None:
        query = query.where(LibraryWorkflowStep.is_active.is_(is_active))
    query = query.order_by(LibraryWorkflowStep.sort_order, LibraryWorkflowStep.title)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_workflow_step_entity(
    db: AsyncSession, step_id: uuid.UUID
) -> LibraryWorkflowStep:
    return await LibraryWorkflowStep.get_or_raise(
        db, step_id, error_message="Library workflow step not found"
    )


async def create_workflow_step(
    db: AsyncSession, data: LibraryWorkflowStepCreate
) -> LibraryWorkflowStep:
    step = LibraryWorkflowStep(**data.model_dump())
    db.add(step)
    await db.commit()
    await db.refresh(step)
    return step


async def update_workflow_step(
    db: AsyncSession, step_id: uuid.UUID, data: LibraryWorkflowStepUpdate
) -> LibraryWorkflowStep:
    step = await get_workflow_step_entity(db, step_id)
    for field, value in _updates(data).items():
        setattr(step, field, value)
    await db.commit()
    await db.refresh(step)
    return step


async def delete_workflow_step(db: AsyncSession, step_id: uuid.UUID) -> None:
    step = await get_workflow_step_entity(db, step_id)
    step.soft_delete()
    await db.commit()


async def list_policy_pages(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    policy_type: str | None = None,
    status: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    load_options: Sequence = (),
    public_only: bool = True,
) -> PaginatedResult:
    query = public_policy_pages_query() if public_only else LibraryPolicyPage.active_query()
    if library_id is not None:
        query = query.where(LibraryPolicyPage.library_id == library_id)
    if policy_type is not None:
        query = query.where(LibraryPolicyPage.policy_type == policy_type)
    if status is not None and not public_only:
        query = query.where(LibraryPolicyPage.status == status)
    if load_options:
        query = query.options(*load_options)
    query = query.order_by(LibraryPolicyPage.sort_order, LibraryPolicyPage.title)
    return await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )


async def get_policy_page_by_slug(
    db: AsyncSession,
    slug: str,
    *,
    load_options: Sequence = (),
    public_only: bool = True,
) -> LibraryPolicyPage:
    query = (
        public_policy_pages_query()
        if public_only
        else LibraryPolicyPage.active_query()
    ).where(LibraryPolicyPage.slug == slug)
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    policy_page = result.scalar_one_or_none()
    if policy_page is None:
        raise ValueError("Library policy page not found")
    return policy_page


async def get_policy_page_entity(
    db: AsyncSession, policy_page_id: uuid.UUID
) -> LibraryPolicyPage:
    return await LibraryPolicyPage.get_or_raise(
        db, policy_page_id, error_message="Library policy page not found"
    )


async def create_policy_page(
    db: AsyncSession, data: LibraryPolicyPageCreate
) -> LibraryPolicyPage:
    policy_page = LibraryPolicyPage(**data.model_dump())
    db.add(policy_page)
    await db.commit()
    await db.refresh(policy_page)
    return policy_page


async def update_policy_page(
    db: AsyncSession, policy_page_id: uuid.UUID, data: LibraryPolicyPageUpdate
) -> LibraryPolicyPage:
    policy_page = await get_policy_page_entity(db, policy_page_id)
    for field, value in _updates(data).items():
        setattr(policy_page, field, value)
    await db.commit()
    await db.refresh(policy_page)
    return policy_page


async def delete_policy_page(db: AsyncSession, policy_page_id: uuid.UUID) -> None:
    policy_page = await get_policy_page_entity(db, policy_page_id)
    policy_page.soft_delete()
    await db.commit()
