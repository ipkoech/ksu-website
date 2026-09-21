from fastapi import APIRouter
from ksu_common.observability import health_status
from ksu_common.schemas import HealthPayload, SuccessResponse, success

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=SuccessResponse[HealthPayload])
async def health():
    return success(data=health_status("research"))
