from __future__ import annotations

from unittest.mock import AsyncMock, Mock

import pytest

from app.schemas import LibraryCreate
from app.services import library as library_service


@pytest.mark.asyncio
async def test_library_create_flushes_for_request_transaction_owner(monkeypatch):
    db = Mock()
    db.execute = AsyncMock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    db.commit = AsyncMock()
    query_result = Mock()
    query_result.scalar_one_or_none.return_value = None
    db.execute.return_value = query_result

    result = await library_service.create_library(
        db,
        LibraryCreate(name="Main Library", slug="main-library"),
    )

    assert result.slug == "main-library"
    db.flush.assert_awaited_once_with()
    db.commit.assert_not_awaited()
    db.refresh.assert_awaited_once_with(result)
