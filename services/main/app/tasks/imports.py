"""Celery tasks for bulk imports."""

from __future__ import annotations

import uuid
from typing import Any

from ksu_common.task_queue import run_worker_async
from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import authorize_permission

from ..core.database import AsyncSessionLocal
from ..deps import permissions_for_user
from ..models import Person, Role, RolePermission, School, User, UserRole
from ..schemas.imports import ImportCommitRequest
from ..schemas.school_portal_team import SchoolTeamMemberCreate
from ..services.domain_events import enqueue_domain_event
from ..services.notification import NotificationService
from ..services.imports import ImportService
from ..services.school_portal_context import resolve_school_portal_context
from ..services.user import UserService
from ..services.auth import _active_scope_grants
from ..services.school_portal_team import (
    create_school_team_member,
    preview_school_team_import,
    school_import_resource_id,
)
from .celery_app import celery_app
from sqlalchemy import select
from sqlalchemy.orm import selectinload


@celery_app.task(name="main.imports.commit")
def commit_import(resource_key: str, payload: dict[str, Any], user_id: str | None = None) -> dict[str, Any]:
    return run_worker_async(_commit_import(resource_key, payload, user_id))


@celery_app.task(name="main.imports.school_team_commit")
def commit_school_team_import(
    payload: dict[str, Any],
    school_id: str,
    actor_id: str,
) -> dict[str, Any]:
    return run_worker_async(_commit_school_team_import(payload, school_id, actor_id))


def enqueue_school_import_progress(
    db,
    *,
    school_id: uuid.UUID,
    actor_id: uuid.UUID,
    import_id: uuid.UUID,
    processed_rows: int,
    total_rows: int,
    last_percent: int,
) -> int:
    percent = 100 if total_rows == 0 else int(processed_rows * 100 / total_rows)
    if percent < 100 and percent - last_percent < 10:
        return last_percent
    enqueue_domain_event(
        db,
        event_type="school.import.progress",
        scope_type="school",
        scope_id=school_id,
        actor_id=actor_id,
        resource_type="import",
        resource_id=import_id,
        data={
            "resource": "school-team",
            "processed_rows": processed_rows,
            "total_rows": total_rows,
            "percent": percent,
        },
    )
    return percent


async def _run_school_team_import(
    payload: dict[str, Any],
    school_id: uuid.UUID,
    actor_id: uuid.UUID,
) -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        school = await School.get_by_id(db, school_id)
        actor = await db.scalar(
            select(User)
            .options(
                selectinload(User.person).selectinload(Person.assignments),
                selectinload(User.role_assignments)
                .selectinload(UserRole.role)
                .selectinload(Role.role_permissions)
                .selectinload(RolePermission.permission),
            )
            .where(User.id == actor_id, User.deleted_at.is_(None), User.is_active.is_(True))
        )
        if school is None or actor is None:
            raise ValueError("School import context is unavailable")
        context = await resolve_school_portal_context(db, actor, school_id)
        if "school.team.bulk" not in context.permissions:
            raise ValueError("School import authority is no longer assigned")
        preview = await preview_school_team_import(
            db, school_id, payload.get("rows", [])
        )
        import_id = school_import_resource_id(payload["idempotency_key"])
        last_percent = 0
        created = failed = skipped = 0
        results = []
        for row in preview.rows:
            if row.status != "valid" or row.payload is None:
                skipped += 1
                results.append(
                    {
                        "row_number": row.row_number,
                        "status": "skipped",
                        "errors": row.errors,
                    }
                )
                last_percent = enqueue_school_import_progress(
                    db,
                    school_id=school_id,
                    actor_id=actor_id,
                    import_id=import_id,
                    processed_rows=row.row_number,
                    total_rows=len(preview.rows),
                    last_percent=last_percent,
                )
                continue
            source = row.payload
            email = source["email"]
            local_name = email.split("@", 1)[0].replace(".", " ").replace("_", " ")
            parts = [part.title() for part in local_name.split() if part]
            try:
                member = SchoolTeamMemberCreate(
                    first_name=source.get("first_name") or (parts[0] if parts else "Staff"),
                    last_name=source.get("last_name") or (parts[-1] if len(parts) > 1 else "Member"),
                    full_name=source.get("full_name"),
                    email=email,
                    employee_number=source.get("employee_number"),
                    role=source["role"],
                    title=source.get("title"),
                    invite_user=bool(source.get("invite_user", False)),
                    portal_role=source.get("portal_role"),
                )
                assignment = await create_school_team_member(db, context, member)
            except Exception as exc:  # noqa: BLE001 - row failure is returned.
                failed += 1
                results.append(
                    {
                        "row_number": row.row_number,
                        "status": "failed",
                        "errors": [str(exc)],
                    }
                )
            else:
                created += 1
                results.append(
                    {
                        "row_number": row.row_number,
                        "status": "created",
                        "id": str(assignment.id),
                    }
                )
            last_percent = enqueue_school_import_progress(
                db,
                school_id=school_id,
                actor_id=actor_id,
                import_id=import_id,
                processed_rows=row.row_number,
                total_rows=len(preview.rows),
                last_percent=last_percent,
            )
        await db.commit()
    return {
        "resource": "school-team",
        "total_rows": len(preview.rows),
        "created_rows": created,
        "skipped_rows": skipped,
        "failed_rows": failed,
        "rows": results,
    }


