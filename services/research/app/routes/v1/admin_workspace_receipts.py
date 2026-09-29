"""Private receipt lookup in the existing Research idempotency ledger."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response
from ksu_common.schemas.responses import success
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user
from ...core.database import get_db
from ...models.idempotency import CommandIdempotency
from ...schemas.base import JsonObject, SuccessEnvelope, SuccessEnvelopeWithMeta
from ...services.admin_workspace_receipts import receipt_summary
from .admin_workspace import private_response

router = APIRouter(prefix="/research-portal/receipts", tags=["Research command receipts"])

_DB_DEPENDENCY = _DB_DEPENDENCY
_USER_DEPENDENCY = _USER_DEPENDENCY


@router.get("", response_model=SuccessEnvelopeWithMeta[list[JsonObject]])
async def receipts(response: Response, key: str | None = Query(None, min_length=1, max_length=255),
                   page: int = Query(1, ge=1, le=100000), per_page: int = Query(25, ge=1, le=100),
                   db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    private_response(response)
    model = CommandIdempotency
    # The subject is verified by the existing identity freshness dependency.
    # A query parameter can never select another actor's receipts.
    query = model.active_query().where(model.scope == f"user:{user.sub}")
    if key is not None:
        query = query.where(model.idempotency_key == key)
    total = int(await db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0)
    records = (await db.scalars(query.order_by(model.created_at.desc(), model.command_name, model.idempotency_key)
                               .offset((page - 1) * per_page).limit(per_page))).all()
    return success(data=[receipt_summary(record) for record in records], meta={
        "page": page, "per_page": per_page, "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


class ReconcileReceipt(BaseModel):
    model_config = ConfigDict(extra="forbid")
    key: str = Field(min_length=1, max_length=255)
    command: str = Field(min_length=1, max_length=255)

    @field_validator("key", "command")
    @classmethod
    def no_surrounding_whitespace(cls, value):
        if value.strip() != value or not value.strip():
            raise ValueError("Use the exact recorded command key and template")
        return value


@router.post("/reconcile", response_model=SuccessEnvelope[JsonObject])
async def reconcile(data: ReconcileReceipt, db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    from ...services.admin_workspace_reconciliation import reconcile_command
    return success(data=await reconcile_command(db, user, data.key, data.command))
