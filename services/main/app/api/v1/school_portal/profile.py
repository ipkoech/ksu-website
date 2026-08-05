"""School Portal profile endpoints."""

import uuid

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
    unlink_school_profile_media,
    update_school_profile,
)

router = APIRouter()


async def _profile_payload(db: DbSession, context: CurrentSchoolContext) -> dict:
    profile_links = await MediaService.list_links(
        db,
        user=context.user,
        entity_type="school",
        entity_id=context.school.id,
    )
    links_by_slot = {
        (link.role, link.media_id): link
        for link in profile_links
        if link.role in {"logo", "cover", "brochure", "gallery"}
    }

    def media_payload(media, role: str):
        if media is None:
            return None
        link = links_by_slot.get((role, media.id))
        return {
            "id": media.id,
            "link_id": link.id if link is not None else None,
            "url": media.url,
            "title": media.title,
            "alt_text": media.alt_text,
            "description": media.description,
        }

    payload = SchoolPortalProfileResponse.model_validate(
        {
            **{
                field: getattr(context.school, field, None)
                for field in SchoolPortalProfileResponse.model_fields
                if field not in {"logo_image", "cover_image", "brochure", "gallery"}
            },
            "logo_image": media_payload(context.school.logo_image, "logo"),
            "cover_image": media_payload(context.school.cover_image, "cover"),
            "brochure": media_payload(context.school.brochure, "brochure"),
            "gallery": [
                media_payload(link.media, "gallery")
                for link in profile_links
                if link.role == "gallery"
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


@router.delete("/profile/media/{link_id}")
async def delete_school_profile_media(
    link_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await unlink_school_profile_media(db, context, link_id)
    return success(data=await _profile_payload(db, context))


__all__ = ["router"]
