"""Public and librarian-managed assistant context endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.audit import audit_action
from ksu_common.auth import TokenPayload
from ksu_common.cache import cache_response, invalidate_prefix
from ksu_common.rbac import requires_scope
from ksu_common.schemas.responses import success

from ...core.auth import require_library_scope
from ...core.database import get_db
from ...models import LibraryAssistantContext
from ...schemas import (
    LibraryAssistantContextCreate,
    LibraryAssistantContextOut,
    LibraryAssistantContextPublicOut,
    LibraryAssistantContextUpdate,
)
from ...services import assistant_contexts as svc

router = APIRouter(prefix="/library/assistant-contexts", tags=["Library Assistant Contexts"])


@router.get("/public", response_model=None)
@cache_response(timeout=120, vary_on=("library_id",))
async def list_public_contexts(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    library_id: uuid.UUID | None = Query(None),
):
    data = await svc.list_contexts(db, public_only=True, library_id=library_id)
    return success(
        data=[LibraryAssistantContextPublicOut.model_validate(item).model_dump(mode="json") for item in data]
    )


@router.get("/", response_model=None)
async def list_contexts(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    library_id: uuid.UUID | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
):
    require_library_scope(user, "library:read", library_id)
    data = await svc.list_contexts(
        db,
        public_only=False,
        library_id=library_id,
        status_filter=status_filter,
    )
    return success(
        data=[LibraryAssistantContextOut.model_validate(item).model_dump(mode="json") for item in data]
    )


@router.get("/{context_id}", response_model=None)
async def get_context(
    request: Request,
    context_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    require_library_scope(user, "library:read", context.library_id)
    return success(
        data=LibraryAssistantContextOut.model_validate(
            svc._context_data(context)
        ).model_dump(mode="json")
    )


@router.post("/", response_model=None)
@audit_action("assistant_context.create", target_type="LibraryAssistantContext", include_body=True)
async def create_context(
    request: Request,
    data: LibraryAssistantContextCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    context = await svc.create_context(
        db,
        data,
        approved_by_person_id=uuid.UUID(user.sub),
    )
    await invalidate_prefix("public")
    return success(
        data=LibraryAssistantContextOut.model_validate(context).model_dump(mode="json"),
        message="Assistant context created",
    )


@router.patch("/{context_id}", response_model=None)
@audit_action("assistant_context.update", target_type="LibraryAssistantContext", target_id_param="context_id")
async def update_context(
    request: Request,
    context_id: uuid.UUID,
    data: LibraryAssistantContextUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    require_library_scope(user, "library:write", context.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library:write", data.library_id)
    updated = await svc.update_context(
        db,
        context,
        data,
        approved_by_person_id=uuid.UUID(user.sub),
    )
    await invalidate_prefix("public")
    return success(
        data=LibraryAssistantContextOut.model_validate(updated).model_dump(mode="json"),
        message="Assistant context updated",
    )


@router.post("/{context_id}/publish", response_model=None)
@audit_action("assistant_context.publish", target_type="LibraryAssistantContext", target_id_param="context_id")
async def publish_context(
    request: Request,
    context_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    require_library_scope(user, "library:write", context.library_id)
    published = await svc.publish_context(db, context)
    await invalidate_prefix("public")
    return success(
        data=LibraryAssistantContextOut.model_validate(published).model_dump(mode="json"),
        message="Assistant context published",
    )


@router.post("/{context_id}/archive", response_model=None)
@audit_action("assistant_context.archive", target_type="LibraryAssistantContext", target_id_param="context_id")
async def archive_context(
    request: Request,
    context_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    require_library_scope(user, "library:admin", context.library_id)
    archived = await svc.archive_context(db, context)
    await invalidate_prefix("public")
    return success(
        data=LibraryAssistantContextOut.model_validate(archived).model_dump(mode="json"),
        message="Assistant context archived",
    )
