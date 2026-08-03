from app.models.content import SiteSettings
from app.schemas.public import SiteResponse


def test_site_response_serializes_sqlalchemy_settings() -> None:
    settings = SiteSettings(
        name="HERI Africa",
        tagline="Africa-led language education research",
        contact={"email": "heri@example.org"},
        social_links={"x": "@heri_africa"},
        seo_defaults={"title": "HERI Africa"},
    )

    response = SiteResponse.model_validate(settings)

    assert response.name == settings.name
    assert response.contact == settings.contact
    assert response.social_links == settings.social_links
