"""Services for LibraryInquiry, SupportTicket, and LibraryRegulation."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common.pagination import PaginatedResult, paginate

from ..models import (
    ElectronicResource,
    Library,
    LibraryGuide,
    LibraryGuideSection,
    LibraryGuideSpecialist,
    LibraryInquiry,
    LibraryLoan,
    LibraryPolicyPage,
    LibraryRegulation,
    LibraryResource,
    LibrarySpecialist,
    LibraryWorkflow,
    LibraryWorkflowStep,
    SupportTicket,
)
from ..schemas import (
    LibraryGuideCreate,
    LibraryGuideOut,
    LibraryGuideSectionOut,
    LibraryGuideUpdate,
    LibraryInquiryCreate,
    LibraryInquiryOut,
    LibraryInquiryReply,
    LibraryInquiryUpdate,
    LibraryPolicyPageCreate,
    LibraryPolicyPageOut,
    LibraryPolicyPageUpdate,
    LibraryRegulationCreate,
    LibraryRegulationOut,
    LibraryRegulationUpdate,
    LibrarySpecialistCreate,
    LibrarySpecialistOut,
    LibrarySpecialistUpdate,
    LibraryWorkflowCreate,
    LibraryWorkflowOut,
    LibraryWorkflowUpdate,
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketTargetSummary,
    SupportTicketUpdate,
)

_INQUIRY_DETAIL_OPTIONS = (selectinload(LibraryInquiry.library),)
_GUIDE_DETAIL_OPTIONS = (
    selectinload(LibraryGuide.sections),
    selectinload(LibraryGuide.specialists).selectinload(
        LibraryGuideSpecialist.specialist
    ),
)
_WORKFLOW_DETAIL_OPTIONS = (selectinload(LibraryWorkflow.steps),)


def _public_library_parent_filter(model):
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


def _guide_out(guide: LibraryGuide) -> LibraryGuideOut:
    data = {
        "id": guide.id,
        "library_id": guide.library_id,
        "title": guide.title,
        "slug": guide.slug,
        "summary": guide.summary,
        "guide_type": guide.guide_type,
        "subject": guide.subject,
        "course_code": guide.course_code,
        "audience": guide.audience,
        "school_id": guide.school_id,
        "department_id": guide.department_id,
        "owner_staff_id": guide.owner_staff_id,
        "is_public": guide.is_public,
        "is_active": guide.is_active,
        "sort_order": guide.sort_order,
        "sections": [
            LibraryGuideSectionOut.model_validate(section).model_dump()
            for section in guide.sections
            if section.deleted_at is None
        ],
        "specialists": [
        LibrarySpecialistOut.model_validate(link.specialist).model_dump()
        for link in guide.specialists
        if link.specialist is not None and link.specialist.deleted_at is None
        ],
        "created_at": guide.created_at,
        "updated_at": guide.updated_at,
        "deleted_at": guide.deleted_at,
    }
    return LibraryGuideOut.model_validate(data)


def _workflow_out(workflow: LibraryWorkflow) -> LibraryWorkflowOut:
    data = LibraryWorkflowOut.model_validate(workflow).model_dump()
    data["steps"] = [
        step for step in data.get("steps", []) if step.get("deleted_at") is None
    ]
    return LibraryWorkflowOut.model_validate(data)


def _join_summary(parts: list[object | None]) -> str | None:
    values = [str(part) for part in parts if part not in (None, "")]
    return " · ".join(values) if values else None


async def _populate_ticket_targets(
    db: AsyncSession, tickets: list[SupportTicket]
) -> None:
    """Attach display summaries for same-service support ticket targets."""
    ids_by_type: dict[str, set[uuid.UUID]] = {
        "library": set(),
        "electronic_resource": set(),
        "library_resource": set(),
        "resource": set(),
        "loan": set(),
    }
    for ticket in tickets:
        if ticket.target_entity_type in ids_by_type and ticket.target_entity_id:
            ids_by_type[ticket.target_entity_type].add(ticket.target_entity_id)

    library_targets: dict[uuid.UUID, SupportTicketTargetSummary] = {}
    if ids_by_type["library"]:
        result = await db.execute(
            sa.select(Library).where(Library.id.in_(ids_by_type["library"]))
        )
        library_targets = {
            item.id: SupportTicketTargetSummary(
                id=item.id,
                type="library",
                label=item.name,
                description=_join_summary([item.short_name, item.library_type]),
            )
            for item in result.scalars()
        }

    electronic_targets: dict[uuid.UUID, SupportTicketTargetSummary] = {}
    if ids_by_type["electronic_resource"]:
        result = await db.execute(
            sa.select(ElectronicResource).where(
                ElectronicResource.id.in_(ids_by_type["electronic_resource"])
            )
        )
        electronic_targets = {
            item.id: SupportTicketTargetSummary(
                id=item.id,
                type="electronic_resource",
                label=item.name,
                description=_join_summary(
                    [item.provider, item.resource_type, item.access_level]
                ),
            )
            for item in result.scalars()
        }

    resource_ids = ids_by_type["library_resource"] | ids_by_type["resource"]
    resource_targets: dict[uuid.UUID, SupportTicketTargetSummary] = {}
    if resource_ids:
        result = await db.execute(
            sa.select(LibraryResource).where(LibraryResource.id.in_(resource_ids))
        )
        resource_targets = {
            item.id: SupportTicketTargetSummary(
                id=item.id,
                type="library_resource",
                label=item.title,
                description=_join_summary([item.authors, item.resource_type, item.status]),
            )
            for item in result.scalars()
        }

    loan_targets: dict[uuid.UUID, SupportTicketTargetSummary] = {}
    if ids_by_type["loan"]:
        result = await db.execute(
            sa.select(LibraryLoan)
            .options(selectinload(LibraryLoan.resource))
            .where(LibraryLoan.id.in_(ids_by_type["loan"]))
        )
        loan_targets = {
            item.id: SupportTicketTargetSummary(
                id=item.id,
                type="loan",
                label=item.resource.title if item.resource else "Library loan",
                description=_join_summary(
                    [
                        "Loan",
                        item.status,
                        f"Due {item.due_at.date().isoformat()}" if item.due_at else None,
                    ]
                ),
            )
            for item in result.scalars()
        }

    target_maps = {
        "library": library_targets,
        "electronic_resource": electronic_targets,
        "library_resource": resource_targets,
        "resource": resource_targets,
        "loan": loan_targets,
    }
    for ticket in tickets:
        target = target_maps.get(ticket.target_entity_type or "", {}).get(
            ticket.target_entity_id
        )
        setattr(ticket, "target", target)


# ── LibraryInquiry (Ask Librarian) ────────────────────────────────────────────


async def submit_inquiry(
    db: AsyncSession,
    data: LibraryInquiryCreate,
    *,
    person_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> LibraryInquiryOut:
    """Submit a new library inquiry."""
    inquiry = LibraryInquiry(
        **data.model_dump(),
        person_id=person_id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry, attribute_names=["library"])
    return LibraryInquiryOut.model_validate(inquiry)


async def list_inquiries(
    db: AsyncSession,
    *,
    library_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
) -> PaginatedResult:
    """List library inquiries with filtering."""
    query = (
        LibraryInquiry.active_query()
        .options(*_INQUIRY_DETAIL_OPTIONS)
        .order_by(LibraryInquiry.created_at.desc())
    )
    if library_id is not None:
        query = query.where(LibraryInquiry.library_id == library_id)
    if status is not None:
        query = query.where(LibraryInquiry.status == status)
    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    result.items = [LibraryInquiryOut.model_validate(i) for i in result.items]
    return result


async def get_inquiry(db: AsyncSession, inquiry_id: uuid.UUID) -> LibraryInquiry:
    """Get library inquiry entity by ID."""
    result = await db.execute(
        LibraryInquiry.active_query()
        .options(*_INQUIRY_DETAIL_OPTIONS)
        .where(LibraryInquiry.id == inquiry_id)
    )
    inquiry = result.scalar_one_or_none()
    if inquiry is None:
        raise ValueError("Inquiry not found")
    return inquiry


async def reply_to_inquiry(
    db: AsyncSession,
    inquiry_id: uuid.UUID,
    data: LibraryInquiryReply,
    *,
    replied_by_person_id: uuid.UUID,
) -> LibraryInquiryOut:
    """Reply to a library inquiry."""
    inquiry = await get_inquiry(db, inquiry_id)
    inquiry.status = "replied"
    inquiry.replied_at = datetime.now(timezone.utc)
    inquiry.reply_message = data.reply_message
    inquiry.replied_by_person_id = replied_by_person_id
    await db.commit()
    await db.refresh(inquiry, attribute_names=["library"])
    return LibraryInquiryOut.model_validate(inquiry)


async def update_inquiry_status(
    db: AsyncSession, inquiry_id: uuid.UUID, data: LibraryInquiryUpdate
) -> LibraryInquiryOut:
    """Update library inquiry status."""
    inquiry = await get_inquiry(db, inquiry_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(inquiry, field, value)
    await db.commit()
    await db.refresh(inquiry, attribute_names=["library"])
    return LibraryInquiryOut.model_validate(inquiry)


async def delete_inquiry(db: AsyncSession, inquiry_id: uuid.UUID) -> None:
    """Soft-delete a library inquiry."""
    inquiry = await get_inquiry(db, inquiry_id)
    inquiry.soft_delete()
    await db.commit()


# ── SupportTicket ─────────────────────────────────────────────────────────────


async def create_ticket(
    db: AsyncSession,
    data: SupportTicketCreate,
    *,
    person_id: Optional[uuid.UUID] = None,
) -> SupportTicketOut:
    """Create a new support ticket."""
    ticket = SupportTicket(
        **data.model_dump(),
        requester_person_id=person_id,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    await _populate_ticket_targets(db, [ticket])
    return SupportTicketOut.model_validate(ticket)


async def list_tickets(
    db: AsyncSession,
    *,
    status: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[uuid.UUID] = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
) -> PaginatedResult:
    """List support tickets with filtering."""
    query = SupportTicket.active_query().order_by(SupportTicket.created_at.desc())
    if status is not None:
        query = query.where(SupportTicket.status == status)
    if category is not None:
        query = query.where(SupportTicket.category == category)
    if assigned_to is not None:
        query = query.where(SupportTicket.assigned_to_person_id == assigned_to)
    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    await _populate_ticket_targets(db, result.items)
    result.items = [SupportTicketOut.model_validate(t) for t in result.items]
    return result


async def get_ticket(db: AsyncSession, ticket_id: uuid.UUID) -> SupportTicket:
    """Get support ticket entity by ID."""
    ticket = await SupportTicket.get_or_raise(
        db, ticket_id, error_message="Support ticket not found"
    )
    await _populate_ticket_targets(db, [ticket])
    return ticket


async def update_ticket(
    db: AsyncSession, ticket_id: uuid.UUID, data: SupportTicketUpdate
) -> SupportTicketOut:
    """Update a support ticket."""
    ticket = await get_ticket(db, ticket_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    await db.commit()
    await db.refresh(ticket)
    await _populate_ticket_targets(db, [ticket])
    return SupportTicketOut.model_validate(ticket)


async def delete_ticket(db: AsyncSession, ticket_id: uuid.UUID) -> None:
    """Soft-delete a support ticket."""
    ticket = await get_ticket(db, ticket_id)
    ticket.soft_delete()
    await db.commit()


# ── LibraryRegulation ─────────────────────────────────────────────────────────


def public_regulations_query():
    parent_is_public = sa.or_(
        LibraryRegulation.library_id.is_(None),
        sa.select(Library.id)
        .where(
            Library.id == LibraryRegulation.library_id,
            Library.is_active.is_(True),
            Library.is_public.is_(True),
            Library.deleted_at.is_(None),
        )
        .exists(),
    )
    return LibraryRegulation.active_query().where(
        LibraryRegulation.is_public.is_(True),
        LibraryRegulation.status == "active",
        parent_is_public,
    )


async def list_regulations(
    db: AsyncSession,
    *,
    library_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    public_only: bool = False,
) -> PaginatedResult:
    """List library regulations with filtering."""
    query = (
        public_regulations_query()
        if public_only
        else LibraryRegulation.active_query()
    ).order_by(LibraryRegulation.title)
    if library_id is not None:
        query = query.where(LibraryRegulation.library_id == library_id)
    if category is not None:
        query = query.where(LibraryRegulation.category == category)
    if status is not None and not public_only:
        query = query.where(LibraryRegulation.status == status)
    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    result.items = [LibraryRegulationOut.model_validate(r) for r in result.items]
    return result


async def get_regulation(
    db: AsyncSession, regulation_id: uuid.UUID
) -> LibraryRegulation:
    """Get library regulation entity by ID."""
    return await LibraryRegulation.get_or_raise(
        db, regulation_id, error_message="Regulation not found"
    )


async def get_public_regulation(
    db: AsyncSession, regulation_id: uuid.UUID
) -> LibraryRegulation:
    result = await db.execute(
        public_regulations_query().where(LibraryRegulation.id == regulation_id)
    )
    regulation = result.scalar_one_or_none()
    if regulation is None:
        raise ValueError("Regulation not found")
    return regulation


async def create_regulation(
    db: AsyncSession, data: LibraryRegulationCreate
) -> LibraryRegulationOut:
    """Create a new library regulation."""
    regulation = LibraryRegulation(**data.model_dump())
    db.add(regulation)
    await db.commit()
    await db.refresh(regulation)
    return LibraryRegulationOut.model_validate(regulation)


async def update_regulation(
    db: AsyncSession, regulation_id: uuid.UUID, data: LibraryRegulationUpdate
) -> LibraryRegulationOut:
    """Update a library regulation."""
    regulation = await get_regulation(db, regulation_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(regulation, field, value)
    await db.commit()
    await db.refresh(regulation)
    return LibraryRegulationOut.model_validate(regulation)


async def delete_regulation(db: AsyncSession, regulation_id: uuid.UUID) -> None:
    """Soft-delete a library regulation."""
    regulation = await get_regulation(db, regulation_id)
    regulation.soft_delete()
    await db.commit()


# ── LibrarySpecialist ─────────────────────────────────────────────────────────


async def list_specialists(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    subject: str | None = None,
    school: str | None = None,
    department: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    public_only: bool = False,
) -> PaginatedResult:
    query = LibrarySpecialist.active_query().order_by(
        LibrarySpecialist.sort_order, LibrarySpecialist.created_at
    )
    if public_only:
        query = query.where(
            LibrarySpecialist.is_public.is_(True),
            LibrarySpecialist.is_active.is_(True),
            _public_library_parent_filter(LibrarySpecialist),
        )
    if library_id is not None:
        query = query.where(LibrarySpecialist.library_id == library_id)
    if subject:
        query = query.where(LibrarySpecialist.subjects.contains([subject]))
    if school:
        query = query.where(LibrarySpecialist.schools.contains([school]))
    if department:
        query = query.where(LibrarySpecialist.departments.contains([department]))
    result = await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )
    result.items = [LibrarySpecialistOut.model_validate(item) for item in result.items]
    return result


async def get_specialist(db: AsyncSession, specialist_id: uuid.UUID) -> LibrarySpecialist:
    return await LibrarySpecialist.get_or_raise(
        db, specialist_id, error_message="Library specialist not found"
    )


async def create_specialist(
    db: AsyncSession, data: LibrarySpecialistCreate
) -> LibrarySpecialistOut:
    specialist = LibrarySpecialist(**data.model_dump())
    db.add(specialist)
    await db.commit()
    await db.refresh(specialist)
    return LibrarySpecialistOut.model_validate(specialist)


async def update_specialist(
    db: AsyncSession, specialist_id: uuid.UUID, data: LibrarySpecialistUpdate
) -> LibrarySpecialistOut:
    specialist = await get_specialist(db, specialist_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(specialist, field, value)
    await db.commit()
    await db.refresh(specialist)
    return LibrarySpecialistOut.model_validate(specialist)


async def delete_specialist(db: AsyncSession, specialist_id: uuid.UUID) -> None:
    specialist = await get_specialist(db, specialist_id)
    specialist.soft_delete()
    await db.commit()


# ── LibraryGuide ──────────────────────────────────────────────────────────────


def _guide_query(*, public_only: bool = False):
    query = LibraryGuide.active_query().options(*_GUIDE_DETAIL_OPTIONS)
    if public_only:
        query = query.where(
            LibraryGuide.is_public.is_(True),
            LibraryGuide.is_active.is_(True),
            _public_library_parent_filter(LibraryGuide),
        )
    return query


async def _replace_guide_children(
    db: AsyncSession,
    guide: LibraryGuide,
    data: LibraryGuideCreate | LibraryGuideUpdate,
) -> None:
    updates = data.model_dump(exclude_unset=True)
    if "sections" in updates:
        await db.execute(
            sa.delete(LibraryGuideSection).where(LibraryGuideSection.guide_id == guide.id)
        )
        for section in data.sections or []:
            db.add(LibraryGuideSection(guide_id=guide.id, **section.model_dump()))
    if "specialist_ids" in updates:
        await db.execute(
            sa.delete(LibraryGuideSpecialist).where(
                LibraryGuideSpecialist.guide_id == guide.id
            )
        )
        for specialist_id in data.specialist_ids or []:
            db.add(
                LibraryGuideSpecialist(
                    guide_id=guide.id,
                    specialist_id=specialist_id,
                )
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
    public_only: bool = False,
) -> PaginatedResult:
    query = _guide_query(public_only=public_only).order_by(
        LibraryGuide.sort_order, LibraryGuide.title
    )
    if library_id is not None:
        query = query.where(LibraryGuide.library_id == library_id)
    if guide_type:
        query = query.where(LibraryGuide.guide_type == guide_type)
    if subject:
        query = query.where(LibraryGuide.subject == subject)
    if course_code:
        query = query.where(LibraryGuide.course_code == course_code)
    if audience:
        query = query.where(LibraryGuide.audience == audience)
    result = await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )
    result.items = [_guide_out(item) for item in result.items]
    return result


async def get_guide(db: AsyncSession, guide_id: uuid.UUID) -> LibraryGuide:
    result = await db.execute(_guide_query().where(LibraryGuide.id == guide_id))
    guide = result.scalar_one_or_none()
    if guide is None:
        raise ValueError("Library guide not found")
    return guide


async def get_guide_by_slug(
    db: AsyncSession, slug: str, *, public_only: bool = False
) -> LibraryGuide:
    result = await db.execute(
        _guide_query(public_only=public_only).where(LibraryGuide.slug == slug)
    )
    guide = result.scalar_one_or_none()
    if guide is None:
        raise ValueError("Library guide not found")
    return guide


async def create_guide(db: AsyncSession, data: LibraryGuideCreate) -> LibraryGuideOut:
    payload = data.model_dump(exclude={"sections", "specialist_ids"})
    guide = LibraryGuide(**payload)
    db.add(guide)
    await db.flush()
    await _replace_guide_children(db, guide, data)
    await db.commit()
    return _guide_out(await get_guide(db, guide.id))


async def update_guide(
    db: AsyncSession, guide_id: uuid.UUID, data: LibraryGuideUpdate
) -> LibraryGuideOut:
    guide = await get_guide(db, guide_id)
    for field, value in data.model_dump(
        exclude_unset=True, exclude={"sections", "specialist_ids"}
    ).items():
        setattr(guide, field, value)
    await _replace_guide_children(db, guide, data)
    await db.commit()
    return _guide_out(await get_guide(db, guide.id))


async def delete_guide(db: AsyncSession, guide_id: uuid.UUID) -> None:
    guide = await get_guide(db, guide_id)
    guide.soft_delete()
    await db.commit()


# ── LibraryWorkflow ───────────────────────────────────────────────────────────


def _workflow_query(*, public_only: bool = False):
    query = LibraryWorkflow.active_query().options(*_WORKFLOW_DETAIL_OPTIONS)
    if public_only:
        query = query.where(
            LibraryWorkflow.is_public.is_(True),
            LibraryWorkflow.is_active.is_(True),
            _public_library_parent_filter(LibraryWorkflow),
        )
    return query


async def _replace_workflow_steps(
    db: AsyncSession,
    workflow: LibraryWorkflow,
    data: LibraryWorkflowCreate | LibraryWorkflowUpdate,
) -> None:
    if "steps" not in data.model_fields_set:
        return
    await db.execute(
        sa.delete(LibraryWorkflowStep).where(
            LibraryWorkflowStep.workflow_id == workflow.id
        )
    )
    for step in data.steps or []:
        db.add(LibraryWorkflowStep(workflow_id=workflow.id, **step.model_dump()))


async def list_workflows(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    workflow_type: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    public_only: bool = False,
) -> PaginatedResult:
    query = _workflow_query(public_only=public_only).order_by(
        LibraryWorkflow.sort_order, LibraryWorkflow.title
    )
    if library_id is not None:
        query = query.where(LibraryWorkflow.library_id == library_id)
    if workflow_type:
        query = query.where(LibraryWorkflow.workflow_type == workflow_type)
    result = await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )
    result.items = [_workflow_out(item) for item in result.items]
    return result


async def get_workflow(db: AsyncSession, workflow_id: uuid.UUID) -> LibraryWorkflow:
    result = await db.execute(
        _workflow_query().where(LibraryWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise ValueError("Library workflow not found")
    return workflow


async def get_workflow_by_slug(
    db: AsyncSession, slug: str, *, public_only: bool = False
) -> LibraryWorkflow:
    result = await db.execute(
        _workflow_query(public_only=public_only).where(LibraryWorkflow.slug == slug)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise ValueError("Library workflow not found")
    return workflow


async def create_workflow(
    db: AsyncSession, data: LibraryWorkflowCreate
) -> LibraryWorkflowOut:
    payload = data.model_dump(exclude={"steps"})
    workflow = LibraryWorkflow(**payload)
    db.add(workflow)
    await db.flush()
    await _replace_workflow_steps(db, workflow, data)
    await db.commit()
    return _workflow_out(await get_workflow(db, workflow.id))


async def update_workflow(
    db: AsyncSession, workflow_id: uuid.UUID, data: LibraryWorkflowUpdate
) -> LibraryWorkflowOut:
    workflow = await get_workflow(db, workflow_id)
    for field, value in data.model_dump(exclude_unset=True, exclude={"steps"}).items():
        setattr(workflow, field, value)
    await _replace_workflow_steps(db, workflow, data)
    await db.commit()
    return _workflow_out(await get_workflow(db, workflow.id))


async def delete_workflow(db: AsyncSession, workflow_id: uuid.UUID) -> None:
    workflow = await get_workflow(db, workflow_id)
    workflow.soft_delete()
    await db.commit()


# ── LibraryPolicyPage ─────────────────────────────────────────────────────────


def _policy_query(*, public_only: bool = False):
    query = LibraryPolicyPage.active_query()
    if public_only:
        query = query.where(
            LibraryPolicyPage.is_public.is_(True),
            LibraryPolicyPage.status == "active",
            _public_library_parent_filter(LibraryPolicyPage),
        )
    return query


async def list_policies(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    policy_type: str | None = None,
    status: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    public_only: bool = False,
) -> PaginatedResult:
    query = _policy_query(public_only=public_only).order_by(
        LibraryPolicyPage.sort_order, LibraryPolicyPage.title
    )
    if library_id is not None:
        query = query.where(LibraryPolicyPage.library_id == library_id)
    if policy_type:
        query = query.where(LibraryPolicyPage.policy_type == policy_type)
    if status is not None and not public_only:
        query = query.where(LibraryPolicyPage.status == status)
    result = await paginate(
        db, query, page=page, per_page=per_page, include_total=include_total
    )
    result.items = [LibraryPolicyPageOut.model_validate(item) for item in result.items]
    return result


async def get_policy(db: AsyncSession, policy_id: uuid.UUID) -> LibraryPolicyPage:
    policy = await LibraryPolicyPage.get_or_raise(
        db, policy_id, error_message="Library policy not found"
    )
    return policy


async def get_policy_by_slug(
    db: AsyncSession, slug: str, *, public_only: bool = False
) -> LibraryPolicyPage:
    result = await db.execute(
        _policy_query(public_only=public_only).where(LibraryPolicyPage.slug == slug)
    )
    policy = result.scalar_one_or_none()
    if policy is None:
        raise ValueError("Library policy not found")
    return policy


async def create_policy(
    db: AsyncSession, data: LibraryPolicyPageCreate
) -> LibraryPolicyPageOut:
    policy = LibraryPolicyPage(**data.model_dump())
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return LibraryPolicyPageOut.model_validate(policy)


async def update_policy(
    db: AsyncSession, policy_id: uuid.UUID, data: LibraryPolicyPageUpdate
) -> LibraryPolicyPageOut:
    policy = await get_policy(db, policy_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(policy, field, value)
    await db.commit()
    await db.refresh(policy)
    return LibraryPolicyPageOut.model_validate(policy)


async def delete_policy(db: AsyncSession, policy_id: uuid.UUID) -> None:
    policy = await get_policy(db, policy_id)
    policy.soft_delete()
    await db.commit()
