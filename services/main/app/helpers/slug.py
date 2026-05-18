"""Slug helpers."""

from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


def slugify(value: str) -> str:
    """Convert a string into a URL-safe slug."""
    value = value.lower().strip()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[-\s]+", "-", value)
    return value.strip("-")


async def unique_slug(db: AsyncSession, model: type, name: str, exclude_id=None) -> str:
    """Generate a unique slug for a model with a `slug` column."""
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while True:
        query = select(model).where(model.slug == slug)
        if exclude_id is not None:
            query = query.where(model.id != exclude_id)
        result = await db.execute(query)
        if result.scalar_one_or_none() is None:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1
