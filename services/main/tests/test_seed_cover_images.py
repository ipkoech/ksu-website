import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from app.models import School
from app.seeders import seed_cover_images as cover_seeder
from app.seeders._shared import SeedContext
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


@pytest.mark.asyncio
async def test_seed_workflow_skips_rendering_over_reviewed_panorama(
    tmp_path, monkeypatch: pytest.MonkeyPatch
) -> None:
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
            return_value=SimpleNamespace(
                extra_metadata={"source": "generated-school-panorama"}
            )
        ),
        execute=AsyncMock(side_effect=[_EmptyResult(), _EmptyResult()]),
        flush=AsyncMock(),
    )
    render = Mock()
    monkeypatch.setattr(
        cover_seeder,
        "cover_targets_from_specs",
        lambda: [
            {
                "entity_type": "school",
                "code": "SOL",
                "name": "School of Law",
                "theme": "law",
            }
        ],
    )
    monkeypatch.setattr(cover_seeder, "_render_cover", render)
    monkeypatch.setattr(
        cover_seeder,
        "get_settings",
        lambda: SimpleNamespace(upload_dir_path=tmp_path),
    )

    await cover_seeder.seed_cover_images(db, SeedContext(schools={"SOL": school}))

    render.assert_not_called()
    assert school.cover_image_id == panorama_id


class _EmptyResult:
    def scalars(self):
        return ()
