"""Department graph invariants without rewriting legacy organizational data."""

from sqlalchemy import select, text

from ..models import Department

HIERARCHY_FIELDS = frozenset({"school_id", "wing_id", "department_type", "parent_department_id"})


async def lock_hierarchy(db):
    # Rare organization mutations share one transaction lock. Locking only the
    # two edited rows permits concurrent opposite moves to create a cycle.
    await db.execute(text("SELECT pg_advisory_xact_lock(1263752516)"))


async def validate_parent(db, department_id, proposed):
    parent_id = proposed.get("parent_department_id")
    if parent_id is None:
        return
    if parent_id == department_id:
        raise ValueError("A department cannot be its own parent")
    columns = (Department.id, Department.parent_department_id, Department.school_id,
               Department.wing_id, Department.is_active, Department.deleted_at)
    ancestors = select(*columns).where(Department.id == parent_id).cte("department_ancestors", recursive=True)
    # UNION (not UNION ALL) terminates even when old data already has a cycle.
    ancestors = ancestors.union(select(*columns).join(ancestors, Department.id == ancestors.c.parent_department_id))
    rows = (await db.execute(select(ancestors))).all()
    by_id = {row.id: row for row in rows}
    current, seen = parent_id, {department_id} if department_id else set()
    while current is not None:
        if current in seen:
            raise ValueError("Department parent change would create or inherit a cycle")
        seen.add(current)
        parent = by_id.get(current)
        if parent is None or parent.deleted_at is not None or not parent.is_active:
            raise ValueError("Department parent hierarchy contains an inactive or missing record")
        owner = (proposed.get("school_id"), proposed.get("wing_id"))
        parent_owner = (parent.school_id, parent.wing_id)
        if any(owner) and any(parent_owner) and owner != parent_owner:
            raise ValueError("Department parent belongs to a different organizational owner")
        current = parent.parent_department_id


async def require_no_active_children(db, department_id, *, include_inactive=False):
    query = select(Department.id).where(Department.parent_department_id == department_id,
                                        Department.deleted_at.is_(None))
    if not include_inactive:
        query = query.where(Department.is_active.is_(True))
    child = await db.scalar(query.limit(1))
    if child is not None:
        if include_inactive:
            raise ValueError("Reconcile child departments before changing their parent's organizational owner")
        raise ValueError("Reassign or deactivate child departments before deactivating their parent")
