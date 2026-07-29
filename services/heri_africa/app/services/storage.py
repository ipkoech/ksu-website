from __future__ import annotations

import hashlib
import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from ..core.config import get_settings
from .media import validate_upload_metadata


def _safe_segment(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", value).strip("-").lower() or "general"


async def store_upload(file: UploadFile, folder: str = "general") -> dict[str, object]:
    content = await file.read()
    return store_bytes(file.filename or "upload.bin", file.content_type or "application/octet-stream", content, folder)


def store_bytes(file_name: str, mime_type: str, content: bytes, folder: str = "general") -> dict[str, object]:
    metadata = validate_upload_metadata(file_name, mime_type, len(content))
    root = Path(get_settings().UPLOAD_DIR).resolve()
    folder_path = (root / _safe_segment(folder)).resolve()
    folder_path.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4()}{metadata.extension}"
    destination = (folder_path / filename).resolve()
    destination.relative_to(root)
    destination.write_bytes(content)
    relative = destination.relative_to(root).as_posix()
    return {"file_name": metadata.file_name, "mime_type": metadata.mime_type, "file_size": metadata.file_size, "storage_path": relative, "public_url": f"{get_settings().MEDIA_URL.rstrip('/')}/{relative}", "sha256": hashlib.sha256(content).hexdigest()}
