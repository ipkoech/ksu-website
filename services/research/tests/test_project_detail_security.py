import inspect
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.routes.v1 import projects as project_routes
from app.services import core


def test_admin_project_detail_requires_authenticated_scope_and_is_not_public_cached():
    parameters = inspect.signature(project_routes.get_project_detail).parameters
    assert "user" in parameters
    assert parameters["user"].default is not None
    assert "cached_public" not in inspect.getsource(project_routes.get_project_detail)


@pytest.mark.asyncio
async def test_project_detail_enforces_center_scope_before_aggregate_queries(monkeypatch):
    project = SimpleNamespace(
        id="project-id",
        center_id="center-id",
        grant_id=None,
        slug="private-project",
    )
    monkeypatch.setattr(
        core.ProjectService,
        "get_by_slug",
        lambda *_args, **_kwargs: _return(project),
    )
    denied = HTTPException(status_code=403, detail="Insufficient privileges for this assigned scope")

    def deny(*_args, **_kwargs):
        raise denied

    monkeypatch.setattr(core, "require_scoped_record", deny)
    with pytest.raises(HTTPException) as raised:
        await core.ProjectDetailService.get_by_slug(object(), "private-project", user=object())
    assert raised.value.status_code == 403


async def _return(value):
    return value
