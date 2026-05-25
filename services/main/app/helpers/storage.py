"""Storage helpers for local media uploads."""

from __future__ import annotations

import hashlib
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from ..core.config import get_settings

settings = get_settings()


def _is_external_url(value: str) -> bool:
    return value.startswith(("http://", "https://", "data:", "blob:"))


def normalize_storage_path(storage_path: str | Path | None) -> str:
    """Return a safe path relative to UPLOAD_DIR, without the media URL prefix."""
    if storage_path is None:
        return ""

    value = str(storage_path).replace("\\", "/").strip()
    if not value or _is_external_url(value):
        return value

    media_prefix = settings.MEDIA_URL.strip("/")
    value = value.lstrip("/")
    while media_prefix and (value == media_prefix or value.startswith(f"{media_prefix}/")):
        if value == media_prefix:
            value = ""
            break
        value = value[len(media_prefix) + 1 :]

    parts = [part for part in value.split("/") if part and part not in {".", ".."}]
    return "/".join(parts)


async def upload_file(file: UploadFile, folder: str = "") -> dict:
    """Upload a file into local storage and return metadata."""
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    ext = Path(file.filename or "").suffix
    filename = f"{uuid4()}{ext}"

    storage_root = Path(settings.UPLOAD_DIR).resolve()
    folder_path = normalize_storage_path(folder)
    if _is_external_url(folder_path):
        raise ValueError("Invalid upload folder")
    storage_path = (storage_root / folder_path / filename).resolve() if folder_path else (storage_root / filename).resolve()
    try:
        relative_path = storage_path.relative_to(storage_root)
    except ValueError as exc:
        raise ValueError("Invalid upload folder") from exc

    storage_path.parent.mkdir(parents=True, exist_ok=True)
    storage_path.write_bytes(content)
    relative_path_str = relative_path.as_posix()
    return {
        "filename": filename,
        "original_filename": file.filename or filename,
        "storage_path": relative_path_str,
        "file_size": len(content),
        "file_hash": file_hash,
        "mime_type": file.content_type or "application/octet-stream",
        "public_url": get_public_url(relative_path_str),
    }


async def delete_file(storage_path: str) -> None:
    """Delete a stored file if it exists."""
    raw_path = str(storage_path)
    if _is_external_url(raw_path):
        return

    storage_root = Path(settings.UPLOAD_DIR).resolve()
    candidate = Path(raw_path)
    path = candidate.resolve() if candidate.is_absolute() else (storage_root / normalize_storage_path(raw_path)).resolve()
    try:
        path.relative_to(storage_root)
    except ValueError:
        return

    if path.exists():
        path.unlink()


def get_public_url(storage_path: str) -> str:
    """Build a public URL for a storage path."""
    if _is_external_url(storage_path):
        return storage_path

    relative_path = normalize_storage_path(storage_path)
    media_url = settings.MEDIA_URL.rstrip("/")
    return f"{media_url}/{relative_path}" if relative_path else media_url


def get_signed_url(storage_path: str) -> str:
    """Return a URL for private downloads.

    Current implementation falls back to the public-style URL because storage is local.
    """
    return get_public_url(storage_path)
