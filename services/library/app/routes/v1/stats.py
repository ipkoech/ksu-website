"""Public display stats endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.cache import cached_public
from ksu_common.schemas.responses import success

from ...core.database import get_db
from ...services.stats import public_library_stats

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("")
@cached_public(timeout=300, vary_on=())
async def get_public_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    result = await public_library_stats(db)
    return success(data=result.model_dump())
