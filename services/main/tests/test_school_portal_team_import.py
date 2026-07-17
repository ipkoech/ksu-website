import io
import unittest
import uuid
from unittest.mock import AsyncMock, patch
from zipfile import ZIP_DEFLATED, ZipFile

from app.services.imports import ImportService
from app.services.school_portal_team import (
    preview_school_team_import,
    school_import_resource_id,
    stamp_school_team_import_row,
    team_import_template_csv,
    team_import_template_xlsx,
)
from app.tasks.imports import (
    _commit_school_team_import,
    enqueue_school_import_progress,
)


def _minimal_xlsx() -> bytes:
    output = io.BytesIO()
    with ZipFile(output, "w", ZIP_DEFLATED) as workbook:
        workbook.writestr(
            "[Content_Types].xml",
            """<?xml version="1.0" encoding="UTF-8"?>
            <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
              <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
              <Default Extension="xml" ContentType="application/xml"/>
              <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
              <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
              <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
            </Types>""",
        )
        workbook.writestr(
            "_rels/.rels",
            """<?xml version="1.0" encoding="UTF-8"?>
            <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
              <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
            </Relationships>""",
        )
        workbook.writestr(
            "xl/workbook.xml",
            """<?xml version="1.0" encoding="UTF-8"?>
            <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
              xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
              <sheets><sheet name="Team" sheetId="1" r:id="rId1"/></sheets>
            </workbook>""",
        )
        workbook.writestr(
            "xl/_rels/workbook.xml.rels",
            """<?xml version="1.0" encoding="UTF-8"?>
            <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
              <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
              <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
            </Relationships>""",
        )
        workbook.writestr(
            "xl/sharedStrings.xml",
            """<?xml version="1.0" encoding="UTF-8"?>
            <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="6" uniqueCount="6">
              <si><t>email</t></si><si><t>role</t></si>
              <si><t>school_id</t></si><si><t>amina@example.test</t></si>
              <si><t>lecturer</t></si><si><t>attacker-school</t></si>
            </sst>""",
        )
        workbook.writestr(
            "xl/worksheets/sheet1.xml",
            """<?xml version="1.0" encoding="UTF-8"?>
            <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
              <sheetData>
                <row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>
                <row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" t="s"><v>4</v></c><c r="C2" t="s"><v>5</v></c></row>
              </sheetData>
            </worksheet>""",
        )
    return output.getvalue()


class SchoolPortalTeamImportTests(unittest.IsolatedAsyncioTestCase):
    async def test_generic_import_parser_supports_xlsx(self):
        rows = await ImportService.parse_upload("team.xlsx", _minimal_xlsx())

        self.assertEqual("amina@example.test", rows[0]["email"])
        self.assertEqual("lecturer", rows[0]["role"])

    async def test_team_templates_are_available_as_csv_and_xlsx(self):
        csv_template = team_import_template_csv()
        xlsx_rows = await ImportService.parse_upload(
            "team.xlsx", team_import_template_xlsx()
        )

        headers = csv_template.splitlines()[0].split(",")
        self.assertIn("email", headers)
        self.assertIn("role", headers)
        self.assertEqual("lecturer", xlsx_rows[0]["role"])

    def test_idempotency_key_maps_to_a_stable_import_resource(self):
        first = school_import_resource_id("school-team-2026-0001")
        second = school_import_resource_id("school-team-2026-0001")

        self.assertEqual(first, second)

    async def test_staff_import_creator_calls_conflict_check_with_one_session(self):
        config = ImportService.get_resource("staff-assignments")
        db = object()
        payload = {
            "person_id": uuid.uuid4(),
            "entity_type": "school",
            "entity_id": uuid.uuid4(),
            "role": "lecturer",
            "hierarchy_level": 10,
        }

        with (
            patch(
                "app.services.imports.StaffService.check_position_conflict",
                AsyncMock(return_value=None),
            ) as conflict,
            patch(
                "app.services.imports.StaffService.assign",
                AsyncMock(return_value=type("Assignment", (), {"id": uuid.uuid4()})()),
            ),
        ):
            await config.create(db, payload)

        self.assertEqual(db, conflict.await_args.args[0])
        self.assertEqual("school", conflict.await_args.args[1])

    def test_server_school_scope_overwrites_imported_ownership(self):
        school_id = uuid.uuid4()

        row = stamp_school_team_import_row(
            {
                "email": "amina@example.test",
                "role": "lecturer",
                "school_id": str(uuid.uuid4()),
                "entity_id": str(uuid.uuid4()),
            },
            school_id,
        )

        self.assertEqual(school_id, row["school_id"])
        self.assertEqual(school_id, row["entity_id"])
        self.assertEqual("school", row["entity_type"])

    async def test_preview_detects_duplicate_email_and_supports_corrected_rows(self):
        school_id = uuid.uuid4()
        rows = [
            {"email": "amina@example.test", "role": "lecturer"},
            {"email": "AMINA@example.test", "role": "technician"},
            {"email": "corrected@example.test", "role": "support_staff"},
        ]

        preview = await preview_school_team_import(None, school_id, rows)

        self.assertEqual("valid", preview.rows[0].status)
        self.assertEqual("duplicate", preview.rows[1].status)
        self.assertEqual("valid", preview.rows[2].status)

    async def test_async_commit_emits_completion_and_failure_events(self):
        school_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        payload = {
            "rows": [{"email": "amina@example.test", "role": "lecturer"}],
            "mode": "partial",
        }

        with (
            patch(
                "app.tasks.imports._run_school_team_import",
                AsyncMock(return_value={"created_rows": 1, "failed_rows": 0}),
            ),
            patch(
                "app.tasks.imports._persist_school_import_event",
                AsyncMock(),
            ) as persist_event,
        ):
            result = await _commit_school_team_import(
                payload,
                str(school_id),
                str(actor_id),
            )

        self.assertEqual(1, result["created_rows"])
        self.assertEqual(
            "school.import.completed",
            persist_event.await_args.kwargs["event_type"],
        )

    async def test_progress_events_are_throttled_and_include_row_counts(self):
        db = type("Db", (), {"added": [], "add": lambda self, item: self.added.append(item)})()
        school_id = uuid.uuid4()
        actor_id = uuid.uuid4()

        unchanged = enqueue_school_import_progress(
            db,
            school_id=school_id,
            actor_id=actor_id,
            import_id=uuid.uuid4(),
            processed_rows=1,
            total_rows=100,
            last_percent=0,
        )
        emitted = enqueue_school_import_progress(
            db,
            school_id=school_id,
            actor_id=actor_id,
            import_id=uuid.uuid4(),
            processed_rows=10,
            total_rows=100,
            last_percent=0,
        )

        self.assertEqual(0, unchanged)
        self.assertEqual(10, emitted)
        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        self.assertEqual("school.import.progress", event.event_type)
        self.assertEqual(10, event.payload["processed_rows"])


if __name__ == "__main__":
    unittest.main()
