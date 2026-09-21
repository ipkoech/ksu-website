from datetime import date
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from app.schemas import LibraryStatisticsCreate
from app.services.staff import create_statistics


@pytest.mark.asyncio
@pytest.mark.parametrize("changes, error", [
    ({"period_end": date(2025, 12, 31)}, "period end"),
    ({"total_visits": -1}, "negative"),
    ({"fines_collected": "-0.01"}, "negative"),
    ({}, "active library branch"),
])
async def test_invalid_statistics_do_not_write(changes, error):
    data = LibraryStatisticsCreate(**{
        "library_id": uuid4(), "period_start": date(2026, 1, 1),
        "period_end": date(2026, 1, 31), **changes,
    })
    db = Mock(scalar=AsyncMock(return_value=None))
    with pytest.raises(ValueError, match=error):
        await create_statistics(db, data)
    db.add.assert_not_called()
