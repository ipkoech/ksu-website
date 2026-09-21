"""Transaction-held ownership checks for Library mutations."""

from sqlalchemy import select, text

from ..models import Library


async def lock_guide_relationships(db):
    await db.execute(text("SELECT pg_advisory_xact_lock(1263752520)"))


async def lock_owner(db, record):
    model = type(record)
    if model.__tablename__ in {"library_guides", "library_specialists"}:
        await lock_guide_relationships(db)
    # Scalar selection avoids replacing eagerly loaded relationships. Refresh
    # ownership after waiting because an identity-map object may be stale.
    identifier = await db.scalar(select(model.id).where(
        model.id == record.id, model.deleted_at.is_(None),
    ).with_for_update())
    if identifier is None:
        raise ValueError("Record is no longer available")
    await db.refresh(record, attribute_names=["library_id", "deleted_at"])
    return record


async def validate_transfer_destination(db, current_library_id, target_library_id):
    if current_library_id == target_library_id or target_library_id is None:
        return
    branch = await db.scalar(select(Library.id).where(
        Library.id == target_library_id, Library.deleted_at.is_(None), Library.is_active.is_(True),
    ).with_for_update(read=True))
    if branch is None:
        raise ValueError("Transfer destination must be an active library branch")
