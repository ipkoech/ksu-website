"""Service layer for LibraryResource, LibraryLoan, LibraryResourceReservation, LibraryCharge."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Sequence

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.pagination import PaginatedResult, paginate

from ..models import (
    LibraryCharge,
    LibraryLoan,
    LibraryResource,
    LibraryResourceReservation,
)
from ..schemas import (
    LibraryChargeCreate,
    LibraryChargeOut,
    LibraryChargeUpdate,
    LibraryLoanCreate,
    LibraryLoanOut,
    LibraryLoanUpdate,
    LibraryReservationCreate,
    LibraryReservationOut,
    LibraryReservationUpdate,
    LibraryResourceCreate,
    LibraryResourceUpdate,
)

_DEFAULT_LOAN_DAYS = 14


# ── LibraryResource ───────────────────────────────────────────────────────────


async def list_resources(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    resource_type: str | None = None,
    status: str | None = None,
    q: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    load_options: Sequence = (),
) -> PaginatedResult:
    """List library resources with optional filtering and eager loading."""
    query = (
        LibraryResource.active_query()
        .where(LibraryResource.library_id == library_id)
        .order_by(LibraryResource.title)
    )

    if load_options:
        query = query.options(*load_options)
    if resource_type is not None:
        query = query.where(LibraryResource.resource_type == resource_type)
    if status is not None:
        query = query.where(LibraryResource.status == status)
    if q is not None:
        term = f"%{q}%"
        query = query.where(
            sa.or_(
                LibraryResource.title.ilike(term),
                LibraryResource.authors.ilike(term),
                LibraryResource.isbn.ilike(term),
                LibraryResource.call_number.ilike(term),
            )
        )

    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return result


async def get_resource(
    db: AsyncSession,
    resource_id: uuid.UUID,
    *,
    load_options: Sequence = (),
) -> LibraryResource:
    """Get a library resource by ID."""
    query = LibraryResource.active_query().where(LibraryResource.id == resource_id)
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    resource = result.scalar_one_or_none()
    if resource is None:
        raise ValueError(f"Library resource {resource_id} not found")
    return resource


async def get_resource_entity(
    db: AsyncSession, resource_id: uuid.UUID
) -> LibraryResource:
    """Get raw LibraryResource entity (for internal use)."""
    return await LibraryResource.get_or_raise(
        db, resource_id, error_message=f"Library resource {resource_id} not found"
    )


async def create_resource(
    db: AsyncSession, data: LibraryResourceCreate
) -> LibraryResourceOut:
    """Create a new library resource."""
    if data.barcode is not None:
        existing = await db.execute(
            sa.select(LibraryResource.id)
            .where(LibraryResource.barcode == data.barcode)
            .limit(1)
        )
        if existing.scalar_one_or_none() is not None:
            raise ValueError(f"Resource with barcode '{data.barcode}' already exists")

    resource = LibraryResource(**data.model_dump())
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return LibraryResourceOut.model_validate(resource)


async def update_resource(
    db: AsyncSession, resource_id: uuid.UUID, data: LibraryResourceUpdate
) -> LibraryResourceOut:
    """Update a library resource."""
    resource = await get_resource_entity(db, resource_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(resource, field, value)
    await db.commit()
    await db.refresh(resource)
    return LibraryResourceOut.model_validate(resource)


async def delete_resource(db: AsyncSession, resource_id: uuid.UUID) -> None:
    """Soft-delete a library resource."""
    resource = await get_resource_entity(db, resource_id)
    resource.soft_delete()
    await db.commit()


# ── LibraryLoan ───────────────────────────────────────────────────────────────


async def issue_loan(db: AsyncSession, data: LibraryLoanCreate) -> LibraryLoanOut:
    """Issue a new loan for a resource."""
    resource = await get_resource_entity(db, data.resource_id)

    if not resource.is_loanable:
        raise ValueError("This resource is not loanable")
    if resource.available_copies < 1:
        raise ValueError("No copies available for loan")

    resource.available_copies -= 1
    if resource.available_copies == 0:
        resource.status = "on_loan"

    loan = LibraryLoan(**data.model_dump())
    db.add(loan)
    await db.commit()
    await db.refresh(loan)
    return LibraryLoanOut.model_validate(loan)


async def return_loan(
    db: AsyncSession, loan_id: uuid.UUID, data: LibraryLoanUpdate
) -> LibraryLoanOut:
    """Process a loan return."""
    loan = await LibraryLoan.get_or_raise(
        db, loan_id, error_message=f"Loan {loan_id} not found"
    )

    if loan.status == "returned":
        raise ValueError("Loan has already been returned")

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(loan, field, value)

    loan.status = "returned"
    if loan.returned_at is None:
        loan.returned_at = datetime.now(timezone.utc)

    resource = await LibraryResource.get_by_id(db, loan.resource_id)
    if resource is not None:
        resource.available_copies += 1
        if resource.status == "on_loan" and resource.available_copies > 0:
            resource.status = "available"

    await db.commit()
    await db.refresh(loan)
    return LibraryLoanOut.model_validate(loan)


async def renew_loan(db: AsyncSession, loan_id: uuid.UUID) -> LibraryLoanOut:
    """Renew an active loan."""
    loan = await LibraryLoan.get_or_raise(
        db, loan_id, error_message=f"Loan {loan_id} not found"
    )

    if loan.status != "active":
        raise ValueError("Only active loans can be renewed")
    if loan.renewals_count >= loan.max_renewals:
        raise ValueError(f"Maximum renewals ({loan.max_renewals}) already reached")

    result = await db.execute(
        sa.select(LibraryResource.default_loan_days).where(
            LibraryResource.id == loan.resource_id
        )
    )
    default_loan_days = result.scalar_one_or_none()
    extension_days = default_loan_days if default_loan_days else _DEFAULT_LOAN_DAYS

    loan.due_at = loan.due_at + timedelta(days=extension_days)
    loan.renewals_count += 1

    await db.commit()
    await db.refresh(loan)
    return LibraryLoanOut.model_validate(loan)


async def get_loan(db: AsyncSession, loan_id: uuid.UUID) -> LibraryLoanOut:
    """Get a loan by ID."""
    loan = await LibraryLoan.get_or_raise(
        db, loan_id, error_message=f"Loan {loan_id} not found"
    )
    return LibraryLoanOut.model_validate(loan)


async def list_loans(
    db: AsyncSession,
    *,
    person_id: uuid.UUID | None = None,
    resource_id: uuid.UUID | None = None,
    status: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
) -> PaginatedResult:
    """List loans with optional filtering."""
    query = sa.select(LibraryLoan).order_by(LibraryLoan.borrowed_at.desc())
    if person_id is not None:
        query = query.where(LibraryLoan.borrower_person_id == person_id)
    if resource_id is not None:
        query = query.where(LibraryLoan.resource_id == resource_id)
    if status is not None:
        query = query.where(LibraryLoan.status == status)

    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    result.items = [LibraryLoanOut.model_validate(l) for l in result.items]
    return result


# ── LibraryResourceReservation ────────────────────────────────────────────────


async def create_reservation(
    db: AsyncSession, data: LibraryReservationCreate
) -> LibraryReservationOut:
    """Create a resource reservation."""
    await get_resource_entity(db, data.resource_id)

    count_result = await db.execute(
        sa.select(sa.func.count()).where(
            LibraryResourceReservation.resource_id == data.resource_id,
            LibraryResourceReservation.status == "pending",
        )
    )
    pending_count = count_result.scalar_one()
    queue_position = pending_count + 1

    reservation = LibraryResourceReservation(
        resource_id=data.resource_id,
        requester_person_id=data.requester_person_id,
        notes=data.notes,
        reserved_at=datetime.now(timezone.utc),
        queue_position=queue_position,
        status="pending",
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)
    return LibraryReservationOut.model_validate(reservation)


async def cancel_reservation(
    db: AsyncSession,
    reservation_id: uuid.UUID,
    person_id: uuid.UUID,
    *,
    require_owner: bool = True,
) -> None:
    """Cancel a reservation."""
    reservation = await LibraryResourceReservation.get_or_raise(
        db, reservation_id, error_message=f"Reservation {reservation_id} not found"
    )

    if require_owner and reservation.requester_person_id != person_id:
        raise PermissionError("You can only cancel your own reservations")
    if reservation.status not in {"pending", "ready"}:
        raise ValueError(
            f"Cannot cancel a reservation with status '{reservation.status}'"
        )

    reservation.status = "cancelled"
    await db.commit()


async def update_reservation(
    db: AsyncSession,
    reservation_id: uuid.UUID,
    data: LibraryReservationUpdate,
) -> LibraryReservationOut:
    """Update a reservation status and staff-managed hold metadata."""
    reservation = await LibraryResourceReservation.get_or_raise(
        db, reservation_id, error_message=f"Reservation {reservation_id} not found"
    )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(reservation, field, value)

    await db.commit()
    await db.refresh(reservation)
    return LibraryReservationOut.model_validate(reservation)


async def list_reservations(
    db: AsyncSession,
    *,
    person_id: uuid.UUID | None = None,
    resource_id: uuid.UUID | None = None,
    status: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
) -> PaginatedResult:
    """List reservations with optional filtering."""
    query = sa.select(LibraryResourceReservation).order_by(
        LibraryResourceReservation.reserved_at.desc()
    )
    if person_id is not None:
        query = query.where(LibraryResourceReservation.requester_person_id == person_id)
    if resource_id is not None:
        query = query.where(LibraryResourceReservation.resource_id == resource_id)
    if status is not None:
        query = query.where(LibraryResourceReservation.status == status)

    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    result.items = [LibraryReservationOut.model_validate(r) for r in result.items]
    return result


# ── LibraryCharge ─────────────────────────────────────────────────────────────


async def list_charges(
    db: AsyncSession, library_id: uuid.UUID, *, active_only: bool = True
) -> list[LibraryChargeOut]:
    """List library charges (fee structures)."""
    query = (
        LibraryCharge.active_query()
        .where(LibraryCharge.library_id == library_id)
        .order_by(LibraryCharge.charge_type, LibraryCharge.name)
    )

    if active_only:
        query = query.where(LibraryCharge.is_active.is_(True))

    result = await db.execute(query)
    return [LibraryChargeOut.model_validate(c) for c in result.scalars().all()]


async def create_charge(
    db: AsyncSession, data: LibraryChargeCreate
) -> LibraryChargeOut:
    """Create a library charge entry."""
    charge = LibraryCharge(**data.model_dump())
    db.add(charge)
    await db.commit()
    await db.refresh(charge)
    return LibraryChargeOut.model_validate(charge)


async def update_charge(
    db: AsyncSession, charge_id: uuid.UUID, data: LibraryChargeUpdate
) -> LibraryChargeOut:
    """Update a library charge."""
    charge = await LibraryCharge.get_or_raise(
        db, charge_id, error_message=f"Library charge {charge_id} not found"
    )
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(charge, field, value)
    await db.commit()
    await db.refresh(charge)
    return LibraryChargeOut.model_validate(charge)


async def delete_charge(db: AsyncSession, charge_id: uuid.UUID) -> None:
    """Soft-delete a library charge."""
    charge = await LibraryCharge.get_or_raise(
        db, charge_id, error_message=f"Library charge {charge_id} not found"
    )
    charge.soft_delete()
    await db.commit()
