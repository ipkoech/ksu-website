"""Public and librarian-managed assistant context endpoints."""

from __future__ import annotations

from ...core.auth import require_library_transfer
from ...services.ownership import lock_owner, validate_transfer_destination

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.audit import audit_action
from ksu_common.auth import TokenPayload
from ksu_common.schemas.responses import SuccessResponse, success

from ...core.auth import require_library_scope, requires_scope
from ...core.database import get_db
from ...schemas import (
    LibraryAssistantContextCreate,
    LibraryAssistantContextOut,
    LibraryAssistantContextPublicOut,
    LibraryAssistantContextUpdate,
)
from ...services import assistant_contexts as svc

router = APIRouter(prefix="/library/assistant-contexts", tags=["Library Assistant Contexts"])


@router.get("/public", response_model=SuccessResponse[list[LibraryAssistantContextPublicOut]])
async def list_public_contexts(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    library_id: uuid.UUID | None = Query(None),
):
    response.headers["Cache-Control"] = "no-store"
    data = await svc.list_contexts(db, public_only=True, library_id=library_id)
    return success(
        data=[LibraryAssistantContextPublicOut.model_validate(item).model_dump(mode="json") for item in data]
    )


@router.get("/", response_model=SuccessResponse[list[LibraryAssistantContextOut]])
async def list_contexts(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library.assistant.view"))],
    library_id: uuid.UUID | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
):
    require_library_scope(user, "library.assistant.view", library_id)
    data = await svc.list_contexts(
        db,
        public_only=False,
        library_id=library_id,
        status_filter=status_filter,
    )
    return success(
        data=[LibraryAssistantContextOut.model_validate(item).model_dump(mode="json") for item in data]
    )


@router.get("/{context_id}", response_model=SuccessResponse[LibraryAssistantContextOut])
async def get_context(
    request: Request,
    context_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library.assistant.view"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    require_library_scope(user, "library.assistant.view", context.library_id)
    return success(
        data=LibraryAssistantContextOut.model_validate(
            svc._context_data(context)
        ).model_dump(mode="json")
    )


@router.post("/", response_model=SuccessResponse[LibraryAssistantContextOut])
@audit_action("assistant_context.create", target_type="LibraryAssistantContext", include_body=True)
async def create_context(
    request: Request,
    data: LibraryAssistantContextCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library.assistant.manage"))],
):
    require_library_scope(user, "library.assistant.manage", data.library_id)
    context = await svc.create_context(
        db,
        data,
        approved_by_person_id=uuid.UUID(user.sub),
        actor=user,
    )
    return success(
        data=LibraryAssistantContextOut.model_validate(context).model_dump(mode="json"),
        message="Assistant context created",
    )


@router.patch("/{context_id}", response_model=SuccessResponse[LibraryAssistantContextOut])
@audit_action("assistant_context.update", target_type="LibraryAssistantContext", target_id_param="context_id")
async def update_context(
    request: Request,
    context_id: uuid.UUID,
    data: LibraryAssistantContextUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library.assistant.manage"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    await lock_owner(db, context)
    require_library_scope(user, "library.assistant.manage", context.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library.assistant.manage", data.library_id)
        require_library_transfer(user, context.library_id, data.library_id)
        await validate_transfer_destination(db, context.library_id, data.library_id)
    updated = await svc.update_context(
        db,
        context,
        data,
        approved_by_person_id=uuid.UUID(user.sub),
        actor=user,
    )
    return success(
        data=LibraryAssistantContextOut.model_validate(updated).model_dump(mode="json"),
        message="Assistant context updated",
    )


@router.post("/{context_id}/publish", response_model=SuccessResponse[LibraryAssistantContextOut])
@audit_action("assistant_context.publish", target_type="LibraryAssistantContext", target_id_param="context_id")
async def publish_context(
    request: Request,
    context_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library.assistant.publish"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    await lock_owner(db, context)
    require_library_scope(user, "library.assistant.publish", context.library_id)
    published = await svc.publish_context(db, context, actor=user)
    return success(
        data=LibraryAssistantContextOut.model_validate(published).model_dump(mode="json"),
        message="Assistant context published",
    )


@router.post("/{context_id}/archive", response_model=SuccessResponse[LibraryAssistantContextOut])
@audit_action("assistant_context.archive", target_type="LibraryAssistantContext", target_id_param="context_id")
async def archive_context(
    request: Request,
    context_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library.assistant.unpublish"))],
):
    context = await svc.get_context(db, context_id, public_only=False)
    await lock_owner(db, context)
    require_library_scope(user, "library.assistant.unpublish", context.library_id)
    archived = await svc.archive_context(db, context, actor=user)
    return success(
        data=LibraryAssistantContextOut.model_validate(archived).model_dump(mode="json"),
        message="Assistant context archived",
    )
