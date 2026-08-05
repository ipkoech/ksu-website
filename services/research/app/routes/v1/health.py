from fastapi import APIRouter
from ksu_common.observability import health_status
from ksu_common.schemas import success

from ...schemas.base import JsonObject, SuccessEnvelope

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=SuccessEnvelope[JsonObject])
async def health():
    return success(data=health_status("research"))
