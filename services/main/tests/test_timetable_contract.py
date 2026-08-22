from __future__ import annotations

import ast
from pathlib import Path


API = Path(__file__).parents[1] / "app/api/v1/timetables.py"
SERVICE = Path(__file__).parents[1] / "app/services/timetable.py"


def _source(path: Path) -> str:
    return ast.unparse(ast.parse(path.read_text()))


def test_public_timetables_require_all_publication_flags() -> None:
    source = _source(API)
    assert "AcademicTimetable.is_public.is_(True)" in source
    assert "AcademicTimetable.is_published.is_(True)" in source
    assert "AcademicTimetable.workflow_status == 'published'" in source


def test_sittings_check_venue_and_programme_conflicts() -> None:
    source = _source(SERVICE)
    assert "TimetableSitting.start_time < end_time" in source
    assert "TimetableSitting.end_time > start_time" in source
    assert "sitting.venue_id == venue_id" in source
    assert "TimetableSittingProgramme.programme_id.in_(programme_ids)" in source


def test_publishing_requires_at_least_one_sitting() -> None:
    source = _source(API)
    assert "action == 'publish' and (not timetable.sittings)" in source
    assert "must contain at least one sitting" in source
