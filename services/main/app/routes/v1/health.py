from fastapi import APIRouter
from ksu_common.observability import health_status
from ksu_common.schemas import success

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    return success(data=health_status("main"))
