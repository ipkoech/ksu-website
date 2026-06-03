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
    scope: str = Field(pattern="^(homepage|school|department)$")
    title: str
    stats: list[PublicStatItem]
