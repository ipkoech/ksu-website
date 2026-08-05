import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from ksu_common.auth import TokenPayload
from pydantic import ValidationError

from app.models import Publication
from app.routes.v1 import router as v1_router
from app.schemas.publication import (
    SchoolPublicationCreate,
    SchoolPublicationUpdate,
)
from app.services.publication import PublicationService


def _token(school_id, *permissions):
    return TokenPayload(
        sub=str(uuid.uuid4()),
        jti=str(uuid.uuid4()),
        roles=["school_editor"],
        raw={
            "scope_grants": [
                {
                    "scope_type": "school",
                    "scope_id": str(school_id),
                    "permissions": list(permissions),
                }
            ],
            "permissions": list(permissions),
        },
    )


class _Db:
    def __init__(self):
        self.added = []

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        return None

    async def refresh(self, item):
        return None


class SchoolPublicationTests(unittest.IsolatedAsyncioTestCase):
    def test_model_contains_school_workflow_fields(self):
        fields = {
            "school_id",
            "department_id",
            "submitted_by_user_id",
            "submitted_at",
            "withdrawn_at",
            "reviewed_at",
            "reviewer_comments",
        }
        self.assertTrue(fields <= set(Publication.__table__.columns.keys()))

    def test_school_create_contract_forbids_scope_and_status_mass_assignment(self):
        with self.assertRaises(ValidationError):
            SchoolPublicationCreate(
                title="Scoped paper",
                slug="scoped-paper",
                school_id=uuid.uuid4(),
                status="published",
            )

    async def test_create_stamps_school_user_and_draft_status(self):
        school_id = uuid.uuid4()
        user = _token(
            school_id,
            "school.publications.manage",
            "school.publications.view",
        )
        db = _Db()
        with patch(
            "app.services.publication.MainReferenceValidator.validate_department_school",
            AsyncMock(),
        ):
            publication = await PublicationService.create_for_school(
                db,
                SchoolPublicationCreate(
                    title="Scoped paper",
                    slug="scoped-paper",
                    department_id=uuid.uuid4(),
                ),
                user,
            )

        self.assertEqual(school_id, publication.school_id)
        self.assertEqual(uuid.UUID(user.sub), publication.submitted_by_user_id)
        self.assertEqual("draft", publication.status)

    async def test_update_rejects_other_school_record(self):
        school_id = uuid.uuid4()
        publication = SimpleNamespace(
            id=uuid.uuid4(),
            school_id=uuid.uuid4(),
            status="draft",
        )

        with self.assertRaises(HTTPException) as caught:
            await PublicationService.update_for_school(
                _Db(),
                publication,
                SchoolPublicationUpdate(title="No access"),
                _token(school_id, "school.publications.manage"),
            )

        self.assertEqual(404, caught.exception.status_code)

    async def test_submit_and_withdraw_follow_author_workflow(self):
        school_id = uuid.uuid4()
        user = _token(school_id, "school.publications.submit")
        publication = SimpleNamespace(
            id=uuid.uuid4(),
            school_id=school_id,
            status="draft",
            submitted_at=None,
            withdrawn_at=None,
            submitted_by_user_id=None,
        )
        db = _Db()

        await PublicationService.submit_for_school(db, publication, user)
        self.assertEqual("submitted", publication.status)
        self.assertIsNotNone(publication.submitted_at)

        await PublicationService.withdraw_for_school(db, publication, user)
        self.assertEqual("draft", publication.status)
        self.assertIsNotNone(publication.withdrawn_at)

    def test_school_publication_routes_exist_without_school_id(self):
        app = FastAPI()
        app.include_router(v1_router, prefix="/api/v1")
        paths = app.openapi()["paths"]

        self.assertIn("/api/v1/school-publications", paths)
        self.assertIn("/api/v1/school-publications/summary", paths)
        self.assertIn("/api/v1/school-publications/{publication_id}", paths)
        self.assertIn(
            "/api/v1/school-publications/{publication_id}/submit", paths
        )
        self.assertIn(
            "/api/v1/school-publications/{publication_id}/withdraw", paths
        )


if __name__ == "__main__":
    unittest.main()
