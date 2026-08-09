"""Read-only shared media mappings used by research public records."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

@dataclass(frozen=True)
class PublicMedia:
    """Transport snapshot returned by Main's authenticated media interface."""

    id: uuid.UUID
    url: str
    thumbnail_url: str | None = None
    title: str | None = None
    alt_text: str | None = None
    description: str | None = None
    caption: str | None = None
    media_type: str | None = None
    is_public: bool = True


__all__ = ["PublicMedia"]
