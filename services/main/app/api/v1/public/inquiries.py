"""Rate-limited public school inquiry submission."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from ksu_common import rate_limit
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....models import School
from ....schemas.contact_inquiry import PublicSchoolInquiryCreate
from ....services.contact_inquiry import ContactInquiryService

router = APIRouter()


@router.post(
    "/schools/{school_slug}/inquiries",
    status_code=status.HTTP_201_CREATED,
)
@rate_limit(requests=5, window=300, prefix="main:school-inquiries")
async def create_public_school_inquiry(
    school_slug: str,
    request: Request,
    data: PublicSchoolInquiryCreate,
    db: DbSession,
):
    result = await db.execute(
        select(School).where(
            School.slug == school_slug,
            School.is_active.is_(True),
            School.is_public.is_(True),
            School.deleted_at.is_(None),
        )
    )
    school = result.scalar_one_or_none()
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    item = await ContactInquiryService.create_public(
        db,
        school=school,
        data=data,
        source_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    return success(
        data={
            "id": item.id,
            "reference_number": item.reference_number,
            "status": item.status,
        },
        message="Inquiry received",
    )
