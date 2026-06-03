"""Public stats response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class PublicStatItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    label: str
    value: int | float
    suffix: str = ""
    description: str
    href: str | None = None


class PublicStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scope: str
    title: str
    stats: list[PublicStatItem]
