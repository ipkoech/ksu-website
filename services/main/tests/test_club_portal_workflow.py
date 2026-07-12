import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import clubs
from app.schemas import ClubActivityCreate, ClubMediaPublicationUpdate, ClubUpdate
from app.security.scopes import can_access_scope
from app.services import student_life
from app.services.student_life import ClubService


class _Result:
    def scalars(self):
        return self

    def all(self):
        return []


class _Db:
    def __init__(self):
        self.statements = []
        self.added = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _Result()

    async def flush(self):
        return None

    async def refresh(self, item):
        return None

    def add(self, item):
        self.added.append(item)


class ClubPortalWorkflowTests(unittest.IsolatedAsyncioTestCase):
    async def test_club_assignment_only_grants_its_own_club(self):
        assigned_club_id = uuid.uuid4()
        other_club_id = uuid.uuid4()
        permission = SimpleNamespace(name="clubs.manage_own", is_active=True)
        role = SimpleNamespace(
            is_active=True,
            role_permissions=[SimpleNamespace(permission=permission)],
            permissions=[],
        )
        user = SimpleNamespace(
            role_assignments=[
                SimpleNamespace(
                    is_active=True,
                    role=role,
                    scope_type="club",
                    scope_id=assigned_club_id,
                ),
            ],
            person=SimpleNamespace(assignments=[]),
        )

        self.assertTrue(
            await can_access_scope(None, user, "clubs.manage_own", "club", assigned_club_id),
        )
        self.assertFalse(
            await can_access_scope(None, user, "clubs.manage_own", "club", other_club_id),
        )

    async def test_club_scope_guard_rejects_an_official_for_another_club(self):
        with patch.object(clubs, "can_access_scope", new_callable=AsyncMock, return_value=False):
            with self.assertRaises(HTTPException) as context:
                await clubs.require_club_scope(
                    db=None,
                    user=SimpleNamespace(id=uuid.uuid4()),
                    club_id=uuid.uuid4(),
                    permissions=["clubs.manage_own"],
                    resource_name="club",
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_public_club_events_require_published_workflow_state(self):
        db = _Db()

        await ClubService.list_activities(db, uuid.uuid4(), public_only=True)

        query_text = str(db.statements[0]).lower()
        self.assertIn("club_activities.is_public is true", query_text)
        self.assertIn("club_activities.is_published is true", query_text)
        self.assertIn("club_activities.workflow_status", query_text)

    def test_club_event_create_payload_starts_private_and_owned_by_the_club(self):
        club_id = uuid.uuid4()
        user_id = uuid.uuid4()
        payload = ClubActivityCreate(
            title="Debate finals",
            activity_type="competition",
            start_datetime=datetime(2030, 5, 1, tzinfo=timezone.utc),
            is_public=True,
        )

        data = clubs.club_activity_create_payload(payload, club_id=club_id, user_id=user_id)

        self.assertFalse(data["is_public"])
        self.assertFalse(data["is_published"])
        self.assertEqual("draft", data["status"])
        self.assertEqual("draft", data["workflow_status"])
        self.assertEqual("student-clubs", data["owner_portal"])
        self.assertEqual("club", data["owner_scope_type"])
        self.assertEqual(club_id, data["owner_scope_id"])
        self.assertEqual(user_id, data["author_user_id"])

    def test_club_profile_owner_payload_filters_administrative_fields(self):
        user = SimpleNamespace(role_assignments=[], person=SimpleNamespace(assignments=[]))
        payload = ClubUpdate(
            name="Debate Club",
            about="Student debating society",
            is_active=False,
            is_public=True,
            display_order=1,
            membership_count=999,
            school_id=uuid.uuid4(),
        )

        data = clubs._club_profile_update_payload(payload, user)

        self.assertEqual("Debate Club", data["name"])
        self.assertEqual("Student debating society", data["about"])
        self.assertNotIn("is_active", data)
        self.assertNotIn("is_public", data)
        self.assertNotIn("display_order", data)
        self.assertNotIn("membership_count", data)
        self.assertNotIn("school_id", data)

    async def test_club_media_publication_requires_cocms_workflow_permission(self):
        link = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="club",
            entity_id=uuid.uuid4(),
            media=SimpleNamespace(is_public=False),
        )

        with (
            patch.object(clubs, "permissions_for_user", return_value={"clubs.manage_own"}),
            patch.object(clubs.MediaService, "get_link_by_id", new_callable=AsyncMock, return_value=link),
        ):
            with self.assertRaises(HTTPException) as context:
                await clubs.set_club_media_publication(
                    club_id=link.entity_id,
                    link_id=link.id,
                    data=ClubMediaPublicationUpdate(is_public=True),
                    db=None,
                    user=SimpleNamespace(id=uuid.uuid4()),
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_cocms_can_publish_club_media_and_its_link(self):
        db = _Db()
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=uuid.uuid4(),
            entity_type="club",
            entity_id=uuid.uuid4(),
            is_public=False,
            is_published=False,
            status="approved",
            workflow_status="approved",
            role="gallery",
            folder_id=None,
            display_order=100,
            media=SimpleNamespace(
                id=uuid.uuid4(), title="Gallery image", filename="gallery.jpg",
                original_filename="gallery.jpg", mime_type="image/jpeg", file_size=100,
                media_type="image", thumbnail_url=None, url="/media/gallery.jpg", is_public=False,
            ),
        )

        with (
            patch.object(clubs, "permissions_for_user", return_value={"content.publish"}),
            patch.object(clubs.MediaService, "get_link_by_id", new_callable=AsyncMock, return_value=link),
        ):
            response = await clubs.set_club_media_publication(
                club_id=link.entity_id,
                link_id=link.id,
                data=ClubMediaPublicationUpdate(is_public=True),
                db=db,
                user=SimpleNamespace(id=uuid.uuid4()),
            )

        self.assertTrue(link.is_public)
        self.assertTrue(link.media.is_public)
        self.assertEqual("publish", db.added[0].action)
        self.assertEqual("club-media", db.added[0].content_type)
        self.assertTrue(response["data"]["is_public"])

    async def test_club_media_submit_requires_own_club_scope_and_logs_transition(self):
        db = _Db()
        club_id = uuid.uuid4()
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=uuid.uuid4(),
            entity_type="club",
            entity_id=club_id,
            is_public=False,
            is_published=False,
            status="draft",
            workflow_status="draft",
            role="gallery",
            folder_id=None,
            display_order=100,
            media=SimpleNamespace(
                id=uuid.uuid4(), title="Gallery image", filename="gallery.jpg",
                original_filename="gallery.jpg", mime_type="image/jpeg", file_size=100,
                media_type="image", thumbnail_url=None, url="/media/gallery.jpg", is_public=False,
            ),
        )

        with (
            patch.object(clubs, "can_access_scope", new_callable=AsyncMock, return_value=True),
            patch.object(clubs.MediaService, "get_link_by_id", new_callable=AsyncMock, return_value=link),
        ):
            response = await clubs.transition_club_media(
                club_id=club_id,
                link_id=link.id,
                action="submit",
                data=clubs.ContentWorkflowActionRequest(),
                db=db,
                user=SimpleNamespace(id=uuid.uuid4()),
            )

        self.assertEqual("submitted", link.workflow_status)
        self.assertFalse(link.is_public)
        self.assertFalse(link.media.is_public)
        self.assertEqual("submit", db.added[0].action)
        self.assertEqual("club-media", db.added[0].content_type)
        self.assertEqual("submitted", response["data"]["workflow_status"])

    async def test_attach_club_media_reuses_existing_upload_created_link(self):
        club_id = uuid.uuid4()
        media_id = uuid.uuid4()
        existing_link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=media_id,
            entity_type="club",
            entity_id=club_id,
            is_public=True,
            is_published=False,
            status="draft",
            workflow_status="draft",
            role="gallery",
            folder_id=None,
            display_order=100,
            media=None,
        )
        media_item = SimpleNamespace(
            id=media_id, title="Gallery image", filename="gallery.jpg",
            original_filename="gallery.jpg", mime_type="image/jpeg", file_size=100,
            media_type="image", thumbnail_url=None, url="/media/gallery.jpg", is_public=False,
        )

        with (
            patch.object(clubs, "_club_or_404", new_callable=AsyncMock),
            patch.object(clubs, "require_club_scope", new_callable=AsyncMock),
            patch.object(clubs.MediaService, "get_authorized_by_id", new_callable=AsyncMock, return_value=media_item),
            patch.object(clubs.MediaService, "get_link_for_media", new_callable=AsyncMock, return_value=existing_link),
            patch.object(clubs.MediaService, "update_link", new_callable=AsyncMock) as update_link,
            patch.object(clubs.MediaService, "link_media", new_callable=AsyncMock) as link_media,
        ):
            async def apply_update(_db, link, **data):
                for key, value in data.items():
                    setattr(link, key, value)
                return link

            update_link.side_effect = apply_update
            response = await clubs.attach_club_media(
                club_id=club_id,
                data=clubs.ClubMediaCreate(media_id=media_id, role="gallery", display_order=5),
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
            )

        link_media.assert_not_awaited()
        update_link.assert_awaited_once()
        self.assertFalse(existing_link.is_public)
        self.assertEqual("student-clubs", response["data"]["owner_portal"])

    async def test_cocms_cannot_publish_draft_club_media(self):
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=uuid.uuid4(),
            entity_type="club",
            entity_id=uuid.uuid4(),
            is_public=False,
            is_published=False,
            status="draft",
            workflow_status="draft",
            role="gallery",
            folder_id=None,
            display_order=100,
            media=SimpleNamespace(is_public=False),
        )

        with (
            patch.object(clubs, "permissions_for_user", return_value={"content.publish"}),
            patch.object(clubs.MediaService, "get_link_by_id", new_callable=AsyncMock, return_value=link),
        ):
            with self.assertRaises(HTTPException) as context:
                await clubs.set_club_media_publication(
                    club_id=link.entity_id,
                    link_id=link.id,
                    data=ClubMediaPublicationUpdate(is_public=True),
                    db=_Db(),
                    user=SimpleNamespace(id=uuid.uuid4()),
                )

        self.assertEqual(400, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
