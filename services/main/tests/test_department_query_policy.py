from types import SimpleNamespace
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from app.models import Department
from app.security import department_policy
from app.security.scopes import ScopedGrant
from app.services import academic


@pytest.mark.asyncio
async def test_department_scope_is_in_query_before_pagination(monkeypatch):
    first, second = uuid4(), uuid4()
    grants = [ScopedGrant(frozenset({"academic.view"}), "department", identifier, "role")
              for identifier in (first, second)]
    monkeypatch.setattr(department_policy, "user_scoped_grants", lambda user: grants)
    predicate = department_policy.department_predicate(object(), ["academic.view"])

    async def paginate(db, query, **kwargs):
        sql = str(query.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
        assert str(first) in sql and str(second) in sql
        assert " OR " in sql
        assert "departments.id" in sql.split("ORDER BY")[1]
        assert kwargs == {"page": 2, "per_page": 5}
        return SimpleNamespace(items=[], meta={"total": 12})

    monkeypatch.setattr(academic, "paginate_query", paginate)
    result = await academic.DepartmentService.list(object(), page=2, per_page=5,
                                                   authorization_predicate=predicate)
    assert result.meta["total"] == 12


def test_empty_department_assignments_compile_to_false(monkeypatch):
    monkeypatch.setattr(department_policy, "user_scoped_grants", lambda user: [])
    query = sa.select(Department.id).where(department_policy.department_predicate(object(), ["academic.view"]))
    assert "WHERE false" in str(query)