async def _persist_school_import_event(
    *,
    event_type: str,
    school_id: uuid.UUID,
    actor_id: uuid.UUID,
    data: dict[str, Any],
) -> None:
    async with AsyncSessionLocal() as db:
        enqueue_domain_event(
            db,
            event_type=event_type,
            scope_type="school",
            scope_id=school_id,
            actor_id=actor_id,
            resource_type="import",
            resource_id=uuid.uuid4(),
            data=data,
        )
        await db.commit()


async def _commit_school_team_import(
    payload: dict[str, Any],
    school_id: str,
    actor_id: str,
) -> dict[str, Any]:
    school_uuid = uuid.UUID(school_id)
    actor_uuid = uuid.UUID(actor_id)
    try:
        result = await _run_school_team_import(payload, school_uuid, actor_uuid)
    except Exception as exc:
        await _persist_school_import_event(
            event_type="school.import.failed",
            school_id=school_uuid,
            actor_id=actor_uuid,
            data={"resource": "school-team", "error": str(exc)},
        )
        raise
    await _persist_school_import_event(
        event_type="school.import.completed",
        school_id=school_uuid,
        actor_id=actor_uuid,
        data=result,
    )
    return result


async def _commit_import(resource_key: str, payload: dict[str, Any], user_id: str | None = None) -> dict[str, Any]:
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise ValueError("Import resource not found")

    request = ImportCommitRequest.model_validate(payload)
    async with AsyncSessionLocal() as db:
        try:
            actor = await db.scalar(
                select(User)
                .options(*UserService._auth_load_options())
                .where(User.id == uuid.UUID(user_id) if user_id else False,
                       User.deleted_at.is_(None), User.is_active.is_(True))
            )
            if actor is None:
                raise ValueError("Import authority is no longer assigned")
            actor_payload = TokenPayload(
                sub=str(actor.id),
                jti="import-worker",
                raw={
                    "permissions": list(permissions_for_user(actor)),
                    "scope_grants": _active_scope_grants(actor),
                },
            )
            if not authorize_permission(actor_payload, config.scope).allowed:
                raise ValueError("Import authority is no longer assigned")
            result = await ImportService.commit(db, config, request, actor_id=user_id)
            if user_id:
                await NotificationService.send_to_user(
                    db,
                    user_id=uuid.UUID(user_id),
                    title="Import completed",
                    subject=f"{config.label} import completed",
                    message=(
                        f"Created {result.created_rows}, skipped {result.skipped_rows}, "
                        f"failed {result.failed_rows}."
                    ),
                    notification_type="success" if result.failed_rows == 0 else "warning",
                    priority="normal",
                    action_url="/research/projects" if resource_key == "research-projects" else "/research",
                    scope_type="research",
                    channels=["in_app"],
                    payload={
                        "event": "import.completed",
                        "resource": resource_key,
                        "created_rows": result.created_rows,
                        "skipped_rows": result.skipped_rows,
                        "failed_rows": result.failed_rows,
                    },
                )
            await db.commit()
        except Exception:
            await db.rollback()
            raise

    completed = result.model_dump(mode="json")
    # Keep the async artifact bound to the account that queued it.  The
    # status endpoint uses this private field before exposing the result.
    completed["_actor_id"] = str(user_id) if user_id else None
    return completed
