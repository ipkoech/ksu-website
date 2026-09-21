from types import SimpleNamespace
import time
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload
from pydantic import BaseModel

from app.models import Partner
from app.routes.v1._crud import build_crud_router
from app.services.research_workflow_commands import create_editorial_record


class Patch(BaseModel):
    name: str | None = None
    status: str | None = None
    is_active: bool | None = None


@pytest.mark.asyncio
@pytest.mark.parametrize("current,changes", [
    ("draft", {"status": "active", "is_active": True}),
    ("pending", {"name": "Changed"}),
    ("active", {"name": "Changed"}),
])
async def test_generic_patch_cannot_bypass_canonical_workflow(current, changes):
    record = Partner(id=uuid4(), name="Original", partner_type="community", status=current, is_active=current == "active")
    service = SimpleNamespace(model=Partner, get_by_id=AsyncMock(return_value=record), update=AsyncMock())
    router = build_crud_router(prefix="/partners", tag="Partners", service=service,
                               create_schema=Patch, update_schema=Patch, write_scope="partnerships.manage")
    endpoint = next(route.endpoint for route in router.routes if "PATCH" in route.methods)
    user = TokenPayload("actor", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["farm.manage", "partnerships.manage"]},
    ]})
    with pytest.raises(HTTPException) as error:
        await endpoint(record.id, Patch(**changes), db=AsyncMock(), user=user)
    assert error.value.status_code == 409
    service.update.assert_not_awaited()
    assert record.name == "Original"


@pytest.mark.asyncio
@pytest.mark.parametrize("permissions,expected", [
    (["farm.manage"], "draft"),
    (["farm.manage", "farm.submit"], "pending"),
    (["farm.manage", "farm.publish"], "published"),
    (["farm.manage", "sustainability.publish"], "draft"),
])
async def test_creation_state_requires_its_own_domain_capability(permissions, expected):
    actor = TokenPayload("creator", "session", raw={"mfa_enabled": True, "mfa_verified_at": time.time(), "scope_grants": [
        {"scope_type": "global", "permissions": permissions},
    ]})
    payload = SimpleNamespace(partner_type="community", status="active", is_active=True)
    record = Partner(id=uuid4(), name="New", partner_type="community", status="active", is_active=True)
    service = SimpleNamespace(create=AsyncMock(return_value=record))
    db = AsyncMock()
    db.add = Mock()
    result = await create_editorial_record(db, actor, "partners", service, payload)
    assert result is record
    assert record.status == ("active" if expected == "published" else expected)
    assert record.is_active is (expected == "published")
    assert payload.status == record.status
    event = db.add.call_args.args[0]
    assert (event.actor_id, event.session_jti) == (actor.sub, actor.jti)
    assert (event.previous_state, event.target_state) == ("absent", expected)
    assert event.resource_id == record.id
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_password_only_publisher_cannot_publish_during_creation():
    actor = TokenPayload("creator", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["farm.publish"]},
    ]})
    payload = SimpleNamespace(partner_type="community", status="active", is_active=True)
    service = SimpleNamespace(create=AsyncMock())
    with pytest.raises(HTTPException) as denied:
        await create_editorial_record(AsyncMock(), actor, "partners", service, payload)
    assert denied.value.status_code == 403
    service.create.assert_not_awaited()
