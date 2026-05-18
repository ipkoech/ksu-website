"""Health check endpoint."""

from fastapi import APIRouter
from ksu_common.schemas import success

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    return success(data={"service": "library", "status": "ok"})
