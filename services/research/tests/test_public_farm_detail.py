"""Public farm detail responses must not include internal audit records."""

import uuid
from types import SimpleNamespace

import pytest

from app.services import core


@pytest.mark.asyncio
async def test_public_farm_detail_excludes_audit_relationship(monkeypatch):
    farm_id = uuid.uuid4()
    farm = SimpleNamespace(id=farm_id, slug="public-farm", center=None)

    async def get_public_by_slug(*args, **kwargs):
        return farm

    async def empty_relationship(*args, **kwargs):
        return []

    monkeypatch.setattr(core.FarmService, "get_public_by_slug", get_public_by_slug)
    monkeypatch.setattr(core, "_model_payload", lambda item: {"id": item.id, "slug": item.slug})
    for name in ("list_projects", "list_partners", "list_activities", "list_impact_stories", "list_impact_metrics"):
        monkeypatch.setattr(core.FarmRelationshipService, name, staticmethod(empty_relationship))

    payload = await core.FarmDetailService.get_by_slug(SimpleNamespace(), "public-farm")

    assert "audit" not in payload["relationships"]
