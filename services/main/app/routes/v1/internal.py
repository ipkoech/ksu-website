"""Internal endpoints consumed only by sibling services (Research, Library).

Protected by INTERNAL_API_KEY header — not exposed through the public gateway.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import get_settings
from ...core.database import get_db

router = APIRouter(tags=["Internal"])
settings = get_settings()


def verify_internal_key(x_internal_key: str = Header(...)) -> None:
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid internal key")


@router.get("/persons/{person_id}", dependencies=[Depends(verify_internal_key)])
async def get_person_snapshot(person_id: str, db: AsyncSession = Depends(get_db)):
    """Return a minimal person snapshot for sibling services (Research, Library)."""
    # Populated in Phase 3 when Person model is migrated
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet migrated")
