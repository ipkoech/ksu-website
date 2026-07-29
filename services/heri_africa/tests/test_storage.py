from __future__ import annotations

import asyncio
from io import BytesIO

from fastapi import UploadFile

from app.services.storage import store_upload
from app.core.config import get_settings


def test_store_upload_writes_inside_configured_root(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path))
    get_settings.cache_clear()
    result = asyncio.run(store_upload(UploadFile(filename="note.pdf", file=BytesIO(b"hello"), headers={"content-type": "application/pdf"})))
    assert result["file_size"] == 5
