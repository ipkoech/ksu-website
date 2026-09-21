import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.core.auth import require_resource_permission


@pytest.mark.asyncio
async def test_partner_update_and_restore_enforce_source_field_ownership(monkeypatch):
    from types import SimpleNamespace
    from unittest.mock import AsyncMock
    from uuid import uuid4
    from app.models.partners import Partner
    from app.routes.v1 import admin_resources as routes

    record = Partner(id=uuid4(), research_partner_id=uuid4(), name="Research name", deleted_at=None)
    monkeypatch.setattr(routes, "lock_record", AsyncMock(return_value=record))
    audit = SimpleNamespace(id=uuid4(), entity_type="partners", entity_id=str(record.id),
                            previous_value={"name": "Old Research name"})
    db = SimpleNamespace(get=AsyncMock(return_value=audit))
    request = SimpleNamespace(client=None)
    user = SimpleNamespace(sub=str(uuid4()))
    for command in (
        lambda: routes.update_resource("partners", record.id, {"name": "Local name"}, request, db, user),
        lambda: routes.restore_resource("partners", record.id, {"audit_id": str(audit.id)}, request, db, user),
    ):
        with pytest.raises(HTTPException) as denied:
            await command()
        assert denied.value.status_code == 422
        assert record.name == "Research name"


@pytest.mark.asyncio
async def test_visibility_flags_require_publish_authority(monkeypatch):
    from types import SimpleNamespace
    from unittest.mock import AsyncMock
    from uuid import uuid4
    from app.models.content import NavigationItem
    from app.routes.v1 import admin_resources as routes
    record = NavigationItem(id=uuid4(), label="Nav", href="/", is_visible=False)
    monkeypatch.setattr(routes, "lock_record", AsyncMock(return_value=record))
    request = SimpleNamespace(client=None)
    db = SimpleNamespace()
    actor = TokenPayload("actor", "session", raw={"scope_grants": [{
        "scope_type": "heri", "scope_id": "heri", "permissions": ["heri.content.write"],
    }]})
    with pytest.raises(HTTPException) as denied:
        await routes.update_resource("navigation", record.id, {"is_visible": True}, request, db, actor)
    assert denied.value.status_code == 403


@pytest.mark.asyncio
async def test_public_configuration_requires_publish_authority(monkeypatch):
    from types import SimpleNamespace
    from unittest.mock import AsyncMock
    from uuid import uuid4
    from app.models.content import SiteSettings
    from app.routes.v1 import admin_resources as routes
    record = SiteSettings(id=uuid4(), name="HERI", deleted_at=None)
    monkeypatch.setattr(routes, "lock_record", AsyncMock(return_value=record))
    request = SimpleNamespace(client=None)
    db = SimpleNamespace()
    actor = TokenPayload("actor", "session", raw={"scope_grants": [{
        "scope_type": "heri", "scope_id": "heri", "permissions": ["heri.content.write"],
    }]})
    with pytest.raises(HTTPException) as denied:
        await routes.update_resource("site-settings", record.id, {"tagline": "Changed"}, request, db, actor)
    assert denied.value.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize("resource,permission", [
    ("media", "heri.media.read"), ("submissions", "heri.submissions.read"),
    ("analytics", "heri.analytics.read"), ("social-publications", "heri.social.read"),
])
async def test_generic_routes_use_resource_capabilities(resource, permission):
    def actor(capability, scope="global"):
        return TokenPayload("user", "session", raw={"scope_grants": [
            {"scope_type": scope, "scope_id": "foreign" if scope == "school" else None,
             "permissions": [capability]},
        ]})

    dependency = require_resource_permission("read")
    with pytest.raises(HTTPException):
        await dependency(resource, actor("heri.content.read"))
    with pytest.raises(HTTPException):
        await dependency(resource, actor(permission, "school"))
    assert (await dependency(resource, actor(permission))).sub == "user"
