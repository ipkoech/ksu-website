"""HERI-owned associations; no cross-service database access."""

from fastapi import HTTPException
from sqlalchemy import exists, select

from ..models.content import ResearchProject, ResearchPublication, ResearchTheme


async def validate_theme_reference(db, model, values):
    if model not in {ResearchProject, ResearchPublication} or not values.get("theme_id"):
        return
    # Shared parent locking serializes association with theme deletion without
    # locking unrelated child records or serializing independent associations.
    identifier = await db.scalar(select(ResearchTheme.id).where(
        ResearchTheme.id == values["theme_id"], ResearchTheme.deleted_at.is_(None),
    ).with_for_update(read=True))
    if identifier is None:
        raise HTTPException(422, "Referenced HERI theme is unavailable")


async def require_theme_unlinked(db, record):
    if not isinstance(record, ResearchTheme):
        return
    for model in (ResearchProject, ResearchPublication):
        linked = await db.scalar(select(exists().where(
            model.theme_id == record.id, model.deleted_at.is_(None),
        )))
        if linked:
            raise HTTPException(409, "Remove project and publication associations before deleting this theme")
