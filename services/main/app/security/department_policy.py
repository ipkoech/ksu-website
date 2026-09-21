"""Department ownership predicates, applied before pagination and aggregates."""

from sqlalchemy import false, or_, true

from ..models import Department
from .scopes import grant_has_permission, user_scoped_grants


def department_predicate(user, permissions):
    clauses = []
    for grant in user_scoped_grants(user):
        if not any(grant_has_permission(grant, permission) for permission in permissions):
            continue
        if grant.scope_type in {"global", "university"}:
            return true()
        if grant.scope_id is None:
            continue
        column = {"department": Department.id, "school": Department.school_id,
                  "wing": Department.wing_id}.get(grant.scope_type)
        if column is not None:
            clauses.append(column == grant.scope_id)
    return or_(false(), *clauses)
