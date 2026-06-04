"""Schemas for classification models: themes, focus areas, expertise tags."""

from __future__ import annotations

import uuid
from typing import Any
from pydantic import Field

from .base import BaseSchema, BaseReadSchema, SlugMixin, StatusMixin, SlugStr, UrlStr


# ============================================================================
# Research Theme
# ============================================================================


class ResearchThemeBase(BaseSchema, SlugMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    description: str | None = None
    objectives: str | None = None
    icon: str | None = Field(None, max_length=128)
    color: str | None = Field(None, max_length=32)
    cover_image_url: UrlStr | None = None


class ResearchThemeCreate(ResearchThemeBase, StatusMixin):
    pass


class ResearchThemeUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class ResearchThemeRead(ResearchThemeBase, BaseReadSchema, StatusMixin):
    focus_areas: list[dict[str, Any]] | None = None


class ResearchThemeList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    icon: str | None
    color: str | None
    is_active: bool
    is_featured: bool


# ============================================================================
# Focus Area
# ============================================================================


class FocusAreaBase(BaseSchema, SlugMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    theme_id: uuid.UUID | None = None
    description: str | None = None
    key_questions: str | None = None
    icon: str | None = Field(None, max_length=128)
    color: str | None = Field(None, max_length=32)


class FocusAreaCreate(FocusAreaBase, StatusMixin):
    pass


class FocusAreaUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    theme_id: uuid.UUID | None = None
    description: str | None = None
    is_active: bool | None = None


class FocusAreaRead(FocusAreaBase, BaseReadSchema, StatusMixin):
    theme: dict[str, Any] | None = None


class FocusAreaList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    theme_id: uuid.UUID | None
    icon: str | None
    is_active: bool


# ============================================================================
# Expertise Tag
# ============================================================================


class ExpertiseTagBase(BaseSchema, SlugMixin):
    name: str = Field(max_length=128)
    category: str | None = Field(None, max_length=64)
    description: str | None = None


class ExpertiseTagCreate(ExpertiseTagBase, StatusMixin):
    pass


class ExpertiseTagUpdate(BaseSchema):
    name: str | None = Field(None, max_length=128)
    slug: SlugStr | None = None
    category: str | None = None
    is_active: bool | None = None


class ExpertiseTagRead(ExpertiseTagBase, BaseReadSchema, StatusMixin):
    pass


class ExpertiseTagList(BaseReadSchema):
    name: str
    slug: str
    category: str | None
    is_active: bool
