"""Admin permission endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ksu_common.schemas.responses import SuccessResponse, success

from ....deps import CurrentUser, DbSession, require_scope
from ....models import Permission
from ....services import RBACService
from ....schemas.rbac import PermissionSnapshot
from .._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get(
    "",
    response_model=SuccessResponse[list[PermissionSnapshot]],
    response_model_exclude_unset=True,
    dependencies=[Depends(require_scope("permissions.view"))],
)
async def list_permissions(db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Permission, fields)
    return success(data=selector.apply(await RBACService.list_permissions(db)))


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[PermissionSnapshot],
    response_model_exclude_unset=True,
    dependencies=[Depends(require_scope("permissions.manage"))],
)
async def create_permission(
    db: DbSession,
    _: CurrentUser,
    name: str,
    description: str | None = None,
    resource: str | None = None,
    action: str | None = None,
):
    permission = await RBACService.create_permission(
        db,
        name=name,
        description=description,
        resource=resource,
        action=action,
        is_active=True,
    )
    return success(data=permission, message="Permission created")
