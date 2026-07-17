"""School Portal profile endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.school_portal import (
    SchoolPortalDeanUpdate,
    SchoolPortalMediaLinkCreate,
    SchoolPortalProfileResponse,
    SchoolPortalProfileUpdate,
)
from ....services.media import MediaService
from ....services.school_portal_context import CurrentSchoolContext
from ....services.school_portal_profile import (
    link_school_profile_media,
    set_school_dean,
    update_school_profile,
)

router = APIRouter()


async def _profile_payload(db: DbSession, context: CurrentSchoolContext) -> dict:
    gallery_links = await MediaService.list_links(
        db,
        user=context.user,
        entity_type="school",
        entity_id=context.school.id,
        role="gallery",
    )
    payload = SchoolPortalProfileResponse.model_validate(
        {
            **{
                field: getattr(context.school, field, None)
                for field in SchoolPortalProfileResponse.model_fields
                if field != "gallery"
            },
            "gallery": [
                link.media
                for link in gallery_links
                if getattr(link, "media", None) is not None
            ],
        }
    )
    return payload.model_dump(mode="json")


@router.get("/profile")
async def get_school_profile(db: DbSession, context: CurrentSchoolContext):
    return success(data=await _profile_payload(db, context))


@router.patch("/profile")
async def patch_school_profile(
    data: SchoolPortalProfileUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await update_school_profile(db, context, data)
    return success(data=await _profile_payload(db, context))


@router.put("/profile/dean")
async def put_school_dean(
    data: SchoolPortalDeanUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await set_school_dean(db, context, data)
    return success(data=await _profile_payload(db, context))


@router.post("/profile/media")
async def post_school_profile_media(
    data: SchoolPortalMediaLinkCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await link_school_profile_media(db, context, data)
    return success(data=await _profile_payload(db, context))


__all__ = ["router"]
