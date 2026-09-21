from __future__ import annotations


class WorkflowError(ValueError):
    pass


def require_editable(record, *, deleting=False):
    """Approved content must return through the workflow before revision."""
    from fastapi import HTTPException
    from ..models.content import PublicationStatus

    state = getattr(record, "status", None)
    if isinstance(state, PublicationStatus):
        allowed = {PublicationStatus.DRAFT}
        if deleting:
            allowed.add(PublicationStatus.ARCHIVED)
        if state not in allowed:
            raise HTTPException(409, "Return content to draft through the workflow before editing; archive before deletion")


async def lock_record(db, model, record_id):
    from fastapi import HTTPException
    from sqlalchemy import select
    from ..models.content import PageSection

    parent_id = None
    if model is PageSection:
        parent_id = await db.scalar(select(PageSection.page_id).where(
            PageSection.id == record_id, PageSection.deleted_at.is_(None),
        ))
        if parent_id is None:
            return None
        await lock_section_parent(db, parent_id)
    record = await db.scalar(select(model).where(
        model.id == record_id, model.deleted_at.is_(None),
    ).with_for_update().execution_options(populate_existing=True))
    if record is not None and parent_id is not None and record.page_id != parent_id:
        raise HTTPException(409, "Page section ownership changed; retry the command")
    return record


async def lock_section_parent(db, page_id):
    from fastapi import HTTPException
    from uuid import UUID
    from ..models.content import Page

    try:
        identifier = UUID(str(page_id))
    except (ValueError, TypeError) as exc:
        raise HTTPException(422, "A valid parent page is required") from exc
    page = await lock_record(db, Page, identifier)
    if page is None:
        raise HTTPException(422, "Parent page is unavailable")
    require_editable(page)
    return page


async def validate_section_values(db, model, values, *, record=None):
    from fastapi import HTTPException
    from ..models.content import PageSection

    if model is not PageSection:
        return
    if record is None:
        page = await lock_section_parent(db, values.get("page_id"))
        values["page_id"] = page.id
    elif "page_id" in values:
        if str(values["page_id"]) != str(record.page_id):
            raise HTTPException(422, "Moving page sections requires an explicit ownership transfer command")
        values["page_id"] = record.page_id


TRANSITIONS: dict[str, set[str]] = {
    "draft": {"in_review", "archived"},
    "in_review": {"draft", "approved", "archived"},
    "approved": {"scheduled", "published", "draft", "archived"},
    "scheduled": {"published", "approved", "archived"},
    "published": {"archived"},
    "archived": {"draft", "published"},
}

TRANSITION_PERMISSIONS: dict[str, dict[str, str]] = {
    "draft": {"in_review": "heri.content.submit", "archived": "heri.content.publish"},
    "in_review": {
        "draft": "heri.content.review",
        "approved": "heri.content.approve",
        "archived": "heri.content.publish",
    },
    "approved": {
        "scheduled": "heri.content.schedule",
        "published": "heri.content.publish",
        "draft": "heri.content.review",
        "archived": "heri.content.publish",
    },
    "scheduled": {
        "published": "heri.content.publish",
        "approved": "heri.content.schedule",
        "archived": "heri.content.schedule",
    },
    "published": {"archived": "heri.content.unpublish"},
    "archived": {
        "draft": "heri.content.review",
        "published": "heri.content.publish",
    },
}


class WorkflowService:
    def transition(self, current: str, target: str) -> str:
        if target not in TRANSITIONS.get(current, set()):
            raise WorkflowError(f"Cannot transition {current} to {target}")
        return target

    def transition_permission(self, current: str, target: str) -> str:
        self.transition(current, target)
        return TRANSITION_PERMISSIONS[current][target]


def scheduled_time(value):
    from datetime import datetime, timezone
    from fastapi import HTTPException

    try:
        moment = datetime.fromisoformat(value.replace("Z", "+00:00")) if isinstance(value, str) else value
        if not isinstance(moment, datetime) or moment.tzinfo is None or moment.utcoffset() is None:
            raise ValueError("timezone required")
        moment = moment.astimezone(timezone.utc)
        if moment <= datetime.now(timezone.utc):
            raise ValueError("future time required")
        return moment
    except (ValueError, TypeError) as exc:
        raise HTTPException(422, "Scheduling requires a timezone-aware future scheduled_at") from exc


def record_transition_permission(record, target):
    from datetime import datetime, timezone
    current = getattr(record.status, "value", str(record.status))
    permission = WorkflowService().transition_permission(current, target)
    due = getattr(record, "scheduled_at", None)
    if current == "scheduled" and target in {"approved", "archived"} and due is not None and due <= datetime.now(timezone.utc):
        return "heri.content.unpublish"
    return permission


def transition_values(record, target, *, actor, scheduled_at=None):
    """Validate one workflow action and derive its fields without mutating."""
    from fastapi import HTTPException
    from ..core.auth import authorize_permission

    model = type(record)
    values = {}
    current = getattr(record.status, "value", str(record.status))
    try:
        permission = record_transition_permission(record, target)
    except WorkflowError as exc:
        raise HTTPException(422, str(exc)) from exc
    if not authorize_permission(actor, permission).allowed:
        raise HTTPException(403, "Insufficient privileges for this workflow transition")
    if target == "scheduled":
        if not hasattr(model, "scheduled_at"):
            raise HTTPException(422, "Resource does not support scheduling")
        values["scheduled_at"] = scheduled_time(scheduled_at if scheduled_at is not None else record.scheduled_at)
    elif scheduled_at is not None:
        raise HTTPException(422, "scheduled_at is only accepted when scheduling")
    elif current == "scheduled":
        values["scheduled_at"] = None
    if target == "published" and hasattr(model, "published_at"):
        from datetime import datetime, timezone
        values["published_at"] = datetime.now(timezone.utc)
    try:
        values["status"] = model.status.type.enum_class(target)
    except ValueError as exc:
        raise HTTPException(422, "Invalid workflow status") from exc
    return values


async def transition_record(db, model, record_id, target, *, actor, entity_type, note=None, ip_address=None, scheduled_at=None):
    """Serialize a transition and its audit in the caller-owned transaction."""
    from fastapi import HTTPException

    from .audit import record_audit

    record = await lock_record(db, model, record_id)
    if record is None:
        raise HTTPException(404, "Record not found")
    current = getattr(record.status, "value", str(record.status))
    values = transition_values(record, target, actor=actor, scheduled_at=scheduled_at)
    for key, value in values.items():
        setattr(record, key, value)
    await record_audit(
        db, action="transition", entity_type=entity_type, entity_id=str(record.id),
        actor_id=str(actor.sub), previous_value={"status": current},
        new_value={"status": target, "note": note,
                   **({"scheduled_at": record.scheduled_at} if target == "scheduled" else {})}, ip_address=ip_address,
    )
    await db.flush()
    return record
