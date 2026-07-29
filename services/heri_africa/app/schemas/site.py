from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class NavigationItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    label: str
    href: str
    position: int


class FooterLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    column: str
    label: str
    href: str
    position: int
