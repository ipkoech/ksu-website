from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChairProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    acronym: str | None
    host_institution: str
    initiative_name: str
    about: str
    tagline: str | None
    vision: str
    mission: str
    mandate: str
    objectives: str
    values: list | dict | None
    why_it_matters: str
    logo_url: str | None
    cover_image_url: str | None
    seo: dict

