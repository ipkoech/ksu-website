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
    LibraryInquiry,
    LibraryLoan,
    LibraryRegulation,
    LibraryResource,
    SupportTicket,
)
from ..schemas import (
    LibraryInquiryCreate,
    LibraryInquiryOut,
    LibraryInquiryReply,
    LibraryInquiryUpdate,
    LibraryRegulationCreate,
    LibraryRegulationOut,
    LibraryRegulationUpdate,
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketTargetSummary,
    SupportTicketUpdate,
)

_INQUIRY_DETAIL_OPTIONS = (selectinload(LibraryInquiry.library),)


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
