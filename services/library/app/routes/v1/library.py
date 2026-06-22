"""Routes for Library branches, hours, external links, and files."""

from __future__ import annotations

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload, get_optional_user
from ksu_common.rbac import has_scope, requires_scope
from ksu_common.schemas.responses import success
from ksu_common.field_selection import FieldSelection, FieldsQuery, FieldSelector
from ksu_common.cache import cached_public, invalidate_prefix
from ksu_common.audit import audit_action

from ...core.database import get_db
from ...models import Library, LibraryExternalLink, LibraryFile
from ...schemas import (
    LibraryCreate,
    LibraryExternalLinkCreate,
    LibraryExternalLinkToggle,
    LibraryExternalLinkUpdate,
    LibraryFileCreate,
    LibraryHoursCreate,
    LibraryOut,
    LibraryUpdate,
)
from ...services import library as svc
from ...services.media import attach_public_media

# ── Library branches ──────────────────────────────────────────────────────────

branches_router = APIRouter(prefix="/library/branches", tags=["Library Branches"])


async def invalidate_public_library_cache() -> None:
    await invalidate_prefix("public")


@branches_router.get("/")
async def list_libraries(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    active_only: bool = Query(True),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(Library, fields, always_include={"id"})
    result = await svc.list_libraries(
        db,
        active_only=active_only if is_writer else True,
        public_only=not is_writer,
        page=page,
        per_page=per_page,
        include_total=include_total,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@branches_router.get("/{library_id}")
async def get_library(
    request: Request,
    library_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    selector = FieldSelector(Library, fields, always_include={"id"})
    is_writer = user is not None and has_scope(user.roles, "library:write")
    library = (
        await svc.get_library(db, library_id, load_options=selector.load_options)
        if is_writer
        else await svc.get_public_library(db, library_id)
    )
    return success(data=selector.apply(library))


@branches_router.post("/")
@audit_action("library.create", target_type="Library", include_body=True)
async def create_library(
    request: Request,
    data: LibraryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    library = await svc.create_library(db, data)
    await invalidate_public_library_cache()
    return success(
        data=LibraryOut.model_validate(library).model_dump(), message="Library created"
    )


@branches_router.patch("/{library_id}")
@audit_action(
    "library.update",
    target_type="Library",
    target_id_param="library_id",
    include_body=True,
)
async def update_library(
    request: Request,
    library_id: uuid.UUID,
    data: LibraryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    library = await svc.update_library(db, library_id, data)
    await invalidate_public_library_cache()
    return success(data=LibraryOut.model_validate(library).model_dump())


@branches_router.delete("/{library_id}", status_code=204)
@audit_action("library.delete", target_type="Library", target_id_param="library_id")
async def delete_library(
    request: Request,
    library_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_library(db, library_id)
    await invalidate_public_library_cache()


# ── Library hours ─────────────────────────────────────────────────────────────

hours_router = APIRouter(
    prefix="/library/branches/{library_id}/hours",
    tags=["Library Hours"],
)


@hours_router.put("/")
@audit_action("library.hours.set", target_type="Library", target_id_param="library_id")
async def set_library_hours(
    request: Request,
    library_id: uuid.UUID,
    hours_list: list[LibraryHoursCreate],
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    hours = await svc.set_library_hours(db, library_id, hours_list)
    await invalidate_public_library_cache()
    return success(data=hours)


@hours_router.get("/")
@cached_public(timeout=300, vary_on=())
async def get_library_hours(
    request: Request,
    library_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    hours = await svc.get_library_hours(db, library_id, public_only=True)
    return success(data=hours)


@hours_router.get("/today")
@cached_public(timeout=60, vary_on=("timezone",))
async def get_library_today_hours(
    request: Request,
    library_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    timezone: str = Query("Africa/Nairobi"),
):
    status_rows = await svc.get_today_status(
        db,
        library_id=library_id,
        timezone_name=timezone,
    )
    return success(data=status_rows[0] if status_rows else None)


today_hours_router = APIRouter(
    prefix="/library/hours",
    tags=["Library Hours"],
)


@today_hours_router.get("/today")
@cached_public(timeout=60, vary_on=("timezone",))
async def list_today_hours(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    timezone: str = Query("Africa/Nairobi"),
):
    return success(data=await svc.get_today_status(db, timezone_name=timezone))


# ── Library external links ────────────────────────────────────────────────────

links_router = APIRouter(
    prefix="/library/branches/{library_id}/links",
    tags=["Library External Links"],
)


@links_router.get("/")
async def list_external_links(
    request: Request,
    library_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    active_only: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if not is_writer:
        await svc.get_public_library(db, library_id)
    selector = FieldSelector(LibraryExternalLink, fields, always_include={"id"})
    links = await svc.list_external_links(
        db,
        library_id,
        active_only=active_only if is_writer else True,
    )
    return success(data=selector.apply(links))


@links_router.post("/")
@audit_action(
    "library.link.create", target_type="LibraryExternalLink", include_body=True
)
async def create_external_link(
    request: Request,
    library_id: uuid.UUID,
    data: LibraryExternalLinkCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    link = await svc.create_external_link(db, library_id, data)
    await invalidate_public_library_cache()
    return success(data=link, message="Link created")


@links_router.patch("/{link_id}")
@audit_action(
    "library.link.update", target_type="LibraryExternalLink", target_id_param="link_id"
)
async def update_external_link(
    request: Request,
    library_id: uuid.UUID,
    link_id: uuid.UUID,
    data: LibraryExternalLinkUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    link = await svc.update_external_link(db, link_id, data)
    await invalidate_public_library_cache()
    return success(data=link)


@links_router.patch("/{link_id}/toggle")
@audit_action(
    "library.link.toggle", target_type="LibraryExternalLink", target_id_param="link_id"
)
async def toggle_external_link(
    request: Request,
    library_id: uuid.UUID,
    link_id: uuid.UUID,
    body: LibraryExternalLinkToggle,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    link = await svc.toggle_external_link(db, link_id, body.is_active)
    await invalidate_public_library_cache()
    return success(data=link)


@links_router.delete("/{link_id}", status_code=204)
@audit_action(
    "library.link.delete", target_type="LibraryExternalLink", target_id_param="link_id"
)
async def delete_external_link(
    request: Request,
    library_id: uuid.UUID,
    link_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_external_link(db, link_id)
    await invalidate_public_library_cache()


# ── Library files ─────────────────────────────────────────────────────────────

files_router = APIRouter(
    prefix="/library/branches/{library_id}/files",
    tags=["Library Files"],
)


@files_router.get("/")
async def list_library_files(
    request: Request,
    library_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    if user is None or not has_scope(user.roles, "library:write"):
        await svc.get_public_library(db, library_id)
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryFile, fields, always_include={"id"})
    files = await svc.list_library_files(db, library_id, public_only=not is_writer)
    data = selector.apply(files)
    return success(data=await attach_public_media(data))


@files_router.post("/")
@audit_action("library.file.create", target_type="LibraryFile", include_body=True)
async def create_library_file(
    request: Request,
    library_id: uuid.UUID,
    data: LibraryFileCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    file = await svc.create_library_file(db, library_id, data)
    await invalidate_public_library_cache()
    return success(data=file, message="File attached")


@files_router.delete("/{file_id}", status_code=204)
@audit_action(
    "library.file.delete", target_type="LibraryFile", target_id_param="file_id"
)
async def delete_library_file(
    request: Request,
    library_id: uuid.UUID,
    file_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    await svc.delete_library_file(db, file_id)
    await invalidate_public_library_cache()


# ── Aggregate router ──────────────────────────────────────────────────────────

router = APIRouter()
router.include_router(branches_router)
router.include_router(hours_router)
router.include_router(today_hours_router)
router.include_router(links_router)
router.include_router(files_router)
