"""Routes for LibraryStaff, LibraryService, and LibraryStatistics."""

from __future__ import annotations

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload, get_optional_user
from ksu_common.rbac import has_scope, requires_scope
from ksu_common.schemas.responses import success
from ksu_common.cache import cache_response
from ksu_common.audit import audit_action

from ...core.database import get_db
from ...schemas import (
    LibraryServiceCreate,
    LibraryServiceUpdate,
    LibraryStaffCreate,
    LibraryStaffUpdate,
    LibraryStatisticsCreate,
)
from ...services import staff as svc

# ── Library staff ─────────────────────────────────────────────────────────────

staff_router = APIRouter(prefix="/library/staff", tags=["Library Staff"])


@staff_router.get("/")
async def list_staff(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    library_id: uuid.UUID = Query(...),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    members = await svc.list_staff(db, library_id, public_only=not is_writer)
    return success(data=members)


@staff_router.get("/leadership")
async def list_library_leadership(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    library_id: Optional[uuid.UUID] = Query(None),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    members = await svc.list_leadership(
        db,
        library_id=library_id,
        public_only=not is_writer,
    )
    return success(data=members)


@staff_router.post("/")
@audit_action("staff.create", target_type="LibraryStaff", include_body=True)
async def create_staff(
    request: Request,
    data: LibraryStaffCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    member = await svc.create_staff(db, data)
    return success(data=member, message="Staff member created")


@staff_router.patch("/{staff_id}")
@audit_action("staff.update", target_type="LibraryStaff", target_id_param="staff_id")
async def update_staff(
    request: Request,
    staff_id: uuid.UUID,
    data: LibraryStaffUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    member = await svc.update_staff(db, staff_id, data)
    return success(data=member)


@staff_router.delete("/{staff_id}", status_code=204)
@audit_action("staff.delete", target_type="LibraryStaff", target_id_param="staff_id")
async def delete_staff(
    request: Request,
    staff_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_staff(db, staff_id)


# ── Library services ──────────────────────────────────────────────────────────

services_router = APIRouter(prefix="/library/services", tags=["Library Services"])


@services_router.get("/")
async def list_services(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    library_id: uuid.UUID = Query(...),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    items = await svc.list_services(db, library_id, public_only=not is_writer)
    return success(data=items)


@services_router.post("/")
@audit_action("service.create", target_type="LibraryService", include_body=True)
async def create_service(
    request: Request,
    data: LibraryServiceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    service = await svc.create_service(db, data)
    return success(data=service, message="Service created")


@services_router.patch("/{service_id}")
@audit_action(
    "service.update", target_type="LibraryService", target_id_param="service_id"
)
async def update_service(
    request: Request,
    service_id: uuid.UUID,
    data: LibraryServiceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    service = await svc.update_service(db, service_id, data)
    return success(data=service)


@services_router.delete("/{service_id}", status_code=204)
@audit_action(
    "service.delete", target_type="LibraryService", target_id_param="service_id"
)
async def delete_service(
    request: Request,
    service_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_service(db, service_id)


# ── Library statistics ────────────────────────────────────────────────────────

statistics_router = APIRouter(prefix="/library/statistics", tags=["Library Statistics"])


@statistics_router.get("/")
@cache_response(timeout=300, vary_on=("library_id", "period_type"))
async def list_statistics(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    library_id: uuid.UUID = Query(...),
    period_type: Optional[str] = Query(None),
):
    stats = await svc.list_statistics(db, library_id, period_type=period_type)
    return success(data=stats)


@statistics_router.post("/")
@audit_action("statistics.create", target_type="LibraryStatistics", include_body=True)
async def create_statistics(
    request: Request,
    data: LibraryStatisticsCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    stats = await svc.create_statistics(db, data)
    return success(data=stats, message="Statistics snapshot created")


# ── Aggregate router ──────────────────────────────────────────────────────────

router = APIRouter()
router.include_router(staff_router)
router.include_router(services_router)
router.include_router(statistics_router)
