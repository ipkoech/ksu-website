"""Authenticated discovery of operational views from current assignments."""

from fastapi import APIRouter, HTTPException, Query, Response, Request
from ksu_common.schemas.responses import SuccessResponse, success
from ksu_contracts.workspaces import ScopeChoice, Workspace, WorkspaceContext, workspace_context

from ...deps import CurrentToken, DbSession
from ...security.workspace_scopes import active_workspace_actor
from ...services.workspace_access import ActivatedWorkspace, WorkspaceVisit, discover_workspaces, visit_workspace

router = APIRouter()


@router.get("", response_model=SuccessResponse[list[WorkspaceContext]])
async def list_workspaces(actor: CurrentToken, response: Response, db: DbSession):
    response.headers["Cache-Control"] = "no-store"
    return success(data=await discover_workspaces(db, actor))


@router.post("/{workspace}/activate", response_model=SuccessResponse[ActivatedWorkspace])
async def activate_workspace(workspace: Workspace, data: WorkspaceVisit, request: Request,
                             actor: CurrentToken, response: Response, db: DbSession):
    response.headers["Cache-Control"] = "no-store"
    return success(data=await visit_workspace(db, actor, workspace, data, request))


@router.post("/{workspace}/exit", response_model=SuccessResponse[ActivatedWorkspace])
async def exit_workspace(workspace: Workspace, data: WorkspaceVisit, request: Request,
                         actor: CurrentToken, response: Response, db: DbSession):
    response.headers["Cache-Control"] = "no-store"
    return success(data=await visit_workspace(db, actor, workspace, data, request, exiting=True))


@router.get("/{workspace}/context", response_model=SuccessResponse[WorkspaceContext])
async def get_workspace_context(
    workspace: Workspace, actor: CurrentToken, response: Response, db: DbSession,
    scope_type: str | None = Query(default=None, max_length=32),
    scope_id: str | None = Query(default=None, max_length=64),
):
    response.headers["Cache-Control"] = "no-store"
    if scope_id and not scope_type:
        raise HTTPException(422, "scope_type is required with scope_id")
    selected = ScopeChoice(scope_type=scope_type, scope_id=scope_id) if scope_type else None
    try:
        actor = await active_workspace_actor(db, actor, selected)
        return success(data=workspace_context(actor, workspace, selected))
    except PermissionError as exc:
        raise HTTPException(403, str(exc)) from exc
