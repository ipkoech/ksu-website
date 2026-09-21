"""Identify actual portraits in imported person records."""

from urllib.parse import urlsplit


def imported_person_photo(url: str | None) -> str | None:
    if not url:
        return None
    value = url.strip()
    if urlsplit(value).path.lower().endswith("/default-avatar.png"):
        return None
    return value or None
