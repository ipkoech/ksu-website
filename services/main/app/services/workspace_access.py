"""Tab-independent workspace visits over current assignments and preferences."""

from uuid import UUID, uuid4

from fastapi import HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from ksu_contracts.workspaces import ScopeChoice, Workspace, WorkspaceContext, workspace_context

from ..models import UserPreference
from ..security.workspace_scopes import active_workspace_actor
from ..tasks.audit import capture_request_audit, dispatch_audit


class WorkspaceVisit(BaseModel):
    scope: ScopeChoice | None = None
    previous_visit_id: UUID | None = None
    visit_id: UUID = Field(default_factory=uuid4)


class ActivatedWorkspace(BaseModel):
    context: WorkspaceContext
    visit_id: UUID


async def discover_workspaces(db, actor):
    actor = await active_workspace_actor(db, actor)
    contexts = []
    for workspace in Workspace:
        try:
            contexts.append(workspace_context(actor, workspace))
        except PermissionError:
            continue
    return contexts


async def preferred_workspace(db, actor):
    value = await db.scalar(select(UserPreference.value).where(
        UserPreference.user_id == UUID(actor.sub), UserPreference.namespace == "workspace",
        UserPreference.key == "last_selected",
    ))
    if not isinstance(value, dict):
        return None
    try:
        scope = ScopeChoice.model_validate(value["scope"])
        current = await active_workspace_actor(db, actor, scope)
        return workspace_context(current, Workspace(value["workspace"]), scope)
    except (ValueError, KeyError, TypeError, PermissionError):
        return None


async def visit_workspace(db, actor, workspace, data, request, *, exiting=False):
    context = None
    failure = None
    try:
        current = await active_workspace_actor(db, actor, data.scope)
        context = workspace_context(current, workspace, data.scope)
        if data.scope is None:
            if len(context.scopes) != 1:
                raise PermissionError("Select one assigned scope")
            context = workspace_context(current, workspace, context.scopes[0])
    except PermissionError as exc:
        failure = exc
    action = "exit" if exiting else ("switch" if data.previous_visit_id else "enter")
    payload = {
        "id": str(data.visit_id),
        "service_name": "main", "action": f"workspace.{action}",
        "resource_type": "workspace", "resource_id": workspace.value,
        "user_id": str(actor.sub), "request_method": request.method,
        "request_path": request.url.path, "status_code": 403 if failure else 200,
        "status": "failure" if failure else "success",
        "details": {"workspace": workspace.value,
                    "scope": (context.selected_scope if context else data.scope).model_dump()
                    if (context and context.selected_scope) or data.scope else None,
                    "outcome": "denied" if failure else "allowed",
                    "visit_id": str(data.visit_id),
                    "previous_visit_id": str(data.previous_visit_id) if data.previous_visit_id else None,
                    "request_id": getattr(request.state, "request_id", None),
                    "platform_authority": bool(context and context.platform_authority)},
    }
    if failure:
        # The request transaction will roll back; use existing independent capture.
        await dispatch_audit(payload)
        code = "workspace_selection_required" if str(failure).startswith("Select one") else (
            "access_revoked" if data.previous_visit_id else "access_not_assigned"
        )
        raise HTTPException(403, {"code": code, "message": str(failure)}) from failure
    try:
        await capture_request_audit(db, payload)
    except KeyError:
        # A malformed legacy audit payload must not prevent a valid workspace
        # activation; the request itself remains authoritative.
        pass
    if not exiting:
        value = {"workspace": workspace.value, "scope": context.selected_scope.model_dump()}
        statement = insert(UserPreference).values(
            user_id=UUID(actor.sub), namespace="workspace", key="last_selected", value=value,
        )
        await db.execute(statement.on_conflict_do_update(
            constraint="uq_user_preferences_user_namespace_key", set_={"value": value},
        ))
    return ActivatedWorkspace(context=context, visit_id=data.visit_id)
