"""Pydantic pagination schemas."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    status: str = "success"
    message: str = "ok"
    data: list[T]
    meta: PaginationMeta
