"""School-scoped audit trail endpoint."""

from fastapi import APIRouter, HTTPException, Query
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....services.audit import AuditService
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


@router.get("/audit")
async def list_school_audit(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    action: str | None = None,
    resource_type: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
):
    if "school.audit.view" not in context.permissions:
        raise HTTPException(
            status_code=403,
            detail="school.audit.view permission is required",
        )
    result = await AuditService.list_for_school(
        db,
        school_id=context.school.id,
        page=page,
        per_page=per_page,
        action=action,
        resource_type=resource_type,
        status=status_filter,
    )
    return success(data=result.items, meta=result.meta)


__all__ = ["list_school_audit", "router"]
