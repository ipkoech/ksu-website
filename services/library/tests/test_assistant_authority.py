import time
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.services import assistant_contexts as svc
from app.schemas import LibraryAssistantContextUpdate


@pytest.mark.asyncio
@pytest.mark.parametrize("permission, own, mfa, allowed", [
    ("library.write", True, True, False),
    ("library.assistant.manage", True, True, False),
    ("library.assistant.publish", False, True, False),
    ("library.assistant.publish", True, False, False),
    ("library.assistant.publish", True, True, True),
])
async def test_canonical_assistant_publication_authority(monkeypatch, permission, own, mfa, allowed):
    branch = uuid4()
    context = SimpleNamespace(library_id=branch, status="draft", is_public=False,
                              sources=[SimpleNamespace(is_approved=True, deleted_at=None)])
    actor = TokenPayload("actor", "session", raw={"scope_grants": [{
        "scope_type": "library", "scope_id": str(branch if own else uuid4()), "permissions": [permission],
    }], "mfa_enabled": mfa, "mfa_verified_at": time.time()})
    monkeypatch.setattr(svc, "lock_owner", AsyncMock())
    monkeypatch.setattr(svc, "validate_sources", AsyncMock())
    monkeypatch.setattr(svc, "_context_data", lambda value: {"status": value.status})
    db = SimpleNamespace(refresh=AsyncMock(), flush=AsyncMock())
    if allowed:
        assert await svc.publish_context(db, context, actor=actor) == {"status": "active"}
    else:
        with pytest.raises(HTTPException) as error:
            await svc.publish_context(db, context, actor=actor)
        assert error.value.status_code == 403
        assert context.status == "draft" and not context.is_public


@pytest.mark.asyncio
async def test_editing_active_context_cannot_bypass_unpublish_authority(monkeypatch):
    branch = uuid4()
    actor = TokenPayload("actor", "session", raw={"scope_grants": [{
        "scope_type": "library", "scope_id": str(branch), "permissions": ["library.assistant.manage"],
    }]})
    context = SimpleNamespace(library_id=branch, status="active", is_public=True, name="Original")
    monkeypatch.setattr(svc, "lock_owner", AsyncMock())
    db = SimpleNamespace(refresh=AsyncMock())
    with pytest.raises(HTTPException):
        await svc.update_context(db, context, LibraryAssistantContextUpdate(name="Changed"),
                                 approved_by_person_id=uuid4(), actor=actor)
    assert context.name == "Original" and context.is_public
