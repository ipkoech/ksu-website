import unittest
from types import SimpleNamespace

from app.api.v1._person_media import with_person_photo_urls
from app.helpers.storage import get_media_public_url
from app.models.media import Media


class MediaHelperTests(unittest.TestCase):
    def test_media_public_url_preserves_public_asset_paths(self):
        media = SimpleNamespace(public_url="/logos/vc3.jpg", storage_path="logos/vc3.jpg")

        self.assertEqual("/logos/vc3.jpg", get_media_public_url(media))

    def test_media_public_url_preserves_upload_paths(self):
        media = SimpleNamespace(public_url="/uploads/logos/vc3.jpg", storage_path="logos/vc3.jpg")

        self.assertEqual("/uploads/logos/vc3.jpg", get_media_public_url(media))

    def test_media_public_url_prefers_cdn_url(self):
        media = SimpleNamespace(
            cdn_url="https://cdn.example.test/vc3.jpg",
            public_url="/logos/vc3.jpg",
            storage_path="logos/vc3.jpg",
        )

        self.assertEqual("https://cdn.example.test/vc3.jpg", get_media_public_url(media))

    def test_media_public_url_falls_back_to_storage_path(self):
        media = SimpleNamespace(storage_path="logos/vc3.jpg")

        self.assertEqual("/uploads/logos/vc3.jpg", get_media_public_url(media))

    def test_media_model_url_preserves_public_url(self):
        media = Media(
            filename="vc3.jpg",
            original_filename="vc3.jpg",
            storage_path="logos/vc3.jpg",
            mime_type="image/jpeg",
            public_url="/logos/vc3.jpg",
        )

        self.assertEqual("/logos/vc3.jpg", media.url)

    def test_person_photo_helper_uses_nested_public_url(self):
        payload = {
            "person": {
                "id": "person-1",
                "photo": {
                    "public_url": "/logos/vc3.jpg",
                    "url": "/uploads/logos/vc3.jpg",
                },
            }
        }
        source = SimpleNamespace(person=SimpleNamespace(photo_url="/uploads/logos/vc3.jpg"))

        result = with_person_photo_urls(payload, source)

        self.assertEqual("/logos/vc3.jpg", result["person"]["photo_url"])


if __name__ == "__main__":
    unittest.main()
