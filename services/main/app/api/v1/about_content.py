"""Public and administrative About KSU content endpoints."""

from fastapi import APIRouter, HTTPException, Query

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...services import AboutContentService, FactsService

router = APIRouter()


@router.get("/public/about")
@cached_public(timeout=600)
async def get_public_about(db: DbSession):
    payload = await AboutContentService.get_public_about(db)
    if payload is None:
        raise HTTPException(status_code=404, detail="About KSU content not found")
    return success(data=payload)


@router.get("/public/about/history")
@cached_public(timeout=600)
async def get_public_history(db: DbSession):
    return success(data=await AboutContentService.get_public_history(db))


@router.get("/public/about/facts")
@cached_public(timeout=600, vary_on=("year",))
async def get_public_facts(db: DbSession, year: int | None = Query(default=None, ge=1965, le=2100)):
    payload = await FactsService.get_public_facts(db, year=year)
    if payload is None:
        raise HTTPException(status_code=404, detail="Published facts edition not found")
    return success(data=payload)
