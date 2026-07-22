import inspect

from app.seeders import seed_vice_chancellor_hub as vc_hub_seeder
from app.seeders.seed_featured_stories import (
    FEATURED_STORY_SPECS,
    seed_featured_stories,
)
from app.seeders.seed_rbac import COCMS_PERMISSION_NAMES, PERMISSION_SPECS
from app.seeders.seed_runner import run as seed_runner_run
from app.seeders.seed_vice_chancellor_hub import (
    VC_EVENT_SPECS,
    VC_GALLERY_SPECS,
    VC_SPEECH_SPECS,
    VC_VIDEO_SPECS,
    _is_seed_owned,
)


def test_corporate_communication_role_has_vc_content_permissions():
    expected = {"vc_hub.view", "vc_hub.manage", "vc_hub.review", "vc_hub.publish"}
    assert expected.issubset(COCMS_PERMISSION_NAMES)
    assert expected.issubset({spec[0] for spec in PERMISSION_SPECS})


def test_vc_content_seed_defines_complete_editorial_pack():
    assert {item["provider_video_id"] for item in VC_VIDEO_SPECS} == {
        "uLXWUSqegL4",
        "_krrQWU98b4",
    }
    assert len(VC_SPEECH_SPECS) == 2
    assert {item["video_id"] for item in VC_SPEECH_SPECS} <= {
        item["provider_video_id"] for item in VC_VIDEO_SPECS
    }
    assert VC_GALLERY_SPECS
    assert VC_EVENT_SPECS


def test_homepage_seed_defines_four_ordered_official_stories():
    assert len(FEATURED_STORY_SPECS) == 4
    assert [item["homepage_priority"] for item in FEATURED_STORY_SPECS] == [
        10,
        20,
        30,
        40,
    ]
    assert all(item["source_news_slug"] for item in FEATURED_STORY_SPECS)


def test_vc_seed_ownership_marker_is_explicit():
    assert _is_seed_owned(
        {"seed": {"owner": "vc-homepage-content-v1", "version": 1}}
    )
    assert not _is_seed_owned(None)
    assert not _is_seed_owned({"seed": {"owner": "an-editor"}})


def test_vc_hub_seeder_publishes_and_links_the_complete_pack():
    source = inspect.getsource(vc_hub_seeder)
    for required in (
        "VcPortrait",
        "VcSpeechVideo",
        "MediaLink",
        "LEADERSHIP_PORTRAITS",
        "portrait_media_id",
        "workflow_status",
        "published_at",
        "VC_VIDEO_SPECS",
        "VC_SPEECH_SPECS",
        "VC_GALLERY_SPECS",
    ):
        assert required in source


def test_featured_story_specs_have_unique_stable_keys():
    source_slugs = [item["source_news_slug"] for item in FEATURED_STORY_SPECS]
    story_slugs = [item["slug"] for item in FEATURED_STORY_SPECS]
    priorities = [item["homepage_priority"] for item in FEATURED_STORY_SPECS]
    assert len(source_slugs) == len(set(source_slugs))
    assert len(story_slugs) == len(set(story_slugs))
    assert len(priorities) == len(set(priorities))


def test_seed_runner_invokes_featured_stories_after_official_content():
    source = inspect.getsource(seed_runner_run)
    assert source.index("await seed_content(db, ctx)") < source.index(
        "await seed_featured_stories(db, ctx)"
    )
    assert inspect.iscoroutinefunction(seed_featured_stories)
