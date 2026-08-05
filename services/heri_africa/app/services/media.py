from __future__ import annotations

from dataclasses import dataclass
from pathlib import PurePosixPath


class MediaValidationError(ValueError):
    pass


@dataclass(frozen=True)
class ValidatedMedia:
    file_name: str
    mime_type: str
    file_size: int
    extension: str


ALLOWED_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "application/pdf": {".pdf"},
    "video/mp4": {".mp4"},
}
MAX_FILE_SIZE = 30_000_000


def validate_upload_metadata(file_name: str, mime_type: str, file_size: int) -> ValidatedMedia:
    safe_name = PurePosixPath(file_name).name
    extension = PurePosixPath(safe_name).suffix.lower()
    if safe_name != file_name or not safe_name or extension not in ALLOWED_TYPES.get(mime_type, set()):
        raise MediaValidationError("File name and MIME type are not allowed")
    if file_size <= 0 or file_size > MAX_FILE_SIZE:
        raise MediaValidationError("File size is outside the allowed range")
    return ValidatedMedia(safe_name, mime_type, file_size, extension)
