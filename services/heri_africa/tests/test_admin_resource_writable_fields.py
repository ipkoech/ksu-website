"""The generic admin CRUD accepts a raw dict, so writable_fields is the only
thing standing between a client payload and a model column."""

import unittest

from app.models.content import NewsArticle
from app.models.media import MediaAsset
from app.models.submissions import Submission
from app.services.admin_resources import writable_fields


class WritableFieldsTests(unittest.TestCase):
    def test_identity_columns_are_never_writable(self):
        for model in (NewsArticle, MediaAsset, Submission):
            with self.subTest(model=model.__name__):
                fields = writable_fields(model)
                for column in ("id", "created_at", "updated_at", "deleted_at"):
                    self.assertNotIn(column, fields)

    def test_media_file_identity_is_owned_by_the_upload_pipeline(self):
        fields = writable_fields(MediaAsset)

        for column in ("storage_path", "file_hash", "file_size", "mime_type", "file_name"):
            with self.subTest(column=column):
                self.assertNotIn(column, fields)

    def test_media_descriptive_columns_stay_editable(self):
        fields = writable_fields(MediaAsset)

        self.assertIn("alt_text", fields)
        self.assertIn("caption", fields)
        self.assertIn("credit", fields)

    def test_submissions_are_triageable_but_not_rewritable(self):
        fields = writable_fields(Submission)

        # Exactly what the admin submissions inbox sends.
        self.assertEqual(fields, {"status", "internal_notes"})

    def test_submission_visitor_supplied_content_is_immutable(self):
        fields = writable_fields(Submission)

        for column in ("email", "name", "message", "payload", "kind"):
            with self.subTest(column=column):
                self.assertNotIn(column, fields)

    def test_unrestricted_resources_remain_broadly_editable(self):
        fields = writable_fields(NewsArticle)

        self.assertIn("title", fields)
        self.assertIn("body", fields)


if __name__ == "__main__":
    unittest.main()
