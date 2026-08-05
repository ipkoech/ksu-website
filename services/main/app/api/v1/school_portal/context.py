"""School Portal bootstrap and capability endpoints."""

from fastapi import APIRouter

from ksu_common.schemas.responses import success

from ....schemas.school_portal import (
    SchoolPortalCapabilitiesResponse,
    SchoolPortalContextResponse,
)
from ....services.school_portal_context import (
    SCHOOL_PORTAL_PERMISSIONS,
    CurrentSchoolContext,
    SchoolPortalContext,
    allowed_school_navigation,
)

router = APIRouter()


def context_response(context: SchoolPortalContext) -> SchoolPortalContextResponse:
    school = context.school
    active_departments = sorted(
        (
            department
            for department in getattr(school, "departments", ()) or ()
            if getattr(department, "is_active", True)
            and getattr(department, "deleted_at", None) is None
        ),
        key=lambda department: (
            getattr(department, "display_order", 100),
            getattr(department, "name", ""),
        ),
    )
    school_payload = {
        field: getattr(school, field, None)
        for field in (
            "id",
            "name",
            "slug",
            "code",
            "school_type",
            "campus_id",
            "administrative_wing_id",
            "dean_id",
            "logo_image_id",
            "cover_image_id",
            "brochure_id",
            "is_active",
            "is_public",
            "campus",
            "administrative_wing",
            "dean",
            "logo_image",
            "cover_image",
            "brochure",
        )
    }
    school_payload["departments"] = active_departments
    capabilities = {
        permission: permission in context.permissions
        for permission in SCHOOL_PORTAL_PERMISSIONS
    }
    return SchoolPortalContextResponse(
        school=school_payload,
        user=context.user,
        permissions=list(context.permissions),
        role_names=list(context.role_names),
        capabilities=capabilities,
        allowed_navigation=allowed_school_navigation(context.permissions),
    )


@router.get("/context")
async def get_context(context: CurrentSchoolContext):
    """Return the one school and capabilities derived from server-side grants."""
    return success(data=context_response(context).model_dump(mode="json"))


@router.get("/capabilities")
async def get_capabilities(context: CurrentSchoolContext):
    """Return the current school's permission and navigation capability map."""
    response = context_response(context)
    payload = SchoolPortalCapabilitiesResponse(
        school_id=context.school.id,
        permissions=response.permissions,
        capabilities=response.capabilities,
        allowed_navigation=response.allowed_navigation,
    )
    return success(data=payload.model_dump(mode="json"))


__all__ = ["context_response", "get_capabilities", "get_context", "router"]
