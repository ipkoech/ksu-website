import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import ANY, AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import media
from app.models import PageSection
from app.models.media import MEDIA_ATTACHMENT_ROLES
from app.schemas import MediaLinkCreate, MediaLinkUpdate
from app.services.media import MediaService


class _Db:
    def __init__(self):
        self.added = []
        self.rollback_count = 0

    def add(self, record):
        self.added.append(record)

    async def flush(self):
        return None

    async def rollback(self):
        self.rollback_count += 1


class _ScalarResult:
    def __init__(self, value):
        self.value = value

    def one_or_none(self):
        return self.value


class _ScopeDb(_Db):
    def __init__(self, value):
        super().__init__()
        self.value = value

    async def execute(self, statement):
        return _ScalarResult(self.value)


class _PageSectionDb(_Db):
    def __init__(self, *sections):
        super().__init__()
        self.sections = list(sections)

    async def execute(self, _statement):
        return SimpleNamespace(
            scalars=lambda: SimpleNamespace(all=lambda: list(self.sections)),
        )


class _Upload:
    content_type = "application/pdf"
    filename = "prospectus.pdf"


def _media(**overrides):
    values = {
        "id": uuid.uuid4(),
        "title": "Prospectus",
        "filename": "prospectus.pdf",
        "original_filename": "2026-prospectus.pdf",
        "mime_type": "application/pdf",
        "file_size": 2048,
        "media_type": "document",
        "thumbnail_url": None,
        "is_public": True,
        "url": "/media/prospectus.pdf",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class MediaAttachmentContractTests(unittest.IsolatedAsyncioTestCase):
    def test_standard_attachment_role_vocabulary_is_available(self):
        self.assertEqual(
            {"cover", "gallery", "logo", "video", "document", "poster", "cv", "brochure", "attachment"},
            set(MEDIA_ATTACHMENT_ROLES),
        )

    async def test_upload_with_entity_creates_media_link_immediately(self):
        db = _Db()
        entity_id = uuid.uuid4()
        uploaded = _media()

        with (
            patch("app.services.media.upload_file", new_callable=AsyncMock, return_value={
                "filename": uploaded.filename,
                "original_filename": uploaded.original_filename,
                "mime_type": uploaded.mime_type,
                "file_size": uploaded.file_size,
                "storage_path": "departments/prospectus.pdf",
            }),
            patch.object(MediaService, "link_media", new_callable=AsyncMock) as link_media,
        ):
            result = await MediaService.upload(
                db,
                file=_Upload(),
                uploaded_by_id=uuid.uuid4(),
                entity_type="department",
                entity_id=entity_id,
                role="brochure",
            )

        self.assertEqual("document", result.media_type)
        link_media.assert_awaited_once_with(
            db,
            media_id=result.id,
            entity_type="department",
            entity_id=entity_id,
            role="brochure",
            is_public=False,
        )

    async def test_school_entity_upload_is_assigned_to_the_school_media_folder(self):
        db = _Db()
        school_id = uuid.uuid4()
        uploaded_by_id = uuid.uuid4()
        folder = SimpleNamespace(id=uuid.uuid4())
        uploaded = _media()

        with (
            patch("app.services.media.upload_file", new_callable=AsyncMock, return_value={
                "filename": uploaded.filename,
                "original_filename": uploaded.original_filename,
                "mime_type": uploaded.mime_type,
                "file_size": uploaded.file_size,
                "storage_path": f"schools/{school_id}/brochure/prospectus.pdf",
            }),
            patch.object(
                MediaService,
                "ensure_school_media_folder",
                new_callable=AsyncMock,
                return_value=folder,
                create=True,
            ) as ensure_folder,
            patch.object(MediaService, "link_media", new_callable=AsyncMock) as link_media,
        ):
            result = await MediaService.upload(
                db,
                file=_Upload(),
                uploaded_by_id=uploaded_by_id,
                entity_type="school",
                entity_id=school_id,
                role="brochure",
            )

        ensure_folder.assert_awaited_once_with(db, school_id)
        self.assertEqual(folder.id, result.folder_id)
        link_media.assert_awaited_once_with(
            db,
            media_id=result.id,
            entity_type="school",
            entity_id=school_id,
            role="brochure",
            folder_id=folder.id,
            is_public=False,
            status="draft",
            workflow_status="draft",
            owner_portal="schools",
            owner_scope_type="school",
            owner_scope_id=school_id,
            author_user_id=uploaded_by_id,
        )

    def test_attachment_summary_includes_display_fields(self):
        item = _media()
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=item.id,
            entity_type="department",
            entity_id=uuid.uuid4(),
            role="brochure",
            folder_id=None,
            display_order=4,
            is_public=False,
            media=item,
        )

        payload = MediaService.serialize_link(link)

        self.assertEqual("Prospectus", payload["media"]["title"])
        self.assertEqual("2026-prospectus.pdf", payload["media"]["original_filename"])
        self.assertEqual("/media/prospectus.pdf", payload["media"]["url"])
        self.assertEqual("brochure", payload["role"])
        self.assertEqual(4, payload["display_order"])
        self.assertFalse(payload["is_public"])

    async def test_list_attachments_returns_display_ready_media_summary(self):
        item = _media()
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=item.id,
            entity_type="department",
            entity_id=uuid.uuid4(),
            role="brochure",
            folder_id=None,
            display_order=4,
            is_public=False,
            media=item,
        )

        with patch.object(media.MediaService, "list_links", return_value=[link]):
            response = await media.list_media_links(
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
                entity_type="department",
                entity_id=link.entity_id,
            )

        attachment = response["data"][0]
        self.assertEqual("Prospectus", attachment["media"]["title"])
        self.assertEqual("2026-prospectus.pdf", attachment["media"]["original_filename"])
        self.assertEqual("/media/prospectus.pdf", attachment["media"]["url"])
        self.assertEqual("brochure", attachment["role"])
        self.assertEqual(4, attachment["display_order"])
        self.assertFalse(attachment["is_public"])

    async def test_link_reordering_persists_display_order(self):
        db = _Db()
        link = SimpleNamespace(display_order=100)

        result = await MediaService.update_link(db, link, display_order=2)

        self.assertIs(link, result)
        self.assertEqual(2, link.display_order)

    async def test_upload_rejects_entity_scope_without_attachment_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with patch.object(media, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await media.upload_media(
                    db=None,
                    user=user,
                    file=_Upload(),
                    folder_id=None,
                    is_public=False,
                    entity_type="department",
                    entity_id=uuid.uuid4(),
                    role="brochure",
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_page_section_upload_requires_page_authoring_access_before_upload(self):
        user = SimpleNamespace(id=uuid.uuid4())
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            revision=4,
        )
        section.id = uuid.uuid4()
        upload = AsyncMock()

        with (
            patch.object(media, "_require_media_entity_scope", AsyncMock()),
            patch.object(
                media,
                "_require_page_section_access",
                AsyncMock(side_effect=HTTPException(status_code=403, detail="Forbidden")),
            ),
            patch.object(media.MediaService, "upload", upload),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.upload_media(
                    db=_PageSectionDb(section),
                    user=user,
                    file=_Upload(),
                    folder_id=None,
                    is_public=False,
                    entity_type="page_section",
                    entity_id=section.id,
                    role="hero_image",
                )

        self.assertEqual(403, context.exception.status_code)
        upload.assert_not_awaited()

    async def test_page_section_upload_touches_locked_parent_once_before_linking(self):
        user = SimpleNamespace(id=uuid.uuid4())
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
            workflow_status="published",
            revision=4,
        )
        section.id = uuid.uuid4()
        uploaded = _media()
        upload = AsyncMock(return_value=uploaded)

        with (
            patch.object(media, "_require_media_entity_scope", AsyncMock()),
            patch.object(media, "_require_media_folder_scope", AsyncMock()),
            patch.object(media.MediaService, "upload", upload),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            response = await media.upload_media(
                db=_PageSectionDb(section),
                user=user,
                file=_Upload(),
                folder_id=None,
                is_public=False,
                entity_type="page_section",
                entity_id=section.id,
                role="hero_image",
            )

        self.assertIs(uploaded, response["data"])
        self.assertEqual(5, section.revision)
        self.assertEqual("draft", section.workflow_status)
        upload.assert_awaited_once()

    async def test_page_section_upload_reauthorizes_media_scope_after_parent_lock(self):
        user = SimpleNamespace(id=uuid.uuid4())
        section = PageSection(
            page_key="school_homepage",
            scope_type="school",
            scope_id=uuid.uuid4(),
            section_key="hero",
            layout_variant="hero_admissions",
            revision=4,
        )
        section.id = uuid.uuid4()
        upload = AsyncMock()
        locked_media_scope = AsyncMock(side_effect=HTTPException(status_code=403, detail="Forbidden"))

        with (
            patch.object(media, "_require_media_entity_scope", AsyncMock()),
            patch.object(media, "_require_media_folder_scope", locked_media_scope),
            patch.object(media.MediaService, "upload", upload),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.upload_media(
                    db=_PageSectionDb(section),
                    user=user,
                    file=_Upload(),
                    folder_id=None,
                    is_public=False,
                    entity_type="page_section",
                    entity_id=section.id,
                    role="hero_image",
                )

        self.assertEqual(403, context.exception.status_code)
        locked_media_scope.assert_awaited_once_with(
            ANY,
            user,
            media.MEDIA_FOLDER_MANAGE_PERMISSIONS,
            section.scope_type,
            section.scope_id,
        )
        upload.assert_not_awaited()

    async def test_upload_rolls_back_database_and_storage_when_linking_fails(self):
        db = _Db()
        metadata = {
            "filename": "prospectus.pdf",
            "original_filename": "prospectus.pdf",
            "mime_type": "application/pdf",
            "file_size": 2048,
            "storage_path": "page-sections/hero/prospectus.pdf",
            "public_url": "/media/page-sections/hero/prospectus.pdf",
        }
        cleanup = AsyncMock()

        with (
            patch("app.services.media.upload_file", AsyncMock(return_value=metadata)),
            patch("app.services.media.delete_file", cleanup),
            patch.object(MediaService, "get_attachment_scope", AsyncMock(return_value=("university", None))),
            patch.object(MediaService, "link_media", AsyncMock(side_effect=RuntimeError("link failed"))),
        ):
            with self.assertRaisesRegex(RuntimeError, "link failed"):
                await MediaService.upload(
                    db,
                    file=_Upload(),
                    uploaded_by_id=uuid.uuid4(),
                    entity_type="page_section",
                    entity_id=uuid.uuid4(),
                )

        self.assertEqual(1, db.rollback_count)
        cleanup.assert_awaited_once_with(metadata["storage_path"])

    async def test_get_link_for_update_uses_for_update_and_refreshes_identity_map(self):
        link = SimpleNamespace(id=uuid.uuid4())

        class _LinkDb:
            def __init__(self):
                self.statement = None

            async def execute(self, statement):
                self.statement = statement
                return SimpleNamespace(scalar_one_or_none=lambda: link)

        db = _LinkDb()
        result = await MediaService.get_link_for_update(db, link.id)

        self.assertIs(link, result)
        self.assertIsNotNone(db.statement._for_update_arg)
        self.assertTrue(db.statement.get_execution_options().get("populate_existing"))

    async def test_link_parent_snapshot_is_unlocked_and_selects_only_parent_identity(self):
        entity_id = uuid.uuid4()

        class _SnapshotDb:
            def __init__(self):
                self.statement = None

            async def execute(self, statement):
                self.statement = statement
                return SimpleNamespace(
                    one_or_none=lambda: SimpleNamespace(entity_type="page_section", entity_id=entity_id),
                )

        db = _SnapshotDb()
        snapshot = await MediaService.get_link_parent_snapshot(db, uuid.uuid4())

        self.assertEqual(("page_section", entity_id), snapshot)
        self.assertIsNone(db.statement._for_update_arg)
        self.assertEqual(2, len(db.statement.selected_columns))

    async def test_create_link_rejects_entity_scope_without_attachment_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = MediaLinkCreate(
            media_id=uuid.uuid4(),
            entity_type="department",
            entity_id=uuid.uuid4(),
            role="brochure",
        )

        with patch.object(media, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await media.create_media_link(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_workflow_managed_club_link_rejects_direct_visibility_update(self):
        link = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="blog",
            entity_id=uuid.uuid4(),
            owner_portal="student-clubs",
            owner_scope_type="club",
            owner_scope_id=uuid.uuid4(),
            is_public=False,
        )

        with (
            patch.object(
                media.MediaService,
                "get_link_parent_snapshot",
                AsyncMock(return_value=(link.entity_type, link.entity_id)),
            ),
            patch.object(media.MediaService, "get_link_for_update", new_callable=AsyncMock, return_value=link),
            patch.object(media, "_require_media_entity_scope", new_callable=AsyncMock),
            patch.object(
                media,
                "_authorized_media_entity_scope",
                AsyncMock(return_value=("club", link.owner_scope_id)),
            ),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.update_media_link(
                    link_id=link.id,
                    data=media.MediaLinkUpdate(is_public=True),
                    db=None,
                    user=SimpleNamespace(id=uuid.uuid4()),
                )

        self.assertEqual(400, context.exception.status_code)

    async def test_workflow_visibility_validation_does_not_precede_source_authorization(self):
        link = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="blog",
            entity_id=uuid.uuid4(),
            owner_portal="student-clubs",
            owner_scope_type="club",
            owner_scope_id=uuid.uuid4(),
            is_public=False,
        )

        with (
            patch.object(
                media.MediaService,
                "get_link_parent_snapshot",
                AsyncMock(return_value=(link.entity_type, link.entity_id)),
                create=True,
            ),
            patch.object(media.MediaService, "get_link_for_update", AsyncMock(return_value=link)),
            patch.object(
                media,
                "_require_media_entity_scope",
                AsyncMock(side_effect=HTTPException(status_code=403, detail="Forbidden")),
            ),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.update_media_link(
                    link_id=link.id,
                    data=MediaLinkUpdate(is_public=True),
                    db=None,
                    user=SimpleNamespace(id=uuid.uuid4()),
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_club_assignment_can_upload_to_own_club_scope(self):
        club_id = uuid.uuid4()
        user = SimpleNamespace(
            id=uuid.uuid4(),
            role_assignments=[],
            person=SimpleNamespace(
                assignments=[
                    SimpleNamespace(entity_type="club", entity_id=club_id, role="official", status="active")
                ]
            ),
        )
        uploaded = _media(mime_type="image/jpeg", media_type="image", filename="club.jpg", original_filename="club.jpg")

        with (
            patch("app.services.media.upload_file", new_callable=AsyncMock, return_value={
                "filename": uploaded.filename,
                "original_filename": uploaded.original_filename,
                "mime_type": uploaded.mime_type,
                "file_size": uploaded.file_size,
                "storage_path": "clubs/club.jpg",
            }),
            patch.object(MediaService, "link_media", new_callable=AsyncMock) as link_media,
        ):
            response = await media.upload_media(
                db=_Db(),
                user=user,
                file=SimpleNamespace(content_type="image/jpeg", filename="club.jpg"),
                folder_id=None,
                is_public=True,
                entity_type="club",
                entity_id=club_id,
                role="gallery",
            )

        self.assertFalse(response["data"].is_public)
        call = link_media.await_args.kwargs
        self.assertFalse(call["is_public"])
        self.assertEqual("student-clubs", call["owner_portal"])
        self.assertEqual("club", call["owner_scope_type"])
        self.assertEqual(club_id, call["owner_scope_id"])
        self.assertEqual(user.id, call["author_user_id"])

    async def test_create_club_scoped_link_stamps_workflow_metadata(self):
        club_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        payload = MediaLinkCreate(
            media_id=uuid.uuid4(),
            entity_type="club",
            entity_id=club_id,
            role="gallery",
            is_public=True,
        )

        with (
            patch.object(media.MediaService, "get_attachment_scope", new_callable=AsyncMock, return_value=("club", club_id)),
            patch.object(media.MediaService, "get_authorized_by_id", new_callable=AsyncMock, return_value=_media(id=payload.media_id)),
            patch.object(media.MediaService, "link_media", new_callable=AsyncMock) as link_media,
            patch.object(media, "_require_media_folder_scope", new_callable=AsyncMock),
        ):
            link_media.return_value = SimpleNamespace(
                id=uuid.uuid4(),
                media_id=payload.media_id,
                entity_type="club",
                entity_id=club_id,
                role="gallery",
                folder_id=None,
                display_order=100,
                is_public=False,
                is_published=False,
                status="draft",
                workflow_status="draft",
                owner_portal="student-clubs",
                owner_scope_type="club",
                owner_scope_id=club_id,
                submitted_at=None,
                approved_at=None,
                published_at=None,
                media=_media(id=payload.media_id),
            )
            await media.create_media_link(payload, db=None, user=user)

        call = link_media.await_args.kwargs
        self.assertFalse(call["is_public"])
        self.assertEqual("student-clubs", call["owner_portal"])
        self.assertEqual("club", call["owner_scope_type"])
        self.assertEqual(club_id, call["owner_scope_id"])

    async def test_create_page_section_link_advances_parent_revision_and_resets_workflow_once(self):
        user = SimpleNamespace(id=uuid.uuid4())
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
            workflow_status="published",
            revision=4,
        )
        section.id = uuid.uuid4()
        payload = MediaLinkCreate(
            media_id=uuid.uuid4(),
            entity_type="page_section",
            entity_id=section.id,
            role="hero_image",
        )
        linked = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=payload.media_id,
            entity_type=payload.entity_type,
            entity_id=payload.entity_id,
            role=payload.role,
            folder_id=None,
            display_order=100,
            is_public=True,
            media=None,
        )

        with (
            patch.object(media, "_authorized_media_entity_scope", new_callable=AsyncMock, return_value=("university", None)),
            patch.object(media.MediaService, "get_authorized_by_id", new_callable=AsyncMock, return_value=_media(id=payload.media_id)),
            patch.object(media.MediaService, "link_media", new_callable=AsyncMock, return_value=linked),
            patch.object(media, "_require_media_folder_scope", AsyncMock()),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            await media.create_media_link(payload, db=_PageSectionDb(section), user=user)

        self.assertEqual(5, section.revision)
        self.assertEqual(user.id, section.updated_by_id)
        self.assertEqual("draft", section.workflow_status)

    async def test_relinking_between_page_sections_advances_each_parent_once(self):
        user = SimpleNamespace(id=uuid.uuid4())
        source = PageSection(
            page_key="homepage", scope_type="university", section_key="hero",
            layout_variant="hero_admissions", status="published", workflow_status="published", revision=4,
        )
        destination = PageSection(
            page_key="homepage", scope_type="university", section_key="news",
            layout_variant="news_grid", status="published", workflow_status="published", revision=8,
        )
        source.id = uuid.uuid4()
        destination.id = uuid.uuid4()
        link = SimpleNamespace(
            id=uuid.uuid4(), media_id=uuid.uuid4(), entity_type="page_section", entity_id=source.id,
            role="hero_image", folder_id=None, display_order=100, is_public=True, media=_media(),
        )

        async def update_link(_db, record, **changes):
            for field, value in changes.items():
                setattr(record, field, value)
            return record

        with (
            patch.object(
                media.MediaService,
                "get_link_parent_snapshot",
                AsyncMock(return_value=(link.entity_type, link.entity_id)),
            ),
            patch.object(media.MediaService, "get_link_for_update", new_callable=AsyncMock, return_value=link),
            patch.object(media, "_require_media_entity_scope", new_callable=AsyncMock),
            patch.object(media, "_authorized_media_entity_scope", new_callable=AsyncMock, return_value=("university", None)),
            patch.object(media, "_require_media_folder_scope", AsyncMock()),
            patch.object(media.MediaService, "update_link", side_effect=update_link),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            await media.update_media_link(
                link.id,
                MediaLinkUpdate(entity_type="page_section", entity_id=destination.id),
                db=_PageSectionDb(source, destination),
                user=user,
            )

        self.assertEqual((5, 9), (source.revision, destination.revision))
        self.assertEqual((user.id, user.id), (source.updated_by_id, destination.updated_by_id))
        self.assertEqual(("draft", "draft"), (source.workflow_status, destination.workflow_status))

    async def test_relink_snapshots_then_locks_parents_before_link_and_mutation(self):
        user = SimpleNamespace(id=uuid.uuid4())
        source_id = uuid.uuid4()
        destination_id = uuid.uuid4()
        link = SimpleNamespace(
            id=uuid.uuid4(), media_id=uuid.uuid4(), entity_type="page_section", entity_id=source_id,
            role="hero_image", folder_id=None, display_order=100, is_public=True, media=_media(),
        )
        events: list[str] = []

        async def get_link_parent_snapshot(*_args):
            events.append("snapshot")
            return link.entity_type, link.entity_id

        async def lock_parents(*_args, **_kwargs):
            events.append("parents")
            return {
                source_id: SimpleNamespace(id=source_id, scope_type="university", scope_id=None),
                destination_id: SimpleNamespace(id=destination_id, scope_type="university", scope_id=None),
            }

        async def get_link_for_update(*_args):
            events.append("link")
            return link

        async def authorize_parents(*_args, **_kwargs):
            events.append("authorize")

        async def touch_parents(*_args, **_kwargs):
            events.append("touch")

        async def update_link(*_args, **_kwargs):
            events.append("mutate")
            return link

        with (
            patch.object(
                media.MediaService,
                "get_link_parent_snapshot",
                get_link_parent_snapshot,
                create=True,
            ),
            patch.object(media, "_lock_page_section_media_parents", lock_parents, create=True),
            patch.object(media.MediaService, "get_link_for_update", get_link_for_update),
            patch.object(
                media,
                "_authorize_locked_page_section_media_parents",
                authorize_parents,
                create=True,
            ),
            patch.object(media, "_touch_locked_page_section_media_parents", touch_parents),
            patch.object(media.MediaService, "update_link", update_link),
        ):
            await media.update_media_link(
                link.id,
                MediaLinkUpdate(entity_type="page_section", entity_id=destination_id),
                db=_Db(),
                user=user,
            )

        self.assertEqual(["snapshot", "parents", "link", "authorize", "touch", "mutate"], events)

    async def test_relink_rejects_locked_link_moved_after_parent_snapshot(self):
        user = SimpleNamespace(id=uuid.uuid4())
        original_id = uuid.uuid4()
        moved_id = uuid.uuid4()
        link = SimpleNamespace(
            id=uuid.uuid4(), media_id=uuid.uuid4(), entity_type="page_section", entity_id=moved_id,
            role="hero_image", folder_id=None, display_order=100, is_public=True, media=_media(),
        )
        authorize_parents = AsyncMock()
        update_link = AsyncMock(return_value=link)

        with (
            patch.object(
                media.MediaService,
                "get_link_parent_snapshot",
                AsyncMock(return_value=("page_section", original_id)),
                create=True,
            ),
            patch.object(
                media,
                "_lock_page_section_media_parents",
                AsyncMock(return_value={
                    original_id: SimpleNamespace(id=original_id),
                    moved_id: SimpleNamespace(id=moved_id),
                }),
                create=True,
            ),
            patch.object(media.MediaService, "get_link_for_update", AsyncMock(return_value=link)),
            patch.object(
                media,
                "_authorize_locked_page_section_media_parents",
                authorize_parents,
                create=True,
            ),
            patch.object(media, "_touch_page_section_media_parents", AsyncMock()),
            patch.object(media, "_require_media_entity_scope", AsyncMock()),
            patch.object(
                media,
                "_authorized_media_entity_scope",
                AsyncMock(return_value=("university", None)),
            ),
            patch.object(media.MediaService, "update_link", update_link),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.update_media_link(
                    link.id,
                    MediaLinkUpdate(entity_type="page_section", entity_id=moved_id),
                    db=_Db(),
                    user=user,
                )

        self.assertEqual(409, context.exception.status_code)
        self.assertIn("reload", context.exception.detail.lower())
        authorize_parents.assert_not_awaited()
        update_link.assert_not_awaited()

    async def test_delete_page_section_link_advances_parent_revision_before_link_deletion(self):
        user = SimpleNamespace(id=uuid.uuid4())
        section = PageSection(
            page_key="homepage", scope_type="university", section_key="hero",
            layout_variant="hero_admissions", status="published", workflow_status="published", revision=4,
        )
        section.id = uuid.uuid4()
        link = SimpleNamespace(
            id=uuid.uuid4(), media_id=uuid.uuid4(), entity_type="page_section", entity_id=section.id,
        )
        delete_link = AsyncMock()

        with (
            patch.object(
                media.MediaService,
                "get_link_parent_snapshot",
                AsyncMock(return_value=(link.entity_type, link.entity_id)),
            ),
            patch.object(media.MediaService, "get_link_for_update", new_callable=AsyncMock, return_value=link),
            patch.object(media, "_require_media_entity_scope", new_callable=AsyncMock),
            patch.object(media, "_require_media_folder_scope", AsyncMock()),
            patch.object(media.MediaService, "delete_link", delete_link),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            await media.delete_media_link(link.id, db=_PageSectionDb(section), user=user)

        self.assertEqual(5, section.revision)
        self.assertEqual(user.id, section.updated_by_id)
        delete_link.assert_awaited_once_with(ANY, link)

    async def test_club_activity_attachment_scope_resolves_to_owning_club(self):
        club_id = uuid.uuid4()

        scope_type, scope_id = await MediaService.get_attachment_scope(
            _ScopeDb(("club", club_id, club_id)),
            entity_type="club_activity",
            entity_id=uuid.uuid4(),
        )

        self.assertEqual("club", scope_type)
        self.assertEqual(club_id, scope_id)

    async def test_partnership_spotlight_attachment_scope_uses_owner_scope(self):
        scope_id = uuid.uuid4()

        scope_type, resolved_scope_id = await MediaService.get_attachment_scope(
            _ScopeDb(("global", scope_id)),
            entity_type="partnership_spotlight",
            entity_id=uuid.uuid4(),
        )

        self.assertEqual("global", scope_type)
        self.assertEqual(scope_id, resolved_scope_id)


if __name__ == "__main__":
    unittest.main()
