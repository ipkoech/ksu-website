"""Services for LibraryInquiry, SupportTicket, and LibraryRegulation."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.pagination import PaginatedResult, paginate

from ..models import LibraryInquiry, LibraryRegulation, SupportTicket
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
    SupportTicketUpdate,
)


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
    await db.refresh(inquiry)
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
    query = LibraryInquiry.active_query().order_by(LibraryInquiry.created_at.desc())
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
    return await LibraryInquiry.get_or_raise(
        db, inquiry_id, error_message="Inquiry not found"
    )


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
    await db.refresh(inquiry)
    return LibraryInquiryOut.model_validate(inquiry)


async def update_inquiry_status(
    db: AsyncSession, inquiry_id: uuid.UUID, data: LibraryInquiryUpdate
) -> LibraryInquiryOut:
    """Update library inquiry status."""
    inquiry = await get_inquiry(db, inquiry_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(inquiry, field, value)
    await db.commit()
    await db.refresh(inquiry)
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
    result.items = [SupportTicketOut.model_validate(t) for t in result.items]
    return result


async def get_ticket(db: AsyncSession, ticket_id: uuid.UUID) -> SupportTicket:
    """Get support ticket entity by ID."""
    return await SupportTicket.get_or_raise(
        db, ticket_id, error_message="Support ticket not found"
    )


async def update_ticket(
    db: AsyncSession, ticket_id: uuid.UUID, data: SupportTicketUpdate
) -> SupportTicketOut:
    """Update a support ticket."""
    ticket = await get_ticket(db, ticket_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    await db.commit()
    await db.refresh(ticket)
    return SupportTicketOut.model_validate(ticket)


async def delete_ticket(db: AsyncSession, ticket_id: uuid.UUID) -> None:
    """Soft-delete a support ticket."""
    ticket = await get_ticket(db, ticket_id)
    ticket.soft_delete()
    await db.commit()


# ── LibraryRegulation ─────────────────────────────────────────────────────────


async def list_regulations(
    db: AsyncSession,
    *,
    library_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
) -> PaginatedResult:
    """List library regulations with filtering."""
    query = LibraryRegulation.active_query().order_by(LibraryRegulation.title)
    if library_id is not None:
        query = query.where(LibraryRegulation.library_id == library_id)
    if category is not None:
        query = query.where(LibraryRegulation.category == category)
    if status is not None:
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
