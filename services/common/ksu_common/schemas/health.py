"""Typed payload for the lightweight service health endpoint."""

from typing import Literal

from pydantic import BaseModel


class HealthPayload(BaseModel):
    service: str
    status: Literal["ok"]
    release: str
