import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.models import School
from app.seeders.seed_cover_images import preserves_generated_school_panorama


@pytest.mark.asyncio
async def test_generic_seeder_preserves_reviewed_school_panorama() -> None:
    panorama_id = uuid.uuid4()
    school = School(
        id=uuid.uuid4(),
        code="SOL",
        name="School of Law",
        slug="school-of-law",
        cover_image_id=panorama_id,
    )
    db = SimpleNamespace(
        get=AsyncMock(
            side_effect=[
                SimpleNamespace(extra_metadata={"source": "generated-school-panorama"}),
                SimpleNamespace(extra_metadata={"source": "generated"}),
            ]
        )
    )

    assert await preserves_generated_school_panorama(db, school) is True
    assert await preserves_generated_school_panorama(db, school) is False
    school.cover_image_id = None
    assert await preserves_generated_school_panorama(db, school) is False
