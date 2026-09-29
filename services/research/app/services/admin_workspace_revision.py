"""Optimistic edit preconditions calculated from existing timestamps; no new column.

Research Admin sends a strong If-Match token obtained from its private read.
The existing CRUD handlers lock the stored row before scope checks and compare
this token only after authorization. Other clients remain backward compatible.
"""
from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import re

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import lazyload

EXPECTED_ACTOR = "X-KSU-Expected-Actor"


def record_revision(record) -> str | None:
    raw = getattr(record, "updated_at", None)
    if raw is None:
        return None
    try:
        timestamp = raw if isinstance(raw, datetime) else datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    stamp = timestamp.astimezone(timezone.utc).isoformat(timespec="microseconds")
    digest = hashlib.sha256(f"{str(record.id).lower()}:{stamp}".encode()).hexdigest()
    return f'"rw-{digest}"'


async def lock_workspace_record(db, model, item, request=None):
    """Lock before ownership checks, including for legacy native CRUD callers.

    If-Match remains opt-in for legacy clients, but ownership must always be
    checked on a fresh locked row rather than a pre-lock identity-map snapshot.
    """
    row = await db.scalar(select(model).options(lazyload("*")).where(
        model.id == item.id, model.deleted_at.is_(None),
    ).with_for_update().execution_options(populate_existing=True))
    if row is None:
        raise HTTPException(404, "Record not found")
    return row


def require_workspace_revision(record, request) -> None:
    expected = request.headers.get("If-Match")
    if expected is None:
        if request.headers.get(EXPECTED_ACTOR):
            raise HTTPException(428, "Reload the current record before editing: a workspace revision is required")
        return
    if not re.fullmatch(r'"rw-[0-9a-f]{64}"', expected):
        raise HTTPException(412, "Invalid record revision. Reload the current record before editing")
    actual = record_revision(record)
    if actual is None or expected != actual:
        raise HTTPException(412, "The record changed after it was opened. Reload it before submitting another change")
