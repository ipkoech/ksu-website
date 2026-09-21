from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

from app.models.content import NewsArticle, PublicationStatus
from app.models.audit import AuditLog
from app.services.admin_resources import writable_fields


@pytest.mark.parametrize("value", [None, "invalid", "2020-01-01T00:00:00Z", "2099-01-01T00:00:00", 123])
def test_schedule_requires_an_explicit_future_instant(value):
    from app.services.workflow import scheduled_time
    with pytest.raises(HTTPException) as invalid:
        scheduled_time(value)
    assert invalid.value.status_code == 422


def test_schedule_normalizes_timezone_offset():
    from datetime import datetime, timezone
    from app.services.workflow import scheduled_time
    assert scheduled_time("2099-01-01T03:00:00+03:00") == datetime(2099, 1, 1, tzinfo=timezone.utc)


def test_due_schedule_cancellation_requires_unpublish_authority():
    from datetime import datetime, timedelta, timezone
    from app.services.workflow import record_transition_permission
    article = NewsArticle(status=PublicationStatus.SCHEDULED,
                          scheduled_at=datetime.now(timezone.utc) - timedelta(seconds=1))
    assert record_transition_permission(article, "approved") == "heri.content.unpublish"
    assert record_transition_permission(article, "archived") == "heri.content.unpublish"


@pytest.mark.parametrize("state", list(PublicationStatus))
@pytest.mark.parametrize("deleting", [False, True])
def test_editorial_revision_and_delete_require_safe_workflow_state(state, deleting):
    from app.services.workflow import require_editable
    record = NewsArticle(slug="test", title="Test", status=state)
    allowed = state is PublicationStatus.DRAFT or (deleting and state is PublicationStatus.ARCHIVED)
    if allowed:
        require_editable(record, deleting=deleting)
    else:
        with pytest.raises(HTTPException) as denied:
            require_editable(record, deleting=deleting)
        assert denied.value.status_code == 409


def test_generic_content_writes_cannot_change_publication_state() -> None:
    fields = writable_fields(NewsArticle)

    assert "status" not in fields
    assert "published_at" in fields

    article = NewsArticle(slug="draft", title="Draft")
    assert article.status is None or article.status is PublicationStatus.DRAFT


@pytest.mark.asyncio
async def test_restore_publication_status_uses_transition_permission(monkeypatch) -> None:
    from app.routes.v1 import admin_resources
    from app.core import auth

    record_id = uuid.uuid4()
    audit_id = uuid.uuid4()
    article = NewsArticle(id=record_id, slug="draft", title="Draft", status=PublicationStatus.DRAFT)
    audit = AuditLog(
        id=audit_id,
        action="update",
        entity_type="news",
        entity_id=str(record_id),
        previous_value={"status": "in_review"},
    )

    class FakeDB:
        async def scalar(self, query):
            return article

        async def get(self, model, identifier):
            return article if model is NewsArticle else audit

    class Request:
        client = None

    class User:
        sub = str(uuid.uuid4())

    async def record_audit(*args, **kwargs):
        return None

    monkeypatch.setattr(admin_resources, "record_audit", record_audit)
    monkeypatch.setattr(
        auth,
        "authorize_permission",
        lambda *_args, **_kwargs: type("Decision", (), {"allowed": False})(),
    )
    with pytest.raises(HTTPException) as denied:
        await admin_resources.restore_resource(
            "news", record_id, {"audit_id": str(audit_id)}, Request(), FakeDB(), User()
        )
    assert denied.value.status_code == 403
    assert article.status is PublicationStatus.DRAFT

    monkeypatch.setattr(
        auth,
        "authorize_permission",
        lambda *_args, **_kwargs: type("Decision", (), {"allowed": True})(),
    )
    restored = await admin_resources.restore_resource(
        "news", record_id, {"audit_id": str(audit_id)}, Request(), FakeDB(), User()
    )
    assert restored is article
    assert article.status is PublicationStatus.IN_REVIEW
