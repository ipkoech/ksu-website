"""Contributor account requests preserve the public create contract."""

from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from app.api.v1.stories import router
from app.deps import get_db
from app.services.content import StoryContributorAccountRequestService


class _EmptyResult:
    def scalar_one_or_none(self):
        return None


class _Session:
    def __init__(self):
        self.added = []
        self.execute = AsyncMock(return_value=_EmptyResult())
        self.flush = AsyncMock()

    def add(self, value):
        self.added.append(value)


@pytest.mark.asyncio
async def test_create_normalizes_email_without_duplicate_constructor_kwargs():
    db = _Session()

    request = await StoryContributorAccountRequestService.create(
        db,
        email="  Contributor@Example.com ",
        full_name="Contributor Example",
        affiliation="Kisii University",
    )

    assert request.email == "contributor@example.com"
    assert request.status == "pending"
    assert request.verification_token
    assert db.added == [request]
    db.flush.assert_awaited_once()


def test_public_account_request_route_binds_and_serializes_success():
    app = FastAPI()
    app.include_router(router, prefix="/api/v1/stories")

    async def fake_db():
        yield object()

    app.dependency_overrides[get_db] = fake_db
    created = SimpleNamespace(
        id=uuid4(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        full_name="Contributor Example",
        email="contributor@example.com",
        phone=None,
        affiliation="Kisii University",
        contributor_type="external",
        reason_for_request="Research stories",
        status="pending",
        reviewed_by_id=None,
        reviewed_at=None,
        approved_user_id=None,
        rejection_reason=None,
        verified_at=None,
        ip_address="testclient",
        user_agent="route-test",
        deleted_at=None,
    )
    create = AsyncMock(return_value=created)

    with patch.object(StoryContributorAccountRequestService, "create", create):
        response = TestClient(app).post(
            "/api/v1/stories/account-requests",
            headers={"user-agent": "route-test"},
            json={
                "full_name": "Contributor Example",
                "email": "  Contributor@Example.com ",
                "affiliation": "Kisii University",
                "reason_for_request": "Research stories",
            },
        )

    assert response.status_code == 201, response.text
    assert response.json()["data"]["email"] == "contributor@example.com"
    create.assert_awaited_once()
    assert create.await_args.kwargs["email"] == "contributor@example.com"
    assert create.await_args.kwargs["ip_address"] == "testclient"
    assert create.await_args.kwargs["user_agent"] == "route-test"
