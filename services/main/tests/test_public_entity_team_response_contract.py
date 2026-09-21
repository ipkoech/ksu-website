from __future__ import annotations

import pytest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from pydantic import TypeAdapter
from sqlalchemy import select
from app.api.v1._fields import build_selector, FieldSelection
from app.models import Person, StaffAssignment

from app.api.v1.public_team import router, _photo_urls


@pytest.mark.parametrize("entity_type", ["schools", "departments"])
def test_team_response_preserves_tiers_and_members(entity_type: str) -> None:
    route = next(route for route in router.routes if route.path.startswith(f"/{entity_type}/"))
    payload = {
        "entity": {"id": "entity-1", "name": "Test unit"},
        "tiers": [{"key": "academic", "label": "Academic", "members": [
            {"id": "assignment-1", "person_id": "person-1", "name": "Test Member", "photo_url": "https://example.org/profile.jpg"},
        ]}],
        "counts": {"members": 1, "tiers": 1},
    }
    adapter = TypeAdapter(route.response_model)
    response = adapter.validate_python({"success": True, "data": payload})
    serialized = adapter.dump_python(response, mode="json", exclude_unset=True)
    assert serialized["data"] == payload


@pytest.mark.asyncio
async def test_imported_avatar_is_returned_without_media_photo() -> None:
    person = SimpleNamespace(id="person-1", photo_id=None, external_avatar_url="https://example.org/avatar.jpg")
    db = AsyncMock()
    assert await _photo_urls(db, [person]) == {person.id: person.external_avatar_url}
    db.execute.assert_not_awaited()


@pytest.mark.asyncio
async def test_imported_default_avatar_is_not_a_profile_photo() -> None:
    person = SimpleNamespace(id="person-1", photo_id=None, external_avatar_url="https://digital.kisiiuniversity.ac.ke/images/default-avatar.png")
    assert await _photo_urls(AsyncMock(), [person]) == {person.id: None}


@pytest.mark.asyncio
async def test_media_photo_takes_precedence_over_imported_avatar() -> None:
    person = SimpleNamespace(id="person-1", photo_id="photo-1", external_avatar_url="https://example.org/avatar.jpg")
    media = SimpleNamespace(id="photo-1", url="https://example.org/uploaded.jpg", cdn_url=None)
    result = Mock()
    result.scalars.return_value.all.return_value = [media]
    db = AsyncMock()
    db.execute.return_value = result
    assert await _photo_urls(db, [person]) == {person.id: media.url}


def test_sparse_person_selection_loads_avatar_without_exposing_extra_fields() -> None:
    selector = build_selector(Person, FieldSelection(fields=("id",)))
    statement = select(Person).options(*selector.load_options)
    assert "persons.external_avatar_url" in str(statement)
    person = Person(id="person-1", external_avatar_url="https://example.org/avatar.jpg")
    assert selector.apply(person) == {"id": "person-1"}


def test_nested_person_selection_keeps_avatar_dependency() -> None:
    selector = build_selector(StaffAssignment, FieldSelection(fields=("id",), nested={"person": FieldSelection(fields=("id",))}))
    # Compile the loader path too: nested person photo resolution must not trigger lazy I/O.
    assert len(selector.load_options) > 1
    select(StaffAssignment).options(*selector.load_options).compile()
