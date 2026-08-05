from __future__ import annotations

from pydantic import BaseModel, Field


class AnalyticsEventPayload(BaseModel):
    event_name: str = Field(min_length=2, max_length=120)
    path: str = Field(min_length=1, max_length=500)
    session_id: str | None = Field(default=None, max_length=120)
    properties: dict[str, object] = Field(default_factory=dict)
