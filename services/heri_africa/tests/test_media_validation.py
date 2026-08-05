from __future__ import annotations

import pytest

from app.services.media import MediaValidationError, validate_upload_metadata


def test_media_metadata_accepts_safe_image() -> None:
    result = validate_upload_metadata("hero.webp", "image/webp", 2_000_000)
    assert result.extension == ".webp"


def test_media_metadata_rejects_executable_and_oversized_files() -> None:
    with pytest.raises(MediaValidationError):
        validate_upload_metadata("payload.exe", "application/octet-stream", 20)
    with pytest.raises(MediaValidationError):
        validate_upload_metadata("huge.jpg", "image/jpeg", 30_000_001)
