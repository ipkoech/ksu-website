"""Branch ownership invariants for guide staff and specialist links."""

from sqlalchemy import select

from ..models import LibraryGuide, LibraryGuideSpecialist, LibrarySpecialist, LibraryStaff


async def validate_staff(db, library_id, staff_id):
    if staff_id is None:
        return
    found = await db.scalar(select(LibraryStaff.id).where(
        LibraryStaff.id == staff_id, LibraryStaff.library_id == library_id,
        LibraryStaff.deleted_at.is_(None), LibraryStaff.is_active.is_(True),
    ).with_for_update(read=True))
    if found is None:
        raise ValueError("Staff reference must be active and owned by the same library branch")


async def validate_guide_relationships(db, data, existing=None):
    changes = data.model_dump(exclude_unset=True)
    if existing is not None and not {"library_id", "owner_staff_id", "specialist_ids"}.intersection(changes):
        return
    library_id = changes.get("library_id", existing.library_id if existing else data.library_id)
    staff_id = changes.get("owner_staff_id", existing.owner_staff_id if existing else data.owner_staff_id)
    await validate_staff(db, library_id, staff_id)
    if existing and "specialist_ids" not in changes:
        ids = list((await db.scalars(select(LibraryGuideSpecialist.specialist_id).where(
            LibraryGuideSpecialist.guide_id == existing.id, LibraryGuideSpecialist.deleted_at.is_(None),
        ))).all())
    else:
        ids = data.specialist_ids or []
    if len(set(ids)) != len(ids):
        raise ValueError("A specialist may be linked to a guide only once")
    if ids:
        found = set((await db.scalars(select(LibrarySpecialist.id).where(
            LibrarySpecialist.id.in_(ids), LibrarySpecialist.library_id == library_id,
            LibrarySpecialist.deleted_at.is_(None), LibrarySpecialist.is_active.is_(True),
        ))).all())
        if found != set(ids):
            raise ValueError("Guide specialists must be active and owned by the same library branch")


async def validate_specialist_relationships(db, data, existing=None):
    changes = data.model_dump(exclude_unset=True)
    if existing is not None and not {"library_id", "staff_id"}.intersection(changes):
        return
    library_id = changes.get("library_id", existing.library_id if existing else data.library_id)
    staff_id = changes.get("staff_id", existing.staff_id if existing else data.staff_id)
    await validate_staff(db, library_id, staff_id)
    if existing and library_id != existing.library_id:
        conflict = await db.scalar(select(LibraryGuide.id).join(
            LibraryGuideSpecialist, LibraryGuideSpecialist.guide_id == LibraryGuide.id,
        ).where(
            LibraryGuideSpecialist.specialist_id == existing.id,
            LibraryGuideSpecialist.deleted_at.is_(None), LibraryGuide.deleted_at.is_(None),
            LibraryGuide.library_id.is_distinct_from(library_id),
        ).limit(1))
        if conflict is not None:
            raise ValueError("Reconcile linked guides before transferring the specialist")
