"""Public display stats endpoint."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from ksu_common.auth import TokenPayload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas.base import SuccessEnvelope
from ...schemas.stats import PublicStatsResponse
from ...services.stats import admin_research_stats, public_research_stats

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("", response_model=SuccessEnvelope[PublicStatsResponse])
@cached_public(timeout=300, vary_on=())
async def get_public_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    result = await public_research_stats(db)
    return success(data=result.model_dump())


@router.get("/admin", response_model=SuccessEnvelope[PublicStatsResponse])
async def get_admin_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(require_scope("research.view")),
):
    result = await admin_research_stats(db)
    return success(data=result.model_dump())
