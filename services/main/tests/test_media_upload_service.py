from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.services import media as media_module
from app.services.media import MediaService


class _FakeDb:
    def __init__(self) -> None:
        self.added: list[object] = []
        self.flushes = 0
        self.rollbacks = 0

    def add(self, value: object) -> None:
        self.added.append(value)

    async def flush(self) -> None:
        self.flushes += 1

    async def rollback(self) -> None:
        self.rollbacks += 1


@pytest.mark.asyncio
async def test_global_upload_persists_media_without_entity_link(monkeypatch: pytest.MonkeyPatch) -> None:
    """A global media upload has no attachment target and must not create a link."""

    uploaded_id = uuid4()
    links: list[dict] = []

    class _FakeMedia:
        def __init__(self, **kwargs) -> None:
            self.id = uploaded_id
            self.__dict__.update(kwargs)

    async def _upload_file(_file, _folder_path):
        return {
            "filename": "fixture.txt",
            "original_filename": "fixture.txt",
            "mime_type": "text/plain",
            "file_size": 7,
            "storage_path": "fixture.txt",
        }

    async def _link_media(_db, **kwargs):
        links.append(kwargs)

    monkeypatch.setattr(media_module, "Media", _FakeMedia)
    monkeypatch.setattr(media_module, "upload_file", _upload_file)
    monkeypatch.setattr(media_module, "_validate_upload_mime_type", lambda _mime: None)
    monkeypatch.setattr(media_module, "_validate_upload_size", lambda _size: None)
    monkeypatch.setattr(MediaService, "link_media", _link_media)

    db = _FakeDb()
    result = await MediaService.upload(
        db,
        file=SimpleNamespace(content_type="text/plain"),
        uploaded_by_id=uuid4(),
    )

    assert result.id == uploaded_id
    assert db.flushes == 1
    assert links == []
    assert db.rollbacks == 0
