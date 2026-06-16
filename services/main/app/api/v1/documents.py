"""Document endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Document
from ...schemas import DocumentCreate, DocumentUpdate
from ...services import DocumentService

router = APIRouter()


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


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_document(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Document, fields)
    item = await DocumentService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found")
    item = await DocumentService.increment_download(db, item)
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_document(data: DocumentCreate, db: DbSession, _: CurrentUser):
    item = await DocumentService.create(db, **data.model_dump())
    return success(data=item, message="Document created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_document(item_id: uuid.UUID, data: DocumentUpdate, db: DbSession, _: CurrentUser):
    item = await DocumentService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found")
    item = await DocumentService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Document updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_document(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await DocumentService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found")
    await DocumentService.delete(db, item)
