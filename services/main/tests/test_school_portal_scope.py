import unittest
import uuid

from fastapi import HTTPException
from ksu_common.models import AuditLog

from app.models import (
    Department,
    Document,
    MediaFolder,
    News,
    Programme,
    School,
    StaffAssignment,
)
from app.schemas.school_portal_audit import SchoolPortalAuditCreate
from app.services.audit import record_school_portal_audit
from app.services.school_portal_scope import (
    effective_school_id,
    get_school_record_or_404,
    school_owned_query,
)


class _Result:
    def __init__(self, value):
        self.value = value

    def unique(self):
        return self

    def scalar_one_or_none(self):
        return self.value


class _Db:
    def __init__(self, result=None):
        self.result = result
        self.statements = []
        self.added = []
        self.flush_count = 0

    async def execute(self, statement):
        self.statements.append(statement)
        return _Result(self.result)

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        self.flush_count += 1


class SchoolPortalScopeTests(unittest.IsolatedAsyncioTestCase):
    def test_effective_school_id_adapters_cover_school_owned_models(self):
        school_id = uuid.uuid4()
        records = (
            (School(), school_id),
            (Department(school_id=school_id), school_id),
            (
                Programme(
                    department=Department(school_id=school_id),
                    department_id=uuid.uuid4(),
                ),
                school_id,
            ),
            (
                StaffAssignment(
                    person_id=uuid.uuid4(),
                    entity_type="school",
                    entity_id=school_id,
                    role="lecturer",
                ),
                school_id,
            ),
            (
                Document(
                    title="Handbook",
                    slug="handbook",
                    document_type="handbook",
                    scope_type="school",
                    scope_id=school_id,
                    file_id=uuid.uuid4(),
                ),
                school_id,
            ),
            (
                MediaFolder(
                    name="School media",
                    slug="school-media",
                    scope_type="school",
                    scope_id=school_id,
                ),
                school_id,
            ),
            (
                News(
                    title="School news",
                    slug="school-news",
                    scope_type="school",
                    scope_id=school_id,
                ),
                school_id,
            ),
        )
        records[0][0].id = school_id

        for record, expected_school_id in records:
            with self.subTest(model=type(record).__name__):
                self.assertEqual(expected_school_id, effective_school_id(record))

    def test_query_builders_apply_direct_or_derived_school_filters(self):
        school_id = uuid.uuid4()
        cases = {
            School: ("schools.id",),
            Department: ("departments.school_id",),
            Programme: ("join departments", "departments.school_id"),
            StaffAssignment: ("staff_assignments.entity_type", "departments.school_id"),
            Document: ("documents.scope_type", "departments.school_id"),
            MediaFolder: ("media_folders.scope_type", "departments.school_id"),
            News: ("news.scope_type", "news.owner_scope_type", "departments.school_id"),
        }

        for model, fragments in cases.items():
            with self.subTest(model=model.__name__):
                query = str(school_owned_query(model, school_id)).lower()
                for fragment in fragments:
                    self.assertIn(fragment, query)

    async def test_cross_school_ids_return_404_for_every_guarded_model(self):
        school_id = uuid.uuid4()
        record_id = uuid.uuid4()
        db = _Db(result=None)

        for model in (
            School,
            Department,
            Programme,
            StaffAssignment,
            Document,
            MediaFolder,
            News,
        ):
            with self.subTest(model=model.__name__):
                with self.assertRaises(HTTPException) as caught:
                    await get_school_record_or_404(
                        db,
                        model,
                        record_id,
                        school_id=school_id,
                    )
                self.assertEqual(404, caught.exception.status_code)
                self.assertEqual("Record not found", caught.exception.detail)

    async def test_guard_returns_same_school_record_for_reads_or_writes(self):
        school_id = uuid.uuid4()
        department = Department(
            name="Computing",
            slug="computing",
            code="COMP",
            school_id=school_id,
        )
        department.id = uuid.uuid4()
        db = _Db(result=department)

        record = await get_school_record_or_404(
            db,
            Department,
            department.id,
            school_id=school_id,
        )

        self.assertIs(department, record)
        self.assertEqual(1, len(db.statements))

    async def test_school_audit_helper_records_scope_actor_request_and_changes(self):
        db = _Db()
        school_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        resource_id = uuid.uuid4()
        audit = SchoolPortalAuditCreate(
            school_id=school_id,
            action="school.department.updated",
            resource_type="department",
            resource_id=resource_id,
            actor_id=actor_id,
            changed_fields={"name": {"old": "ICT", "new": "Computing"}},
            request_id="req-123",
            request_method="PATCH",
            request_path=f"/api/v1/school-portal/departments/{resource_id}",
            ip_address="127.0.0.1",
            user_agent="portal-test",
        )

        record = await record_school_portal_audit(db, audit)

        self.assertIsInstance(record, AuditLog)
        self.assertEqual(actor_id, record.user_id)
        self.assertEqual(str(resource_id), record.resource_id)
        self.assertEqual(str(school_id), record.details["school_id"])
        self.assertEqual("req-123", record.details["request_id"])
        self.assertEqual(audit.changed_fields, record.changes)
        self.assertEqual([record], db.added)
        self.assertEqual(1, db.flush_count)


if __name__ == "__main__":
    unittest.main()
