from __future__ import annotations

from pathlib import Path

import sqlalchemy as sa

from app.models import (
    VC_SECTIONS,
    VC_SPEECH_TYPES,
    VC_SPEECH_VIDEO_ROLES,
    VC_VIDEO_PROVIDERS,
    VcGalleryAlbum,
    VcHub,
    VcHubPlacement,
    VcSpeech,
    VcSpeechVideo,
    VcVideo,
)


def _check(table: sa.Table, name: str) -> sa.CheckConstraint:
    return next(
        constraint
        for constraint in table.constraints
        if isinstance(constraint, sa.CheckConstraint) and constraint.name == name
    )


def _index(table: sa.Table, name: str) -> sa.Index:
    return next(index for index in table.indexes if index.name == name)


def test_vc_domain_uses_the_approved_content_catalogs():
    assert VC_SECTIONS == (
        "story",
        "activities",
        "speeches",
        "videos",
        "events",
        "gallery",
    )
    assert VC_VIDEO_PROVIDERS == ("youtube", "uploaded")
    assert VC_SPEECH_TYPES == (
        "speech",
        "address",
        "statement",
        "reflection",
        "interview",
    )
    assert VC_SPEECH_VIDEO_ROLES == (
        "primary",
        "full_recording",
        "excerpt",
        "related",
    )


def test_vc_hub_is_unique_for_the_university_scope():
    index = _index(VcHub.__table__, "uq_vc_hubs_university_active")

    assert index.unique is True
    assert [column.name for column in index.columns] == ["scope_type"]
    where = str(index.dialect_options["postgresql"]["where"]).lower()
    assert "scope_id is null" in where
    assert "deleted_at is null" in where


def test_vc_video_enforces_provider_specific_sources():
    constraint = _check(VcVideo.__table__, "ck_vc_videos_provider_source")
    sql = str(constraint.sqltext).lower()

    assert "provider = 'youtube'" in sql
    assert "provider_video_id is not null" in sql
    assert "uploaded_media_id is null" in sql
    assert "provider = 'uploaded'" in sql
    assert "uploaded_media_id is not null" in sql


def test_youtube_provider_identity_is_unique_while_active():
    index = _index(VcVideo.__table__, "uq_vc_videos_youtube_provider_id")

    assert index.unique is True
    assert [column.name for column in index.columns] == [
        "provider",
        "provider_video_id",
    ]
    where = str(index.dialect_options["postgresql"]["where"]).lower()
    assert "provider = 'youtube'" in where
    assert "deleted_at is null" in where


def test_speech_video_relationship_has_one_primary_video_per_speech():
    index = _index(VcSpeechVideo.__table__, "uq_vc_speech_videos_primary")

    assert index.unique is True
    assert [column.name for column in index.columns] == ["speech_id"]
    assert "role = 'primary'" in str(
        index.dialect_options["postgresql"]["where"]
    ).lower()

    speech = VcSpeech(title="Graduation address", slug="graduation-address")
    video = VcVideo(
        title="Graduation recording",
        slug="graduation-recording",
        provider="youtube",
        source_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        provider_video_id="dQw4w9WgXcQ",
        embed_url="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    )
    link = VcSpeechVideo(
        speech=speech,
        video=video,
        role="primary",
        display_order=10,
    )

    assert speech.video_links == [link]
    assert video.speech_links == [link]


def test_vc_placement_requires_one_source_matching_its_section():
    one_source = str(
        _check(
            VcHubPlacement.__table__,
            "ck_vc_hub_placements_one_source",
        ).sqltext
    ).lower()
    matching_source = str(
        _check(
            VcHubPlacement.__table__,
            "ck_vc_hub_placements_section_source",
        ).sqltext
    ).lower()

    assert "num_nonnulls" in one_source
    for column in (
        "news_id",
        "event_id",
        "speech_id",
        "video_id",
        "gallery_album_id",
    ):
        assert column in one_source
        assert column in matching_source
    for section in ("activities", "events", "speeches", "videos", "gallery"):
        assert section in matching_source


def test_hub_owns_ordered_placements_and_gallery_has_media_identity():
    hub = VcHub(title="Meet the Vice Chancellor")
    placement = VcHubPlacement(
        hub=hub,
        section="videos",
        video=VcVideo(
            title="Welcome",
            slug="welcome",
            provider="youtube",
            source_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            provider_video_id="dQw4w9WgXcQ",
            embed_url="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        ),
        display_order=20,
    )
    VcGalleryAlbum(title="Graduation day", slug="graduation-day")

    assert hub.placements == [placement]
    assert placement.video is not None
    assert "cover_media_id" in VcGalleryAlbum.__table__.c


def test_vc_migration_creates_and_drops_all_domain_tables():
    migration = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260721_0035_add_vice_chancellor_hub.py"
    ).read_text(encoding="utf-8")

    assert 'revision = "20260721_0035"' in migration
    assert 'down_revision = "20260720_0034"' in migration
    for table in (
        "vc_videos",
        "vc_hubs",
        "vc_speeches",
        "vc_speech_videos",
        "vc_gallery_albums",
        "vc_hub_placements",
    ):
        assert f'op.create_table(\n        "{table}"' in migration
        assert f'op.drop_table("{table}")' in migration
