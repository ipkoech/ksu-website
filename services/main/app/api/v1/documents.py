"""Document endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import Document
from ...security.scopes import can_access_scope
from ...schemas import DocumentCreate, DocumentUpdate
from ...services import DocumentService

router = APIRouter()


def _document_scope(scope_type: str | None, scope_id: uuid.UUID | None) -> tuple[str, uuid.UUID | None]:
    return (scope_type or "global", scope_id)


async def _can_access_document_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> bool:
    target_scope_type, target_scope_id = _document_scope(scope_type, scope_id)
    return any(
        [
            await can_access_scope(db, user, permission, target_scope_type, target_scope_id)
            for permission in permissions
        ]
    )


async def _require_document_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> None:
    if not await _can_access_document_scope(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this document scope",
        )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "document_type", "category", "scope_type", "scope_id", "fields", "include"))
async def list_documents(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    document_type: str | None = None,
    category: str | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Document, fields)
    result = await DocumentService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        document_type=document_type,
        category=category,
        scope_type=scope_type,
        scope_id=scope_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_documents(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    document_type: str | None = None,
    category: str | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Document, fields)
    result = await DocumentService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        document_type=document_type,
        category=category,
        scope_type=scope_type,
        scope_id=scope_id,
        public_only=False,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_document_scope(
            db,
            user,
            ["office.view", "policy.view", "content.view"],
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_document(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Document, fields)
    item = await DocumentService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found")
    item = await DocumentService.increment_download(db, item)
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_document(data: DocumentCreate, db: DbSession, user: CurrentUser):
    await _require_document_scope(
        db,
        user,
        ["office.manage_content", "policy.manage", "content.manage_pages"],
        data.scope_type,
        data.scope_id,
    )
    item = await DocumentService.create(db, **data.model_dump())
    return success(data=item, message="Document created")


@router.patch("/{item_id}")
async def update_document(item_id: uuid.UUID, data: DocumentUpdate, db: DbSession, user: CurrentUser):
    item = await DocumentService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found")
    await _require_document_scope(
        db,
        user,
        ["office.manage_content", "policy.manage", "content.manage_pages"],
        item.scope_type,
        item.scope_id,
    )
    payload = data.model_dump(exclude_unset=True)
    next_scope_type = payload.get("scope_type", item.scope_type)
    next_scope_id = payload.get("scope_id", item.scope_id)
    await _require_document_scope(
        db,
        user,
        ["office.manage_content", "policy.manage", "content.manage_pages"],
        next_scope_type,
        next_scope_id,
    )
    item = await DocumentService.update(db, item, **payload)
    return success(data=item, message="Document updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(item_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await DocumentService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found")
    await _require_document_scope(
        db,
        user,
        ["office.manage_content", "policy.manage", "content.manage_pages"],
        item.scope_type,
        item.scope_id,
    )
    await DocumentService.delete(db, item)
