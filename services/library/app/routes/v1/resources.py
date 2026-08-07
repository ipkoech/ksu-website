"""Routes for LibraryResource, LibraryLoan, LibraryResourceReservation, and LibraryCharge."""

from __future__ import annotations

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import has_scope
from ksu_common.schemas.responses import success
from ksu_common.field_selection import FieldSelection, FieldsQuery, FieldSelector
from ksu_common.cache import cache_response, invalidate_prefix
from ksu_common.audit import audit_action
from ksu_common.rate_limit import rate_limit

from ...core.auth import get_optional_user, require_library_scope, requires_scope
from ...core.database import get_db
from ...models import LibraryResource
from ...schemas import (
    LibraryChargeCreate,
    LibraryChargeUpdate,
    LibraryLoanCreate,
    LibraryLoanUpdate,
    LibraryReservationCreate,
    LibraryReservationUpdate,
    LibraryResourceCreate,
    LibraryResourceUpdate,
)
from ...services import resources as svc

# ── Library resources ─────────────────────────────────────────────────────────

resources_router = APIRouter(prefix="/library/resources", tags=["Library Resources"])


async def invalidate_public_library_cache() -> None:
    await invalidate_prefix("public")


@resources_router.get("/")
async def list_resources(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: uuid.UUID = Query(...),
    resource_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    selector = FieldSelector(LibraryResource, fields, always_include={"id"})
    result = await svc.list_resources(
        db,
        library_id,
        resource_type=resource_type,
        status=status,
        q=q,
        page=page,
        per_page=per_page,
        include_total=include_total,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@resources_router.get("/{resource_id}")
async def get_resource(
    request: Request,
    resource_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryResource, fields, always_include={"id"})
    resource = await svc.get_resource(
        db,
        resource_id,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    if is_writer:
        require_library_scope(user, "library:read", resource.library_id)
    return success(data=selector.apply(resource))


@resources_router.post("/")
@audit_action("resource.create", target_type="LibraryResource", include_body=True)
async def create_resource(
    request: Request,
    data: LibraryResourceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    resource = await svc.create_resource(db, data)
    await invalidate_public_library_cache()
    return success(data=resource, message="Resource created")


@resources_router.patch("/{resource_id}")
@audit_action(
    "resource.update", target_type="LibraryResource", target_id_param="resource_id"
)
async def update_resource(
    request: Request,
    resource_id: uuid.UUID,
    data: LibraryResourceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    library_id = await svc.get_resource_library_id(db, resource_id)
    require_library_scope(user, "library:write", library_id)
    resource = await svc.update_resource(db, resource_id, data)
    await invalidate_public_library_cache()
    return success(data=resource)


@resources_router.delete("/{resource_id}", status_code=204)
@audit_action(
    "resource.delete", target_type="LibraryResource", target_id_param="resource_id"
)
async def delete_resource(
    request: Request,
    resource_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    library_id = await svc.get_resource_library_id(db, resource_id)
    require_library_scope(user, "library:admin", library_id)
    await svc.delete_resource(db, resource_id)
    await invalidate_public_library_cache()


# ── Library loans ─────────────────────────────────────────────────────────────

loans_router = APIRouter(prefix="/library/loans", tags=["Library Loans"])


@loans_router.get("/")
@cache_response(
    timeout=60,
    vary_on=("library_id", "resource_id", "status", "page", "per_page", "include_total"),
)
async def list_loans(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    library_id: Optional[uuid.UUID] = Query(None),
    resource_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    if library_id is not None:
        require_library_scope(user, "library:read", library_id)
    elif resource_id is not None:
        library_id = await svc.get_resource_library_id(db, resource_id)
        require_library_scope(user, "library:read", library_id)
    elif has_scope(user.roles, "library:write"):
        require_library_scope(user, "library:read", None)
    person_id: Optional[uuid.UUID] = None
    if not has_scope(user.roles, "library:write"):
        person_id = uuid.UUID(user.sub)
    result = await svc.list_loans(
        db,
        person_id=person_id,
        library_id=library_id,
        resource_id=resource_id,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return success(data=result.items, meta=result.meta)


@loans_router.get("/{loan_id}")
@cache_response(timeout=30, vary_on=())
async def get_loan(
    request: Request,
    loan_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    loan = await svc.get_loan(db, loan_id)
    if has_scope(user.roles, "library:write") and loan.resource is not None:
        require_library_scope(user, "library:read", loan.resource.library_id)
    return success(data=loan)


@loans_router.post("/")
@audit_action("loan.issue", target_type="LibraryLoan", include_body=True)
async def issue_loan(
    request: Request,
    data: LibraryLoanCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    library_id = await svc.get_resource_library_id(db, data.resource_id)
    require_library_scope(user, "library:write", library_id)
    loan = await svc.issue_loan(db, data)
    await invalidate_public_library_cache()
    return success(data=loan, message="Loan issued")


@loans_router.patch("/{loan_id}")
@audit_action("loan.return", target_type="LibraryLoan", target_id_param="loan_id")
async def return_loan(
    request: Request,
    loan_id: uuid.UUID,
    data: LibraryLoanUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    library_id = await svc.get_loan_library_id(db, loan_id)
    require_library_scope(user, "library:write", library_id)
    loan = await svc.return_loan(db, loan_id, data)
    await invalidate_public_library_cache()
    return success(data=loan)


@loans_router.post("/{loan_id}/renew")
@rate_limit(requests=5, window=60, by_user=True)
@audit_action("loan.renew", target_type="LibraryLoan", target_id_param="loan_id")
async def renew_loan(
    request: Request,
    loan_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    loan = await svc.get_loan(db, loan_id)
    if has_scope(user.roles, "library:write") and loan.resource is not None:
        require_library_scope(user, "library:read", loan.resource.library_id)
    if not has_scope(user.roles, "library:write"):
        if str(loan.borrower_person_id) != user.sub:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only renew your own loans",
            )
    renewed = await svc.renew_loan(db, loan_id)
    return success(data=renewed)


# ── Library reservations ──────────────────────────────────────────────────────

reservations_router = APIRouter(
    prefix="/library/reservations",
    tags=["Library Reservations"],
)


@reservations_router.get("/")
@cache_response(
    timeout=60,
    vary_on=("library_id", "resource_id", "status", "page", "per_page", "include_total"),
)
async def list_reservations(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    library_id: Optional[uuid.UUID] = Query(None),
    resource_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    if library_id is not None:
        require_library_scope(user, "library:read", library_id)
    elif resource_id is not None:
        library_id = await svc.get_resource_library_id(db, resource_id)
        require_library_scope(user, "library:read", library_id)
    elif has_scope(user.roles, "library:write"):
        require_library_scope(user, "library:read", None)
    person_id: Optional[uuid.UUID] = None
    if not has_scope(user.roles, "library:write"):
        person_id = uuid.UUID(user.sub)
    result = await svc.list_reservations(
        db,
        person_id=person_id,
        library_id=library_id,
        resource_id=resource_id,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return success(data=result.items, meta=result.meta)


@reservations_router.post("/")
@rate_limit(requests=10, window=60, by_user=True)
@audit_action(
    "reservation.create", target_type="LibraryResourceReservation", include_body=True
)
async def create_reservation(
    request: Request,
    data: LibraryReservationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    library_id = await svc.get_resource_library_id(db, data.resource_id)
    if has_scope(user.roles, "library:write"):
        require_library_scope(user, "library:write", library_id)
    if not has_scope(user.roles, "library:write"):
        data = data.model_copy(update={"requester_person_id": uuid.UUID(user.sub)})
    reservation = await svc.create_reservation(db, data)
    await invalidate_public_library_cache()
    return success(data=reservation, message="Reservation created")


@reservations_router.patch("/{reservation_id}")
@audit_action(
    "reservation.update",
    target_type="LibraryResourceReservation",
    target_id_param="reservation_id",
)
async def update_reservation(
    request: Request,
    reservation_id: uuid.UUID,
    data: LibraryReservationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    library_id = await svc.get_reservation_library_id(db, reservation_id)
    require_library_scope(user, "library:write", library_id)
    reservation = await svc.update_reservation(db, reservation_id, data)
    await invalidate_public_library_cache()
    return success(data=reservation)


@reservations_router.delete("/{reservation_id}", status_code=204)
@audit_action(
    "reservation.cancel",
    target_type="LibraryResourceReservation",
    target_id_param="reservation_id",
)
async def cancel_reservation(
    request: Request,
    reservation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    if has_scope(user.roles, "library:write"):
        library_id = await svc.get_reservation_library_id(db, reservation_id)
        require_library_scope(user, "library:write", library_id)
    await svc.cancel_reservation(
        db,
        reservation_id,
        uuid.UUID(user.sub),
        require_owner=not has_scope(user.roles, "library:write"),
    )
    await invalidate_public_library_cache()


# ── Library charges ───────────────────────────────────────────────────────────

charges_router = APIRouter(prefix="/library/charges", tags=["Library Charges"])


@charges_router.get("/")
async def list_charges(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    library_id: uuid.UUID = Query(...),
    active_only: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    charges = await svc.list_charges(
        db,
        library_id,
        active_only=active_only if is_writer else True,
        public_only=not is_writer,
    )
    return success(data=charges)


@charges_router.post("/")
@audit_action("charge.create", target_type="LibraryCharge", include_body=True)
async def create_charge(
    request: Request,
    data: LibraryChargeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    require_library_scope(user, "library:admin", data.library_id)
    charge = await svc.create_charge(db, data)
    await invalidate_public_library_cache()
    return success(data=charge, message="Charge created")


@charges_router.patch("/{charge_id}")
@audit_action("charge.update", target_type="LibraryCharge", target_id_param="charge_id")
async def update_charge(
    request: Request,
    charge_id: uuid.UUID,
    data: LibraryChargeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    library_id = await svc.get_charge_library_id(db, charge_id)
    require_library_scope(user, "library:admin", library_id)
    charge = await svc.update_charge(db, charge_id, data)
    await invalidate_public_library_cache()
    return success(data=charge)


@charges_router.delete("/{charge_id}", status_code=204)
@audit_action("charge.delete", target_type="LibraryCharge", target_id_param="charge_id")
async def delete_charge(
    request: Request,
    charge_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    library_id = await svc.get_charge_library_id(db, charge_id)
    require_library_scope(user, "library:admin", library_id)
    await svc.delete_charge(db, charge_id)
    await invalidate_public_library_cache()


# ── Aggregate router ──────────────────────────────────────────────────────────

router = APIRouter()
router.include_router(resources_router)
router.include_router(loans_router)
router.include_router(reservations_router)
router.include_router(charges_router)
