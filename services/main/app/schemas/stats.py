"""Public stats response schemas."""

from __future__ import annotations

from pydantic import Field

from .base import BaseSchema


class PublicStatItem(BaseSchema):
    key: str
    label: str
    value: int | float
    suffix: str = ""
    description: str
    href: str | None = None


class PublicStatsResponse(BaseSchema):
    scope: str = Field(pattern="^(homepage|university|school|department|admin)$")
    title: str
    stats: list[PublicStatItem]


class PortalStatsResponse(BaseSchema):
    """Named operational counters consumed by a single admin portal."""

    portal: str
    title: str
    stats: dict[str, int]
