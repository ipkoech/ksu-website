"""Off-request audit persistence for the library service.

The row is built inside the request — the Request and its body are gone
afterwards — but the database write happens in a Celery worker, so auditing
costs the response nothing.

The task and dispatcher are built by the shared factory; only the task name is
service-owned, because it is routed per service and already-queued messages
carry it.
"""

from __future__ import annotations

from ksu_common.audit import build_audit_tasks

from ..core.database import AsyncSessionLocal
from .celery_app import celery_app

persist_audit, dispatch_audit = build_audit_tasks(
    celery_app,
    AsyncSessionLocal,
    task_name="library.audit.persist",
)
