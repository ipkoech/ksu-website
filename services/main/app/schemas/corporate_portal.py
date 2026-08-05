"""Corporate Communication portal bootstrap schemas."""

from __future__ import annotations

from .base import BaseSchema


class CorporatePortalContextResponse(BaseSchema):
    capabilities: dict[str, bool]
    allowed_navigation: list[str]


__all__ = ["CorporatePortalContextResponse"]
