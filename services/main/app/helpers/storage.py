"""Storage helpers for local media uploads."""

from __future__ import annotations

import hashlib
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from ..core.config import get_settings

settings = get_settings()


async def upload_file(file: UploadFile, folder: str = "") -> dict:
    """Upload a file into local storage and return metadata."""
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    ext = Path(file.filename or "").suffix
    filename = f"{uuid4()}{ext}"
    storage_path = Path(settings.UPLOAD_DIR) / folder / filename
    storage_path.parent.mkdir(parents=True, exist_ok=True)
    storage_path.write_bytes(content)
    relative_path = storage_path.relative_to(settings.UPLOAD_DIR) if str(storage_path).startswith(settings.UPLOAD_DIR) else storage_path
    return {
        "filename": filename,
        "original_filename": file.filename or filename,
        "storage_path": str(relative_path),
        "file_size": len(content),
        "file_hash": file_hash,
        "mime_type": file.content_type or "application/octet-stream",
        "public_url": get_public_url(str(relative_path)),
    }


async def delete_file(storage_path: str) -> None:
    """Delete a stored file if it exists."""
    path = Path(settings.UPLOAD_DIR) / storage_path if not storage_path.startswith(settings.UPLOAD_DIR) else Path(storage_path)
    if path.exists():
        path.unlink()


def get_public_url(storage_path: str) -> str:
    """Build a public URL for a storage path."""
    return f"{settings.MEDIA_URL.rstrip('/')}/{storage_path.lstrip('/')}"


def get_signed_url(storage_path: str) -> str:
    """Return a URL for private downloads.

    Current implementation falls back to the public-style URL because storage is local.
    """
    return get_public_url(storage_path)
