from fastapi import APIRouter
from ksu_common.schemas import success

router = APIRouter(tags=["HERI Health"])


@router.get("/health")
async def health():
    return success(data={"service": "heri-africa", "status": "ok"})
