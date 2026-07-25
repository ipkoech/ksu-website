import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.api.v1.school_portal.audit import list_school_audit


@pytest.mark.asyncio
async def test_school_audit_uses_server_derived_school_scope():
    school_id = uuid.uuid4()
    context = SimpleNamespace(
        school=SimpleNamespace(id=school_id),
        permissions=("school.audit.view",),
    )
    result = SimpleNamespace(items=[SimpleNamespace(id=uuid.uuid4())], meta={"total": 1})

    with patch(
        "app.api.v1.school_portal.audit.AuditService.list_for_school",
        AsyncMock(return_value=result),
    ) as scoped_list:
        response = await list_school_audit(
            db=SimpleNamespace(),
            context=context,
            page=1,
            per_page=20,
            action=None,
            resource_type=None,
            status_filter=None,
        )

    assert response["meta"]["total"] == 1
    assert scoped_list.await_args.kwargs["school_id"] == school_id


@pytest.mark.asyncio
async def test_school_audit_requires_school_permission():
    context = SimpleNamespace(
        school=SimpleNamespace(id=uuid.uuid4()),
        permissions=(),
    )

    with pytest.raises(Exception) as caught:
        await list_school_audit(
            db=SimpleNamespace(),
            context=context,
            page=1,
            per_page=20,
            action=None,
            resource_type=None,
            status_filter=None,
        )

    assert getattr(caught.value, "status_code", None) == 403
