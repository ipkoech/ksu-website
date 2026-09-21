from fastapi import APIRouter, Request
from ksu_common.observability import health_status
from ksu_common.schemas import HealthPayload, SuccessResponse, success
from ...core.config import health_rate_limit

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=SuccessResponse[HealthPayload])
@health_rate_limit
async def health(request: Request):
    return success(data=health_status("main"))
