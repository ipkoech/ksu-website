"""Media asset schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SlugStr
from ..models.media import MEDIA_ATTACHMENT_ROLES


ATTACHMENT_ROLE_SCHEMA = {
    "examples": sorted(MEDIA_ATTACHMENT_ROLES),
    "description": "Standard roles are cover, gallery, logo, video, document, poster, cv, brochure, and attachment. Specialized roles remain supported.",
}


class MediaFolderCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    parent_id: uuid.UUID | None = None
    description: str | None = None
    is_public: bool = False
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None


class MediaFolderUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    parent_id: uuid.UUID | None = None
    description: str | None = None
    is_public: bool | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None


class MediaFolderRead(BaseReadSchema):
    name: str
    slug: str
    parent_id: uuid.UUID | None = None
    description: str | None = None
    is_public: bool
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    children: list[dict[str, Any]] | None = None
    files: list[dict[str, Any]] | None = None
    links: list[dict[str, Any]] | None = None
    parent: dict[str, Any] | None = None
    deleted_at: datetime | None = None


class MediaCreate(BaseSchema):
    filename: str = Field(min_length=1, max_length=255)
    original_filename: str = Field(min_length=1, max_length=255)
    mime_type: str = Field(min_length=1, max_length=128)
    file_size: int = Field(ge=0)
    file_hash: str | None = Field(default=None, max_length=64)
    storage_provider: str = Field(default="local", max_length=32)
    storage_path: str = Field(min_length=1, max_length=1024)
    public_url: str | None = Field(default=None, max_length=1024)
    cdn_url: str | None = Field(default=None, max_length=1024)
    folder_id: uuid.UUID | None = None
    title: str | None = Field(default=None, max_length=255)
    alt_text: str | None = Field(default=None, max_length=255)
    description: str | None = None
    caption: str | None = None
    tags: list[str] | None = None
    credit: str | None = Field(default=None, max_length=255)
    media_type: str = Field(default="file", max_length=32)
    width: int | None = None
    height: int | None = None
    duration: int | None = None
    thumbnail_url: str | None = Field(default=None, max_length=1024)
    thumbnails: dict[str, Any] | None = None
    uploaded_by_id: uuid.UUID | None = None
    is_public: bool = False
    is_processed: bool = False
    metadata: dict[str, Any] | None = Field(default=None, validation_alias="metadata", serialization_alias="metadata")


class MediaUpdate(BaseSchema):
    folder_id: uuid.UUID | None = None
    title: str | None = Field(default=None, max_length=255)
    alt_text: str | None = Field(default=None, max_length=255)
    description: str | None = None
    caption: str | None = None
    tags: list[str] | None = None
    credit: str | None = Field(default=None, max_length=255)
    media_type: str | None = Field(default=None, max_length=32)
    thumbnail_url: str | None = Field(default=None, max_length=1024)
    thumbnails: dict[str, Any] | None = None
    is_public: bool | None = None
    metadata: dict[str, Any] | None = Field(default=None, validation_alias="metadata", serialization_alias="metadata")


class MediaRead(BaseReadSchema):
    filename: str
    original_filename: str
    mime_type: str
    file_size: int
    file_hash: str | None = None
    storage_provider: str
    storage_path: str
    public_url: str | None = None
    cdn_url: str | None = None
    folder_id: uuid.UUID | None = None
    title: str | None = None
    alt_text: str | None = None
    description: str | None = None
    caption: str | None = None
    tags: list[str] | None = None
    credit: str | None = None
    media_type: str
    width: int | None = None
    height: int | None = None
    duration: int | None = None
    thumbnail_url: str | None = None
    thumbnails: dict[str, Any] | None = None
    uploaded_by_id: uuid.UUID | None = None
    uploaded_by: dict[str, Any] | None = None
    folder: dict[str, Any] | None = None
    links: list[dict[str, Any]] | None = None
    is_public: bool
    is_processed: bool
    metadata: dict[str, Any] | None = Field(default=None, validation_alias="extra_metadata", serialization_alias="metadata")
    url: str
    deleted_at: datetime | None = None


class MediaLinkCreate(BaseSchema):
    media_id: uuid.UUID
    entity_type: str = Field(min_length=1, max_length=64)
    entity_id: uuid.UUID
    role: str = Field(default="attachment", max_length=64, json_schema_extra=ATTACHMENT_ROLE_SCHEMA)
    folder_id: uuid.UUID | None = None
    display_order: int = 100
    is_public: bool = True


class MediaLinkUpdate(BaseSchema):
    media_id: uuid.UUID | None = None
    entity_type: str | None = Field(default=None, min_length=1, max_length=64)
    entity_id: uuid.UUID | None = None
    role: str | None = Field(default=None, max_length=64, json_schema_extra=ATTACHMENT_ROLE_SCHEMA)
    folder_id: uuid.UUID | None = None
    display_order: int | None = None
    is_public: bool | None = None


class MediaAttachmentSummary(BaseSchema):
    id: uuid.UUID
    title: str | None = None
    filename: str
    original_filename: str
    mime_type: str
    media_type: str
    file_size: int
    thumbnail_url: str | None = None
    is_public: bool
    url: str


class MediaLinkRead(BaseReadSchema):
    media_id: uuid.UUID
    media: MediaAttachmentSummary | None = None
    entity_type: str
    entity_id: uuid.UUID
    role: str
    folder_id: uuid.UUID | None = None
    folder: dict[str, Any] | None = None
    display_order: int
    is_public: bool
    deleted_at: datetime | None = None
