"""Schemas for official public-site page snapshots."""

from __future__ import annotations

from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema


class PublicSitePageRead(BaseReadSchema):
    title: str
    slug: str
    path: str
    page_type: str
    summary: str | None = None
    plain_text: str | None = None
    headings: list[dict[str, Any]] | None = None
    links: list[dict[str, Any]] | None = None
    images: list[dict[str, Any]] | None = None
    source_url: str
    source_hash: str
    is_public: bool
    status: str
    display_order: int


class PublicSitePageCreate(BaseSchema):
    title: str = Field(max_length=255)
    slug: str = Field(max_length=255)
    path: str = Field(max_length=512)
    page_type: str = Field(max_length=64)
    summary: str | None = None
    plain_text: str | None = None
    headings: list[dict[str, Any]] | None = None
    links: list[dict[str, Any]] | None = None
    images: list[dict[str, Any]] | None = None
    source_url: str = Field(max_length=1024)
    source_hash: str = Field(max_length=64)
    is_public: bool = True
    status: str = "published"
    display_order: int = 100


class PublicSitePageUpdate(BaseSchema):
    title: str | None = Field(default=None, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    path: str | None = Field(default=None, max_length=512)
    page_type: str | None = Field(default=None, max_length=64)
    summary: str | None = None
    plain_text: str | None = None
    headings: list[dict[str, Any]] | None = None
    links: list[dict[str, Any]] | None = None
    images: list[dict[str, Any]] | None = None
    source_url: str | None = Field(default=None, max_length=1024)
    source_hash: str | None = Field(default=None, max_length=64)
    is_public: bool | None = None
    status: str | None = None
    display_order: int | None = None


__all__ = ["PublicSitePageCreate", "PublicSitePageRead", "PublicSitePageUpdate"]
