"""Seed the initial Meet the Vice Chancellor hub and activity placements."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Event,
    Media,
    MediaLink,
    News,
    StaffAssignment,
    VC_SECTIONS,
    VcGalleryAlbum,
    VcHub,
    VcHubPlacement,
    VcPortrait,
    VcSpeech,
    VcSpeechVideo,
    VcVideo,
)

from ._shared import SeedContext
from .seed_leadership_media import LEADERSHIP_PORTRAITS
from .seed_vc_activities import VC_ACTIVITY_SLUGS


VC_SEED_OWNER = "vc-homepage-content-v1"
VC_SEED_VERSION = 1
VC_SEED_NOTE = f"seed:{VC_SEED_OWNER}:v{VC_SEED_VERSION}"
VC_VIDEO_SPECS = (
    {
        "title": "Kisii University Innovation Week 2026",
        "slug": "kisii-university-innovation-week-2026",
        "summary": "Official coverage of Kisii University's showcase of research, creativity, enterprise, and collaborative problem solving.",
        "provider_video_id": "uLXWUSqegL4",
        "source_url": "https://www.youtube.com/watch?v=uLXWUSqegL4",
        "category": "Innovation",
        "recorded_at": datetime(2026, 4, 11, 12, 0, tzinfo=timezone.utc),
    },
    {
        "title": "Kisii University 15th Graduation Ceremony",
        "slug": "kisii-university-15th-graduation-ceremony",
        "summary": "The official livestream of Kisii University's 15th graduation ceremony and celebration of its newest graduates.",
        "provider_video_id": "_krrQWU98b4",
        "source_url": "https://www.youtube.com/watch?v=_krrQWU98b4",
        "category": "Graduation",
        "recorded_at": datetime(2026, 3, 12, 10, 0, tzinfo=timezone.utc),
    },
)
# Where each activity happened. News carries no location column, so the place a
# card prints comes from the placement's editorial_label — the field the studio
# already exposes for exactly this kind of per-card annotation.
VC_ACTIVITY_PLACES = {
    "kmfri-ceo-dr-paul-orina-pays-courtesy-call-to-vice-chancellor": "Main Campus",
    "ksu-vice-chancellor-joins-nyamira-county-governor-to-celebrate-vocational-training-graduates": "Nyamira County",
    "ksu-top-achievers-dinner": "Main Campus",
    "ksu-vc-presides-over-the-aicad-technical-committee-meeting-in-arusha-tanzania": "Arusha, Tanzania",
}
VC_SPEECH_SPECS = (
    {
        "title": "Language education at the centre of Africa's research revival",
        "slug": "language-education-at-the-centre-of-africas-research-revival",
        "speech_type": "address",
        "summary": (
            "At the continental launch of HERI Africa, the Vice-Chancellor set out Kisii University's "
            "role as host of the East Africa Research Chair in Language Education."
        ),
        "plain_text": (
            "Kisii University hosted the official launch of Harnessing Education Research for Impact in "
            "Africa (HERI Africa) on 19 February 2026, an event graced by the Cabinet Secretary for "
            "Education, Hon. Julius Migos Ogamba.\n\n"
            "HERI Africa is a pan-African initiative to revitalise Africa-led, university-based education "
            "research and to raise the continent's share of global education research from about three "
            "per cent today to thirty per cent by 2050. Kisii University hosts the East Africa Research "
            "Chair in Language Education; the Chair in Mathematics Education is hosted at the University "
            "of Embu.\n\n"
            "Addressing delegates, the Vice-Chancellor said the institution “is open to all partners who "
            "are involved in scientific research geared towards the realisation of Vision 2030”, and "
            "urged lecturers to help students “embrace leadership, innovation and research” so that they "
            "are recognised globally and are able to secure work.\n\n"
            "This is an editorial account of the address compiled from published coverage. The full text "
            "will be published here when it is released by the Office of the Vice-Chancellor."
        ),
        "delivered_at": datetime(2026, 2, 19, 9, 0, tzinfo=timezone.utc),
        "venue": "Kisii University, Main Campus",
        "occasion": "Launch of the HERI Africa Programme",
        "audience": "The Cabinet Secretary for Education, university leaders, researchers and partners",
        "video_id": None,
        "is_featured": True,
        "sources": (
            {
                "label": "Kisii University launches HERI Africa programme — Education News",
                "url": "https://educationnews.co.ke/kisii-university-launches-heri-africa-programme-to-boost-research-innovation/",
            },
            {
                "label": "Kisii University ignites Africa's research revolution — Dawan Africa",
                "url": "https://www.dawan.africa/news/kisii-university-ignites-africas-research-revolution-with-heri-launch",
            },
        ),
    },
    {
        "title": "Solutions cannot come from one sector alone",
        "slug": "solutions-cannot-come-from-one-sector-alone",
        "speech_type": "address",
        "summary": (
            "Opening the 3rd International Multi-Disciplinary Conference, the Vice-Chancellor argued for "
            "collaborative research and for judgement, not access, as the real test of artificial intelligence."
        ),
        "plain_text": (
            "Kisii University convened its 3rd International Multi-Disciplinary Conference, drawing "
            "researchers, scholars, policymakers and students from the United States and from West, "
            "Central and East Africa, in person and online. The programme centred on inclusivity and on "
            "collaborative approaches to health and sustainable development, alongside the place of "
            "artificial intelligence and competency-based education in preparing students.\n\n"
            "“Solutions to today's challenges cannot come from one sector alone,” the Vice-Chancellor told "
            "delegates, noting that progress in health depends as much on education, sociology, business "
            "and technology as it does on the health sciences.\n\n"
            "On artificial intelligence he was direct: “The issue is not simply accessing information from "
            "AI, but how we use that information to bring positive and transformative change.”\n\n"
            "He also pressed the case for research capacity — modern laboratories, equipment and trained "
            "personnel — and for partnership between universities, research institutions, government "
            "agencies and development partners, observing that “no single university can adequately "
            "address research challenges alone.”\n\n"
            "This is an editorial account of the address compiled from published coverage. The full text "
            "will be published here when it is released by the Office of the Vice-Chancellor."
        ),
        "delivered_at": datetime(2026, 6, 12, 9, 0, tzinfo=timezone.utc),
        "venue": "Kisii University, Main Campus",
        "occasion": "3rd International Multi-Disciplinary Conference",
        "audience": "Researchers, policymakers and students from across Africa and the United States",
        "video_id": None,
        "is_featured": False,
        "sources": (
            {
                "label": "Kisii University hosts global conference to drive research and innovation — The Mt Kenya Times",
                "url": "https://mountkenyatimes.co.ke/kisii-university-hosts-global-conference-to-drive-research-and-innovation/",
            },
        ),
    },
    {
        "title": "Handing over the site for the Student Village",
        "slug": "handing-over-the-site-for-the-student-village",
        "speech_type": "statement",
        "summary": (
            "Remarks at the handover of the Student Village site to the contractor — 1,680 beds under the "
            "national Affordable Housing Programme."
        ),
        "plain_text": (
            "The Vice-Chancellor handed over the Student Village site to the contractor, opening "
            "construction of a hostel complex designed to accommodate 1,680 students in secured modern "
            "housing with a constant water supply and internet access. Kisii University is the first "
            "university to benefit from the national Affordable Housing Programme.\n\n"
            "The Vice-Chancellor described the project as part of the long-term development plan of the "
            "University, intended both to relieve parents of the cost of renting accommodation off campus "
            "and to make Kisii a credible destination for international students.\n\n"
            "This is an editorial account compiled from published coverage. The date of the ceremony and "
            "the full remarks should be confirmed and completed in VC Studio."
        ),
        "delivered_at": None,
        "venue": "Kisii University, Main Campus",
        "occasion": "Student Village site handover, Affordable Housing Programme",
        "audience": "Contractors, housing officials, students and staff",
        "video_id": None,
        "is_featured": False,
        "sources": (
            {
                "label": "Kisii University hands over site for Affordable Housing Programme — Kenya News Agency",
                "url": "https://www.kenyanews.go.ke/kisii-university-hands-over-site-for-affordable-housing-programme/",
            },
            {
                "label": "Kisii University launches construction of hostel complex — Education News",
                "url": "https://educationnews.co.ke/kisii-university-launches-construction-of-hostel-complex-to-accommodate-1680-students/",
            },
        ),
    },
    {
        "title": "Conferring the Class of 2026",
        # slug kept from the first seed so the published URL does not break
        "slug": "celebrating-the-class-of-2026",
        "speech_type": "address",
        "summary": (
            "The Vice-Chancellor's address at the University's fifteenth graduation ceremony, delivered "
            "before graduands, their families, faculty and guests."
        ),
        "plain_text": (
            "Kisii University held its 15th Graduation Ceremony on 12 March 2026. The Vice-Chancellor, as "
            "chair of Senate, presented the graduands and addressed the congregation before the conferment "
            "of degrees and the award of diplomas and certificates.\n\n"
            "The ceremony was broadcast in full on the University's official channel; the recording is "
            "linked below.\n\n"
            "The approved text of the address will be published here when it is released by the Office of "
            "the Vice-Chancellor."
        ),
        "delivered_at": datetime(2026, 3, 12, 10, 0, tzinfo=timezone.utc),
        "venue": "Chancellor's Pavilion, Kisii University",
        "occasion": "15th Graduation Ceremony",
        "audience": "Graduands, families, faculty, staff and invited guests",
        "video_id": "_krrQWU98b4",
        "is_featured": False,
        "sources": (),
    },
    {
        "title": "Innovation, enterprise and shared progress",
        "slug": "innovation-enterprise-and-shared-progress",
        "speech_type": "reflection",
        "summary": (
            "Opening remarks at Innovation Week 2026, the University's annual showcase of student and "
            "staff research, creativity and enterprise."
        ),
        "plain_text": (
            "Innovation Week 2026 brought student and staff teams, partners and visitors to the Main "
            "Campus for the University's annual showcase of research, creativity, enterprise and "
            "collaborative problem solving. The Vice-Chancellor opened the week and toured the exhibition "
            "with the deans and directors.\n\n"
            "The full session was recorded and is linked below.\n\n"
            "The approved text of the remarks will be published here when it is released by the Office of "
            "the Vice-Chancellor."
        ),
        "delivered_at": datetime(2026, 4, 11, 12, 0, tzinfo=timezone.utc),
        "venue": "Kisii University, Main Campus",
        "occasion": "Innovation Week 2026",
        "audience": "Students, staff, researchers, partners and innovators",
        "video_id": "uLXWUSqegL4",
        "is_featured": False,
        "sources": (),
    },
)
VC_GALLERY_SPECS = (
    {
        "title": "Leadership in action",
        "slug": "leadership-in-action",
        "summary": "Official Kisii University images from recent Vice Chancellor engagements and institutional activities.",
        "source_news_slugs": VC_ACTIVITY_SLUGS,
        "is_featured": True,
    },
)
VC_EVENT_SPECS = (
    {
        "title": "15th Graduation Ceremony — Office of the Vice Chancellor",
        "slug": "vc-15th-graduation-ceremony",
        "summary": (
            "Development event entry connecting the Office of the Vice Chancellor "
            "with official coverage of Kisii University's 15th graduation ceremony."
        ),
        "plain_text": (
            "This development entry curates the University's official 15th graduation "
            "coverage for the Meet the Vice Chancellor experience."
        ),
        "start_date": datetime(2026, 3, 12, 7, 0, tzinfo=timezone.utc),
        "end_date": datetime(2026, 3, 12, 15, 0, tzinfo=timezone.utc),
        "location": "Kisii University",
        "source_url": (
            "https://kisiiuniversity.ac.ke/blog/15th-graduation-ceremony-2026"
        ),
    },
)


def _seed_metadata() -> dict[str, dict[str, object]]:
    return {"seed": {"owner": VC_SEED_OWNER, "version": VC_SEED_VERSION}}


def _is_seed_owned(structured_content: dict | None) -> bool:
    seed = (structured_content or {}).get("seed")
    return isinstance(seed, dict) and seed.get("owner") == VC_SEED_OWNER


def _has_seed_note(record: object) -> bool:
    return getattr(record, "revision_notes", None) == VC_SEED_NOTE


async def _vc_portrait_media_id(
    db: AsyncSession,
    assignment: StaffAssignment,
) -> uuid.UUID | None:
    if assignment.portrait_media_id is not None:
        return assignment.portrait_media_id
    source_path = LEADERSHIP_PORTRAITS["vice_chancellor"]
    public_url = (
        source_path
        if source_path.startswith(("http://", "https://"))
        else f"https://kisiiuniversity.ac.ke{source_path}"
    )
    return (
        await db.execute(
            select(Media.id).where(
                Media.public_url == public_url,
                Media.media_type == "image",
                Media.is_public.is_(True),
                Media.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()


def _publish(record: object, now: datetime) -> None:
    record.scope_type = "university"
    record.scope_id = None
    record.is_main = True
    record.is_public = True
    record.is_published = True
    record.status = "published"
    record.workflow_status = "published"
    record.owner_portal = "corporate_communication"
    record.published_at = getattr(record, "published_at", None) or now
    record.valid_from = getattr(record, "valid_from", None) or now
    record.valid_to = None
    record.approved_at = getattr(record, "approved_at", None) or now
    record.revision_notes = VC_SEED_NOTE


async def _upsert_video(
    db: AsyncSession,
    spec: dict[str, object],
    now: datetime,
) -> VcVideo:
    video = (
        await db.execute(
            select(VcVideo).where(
                VcVideo.provider == "youtube",
                VcVideo.provider_video_id == spec["provider_video_id"],
                VcVideo.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if video is None:
        video = VcVideo(
            provider="youtube",
            provider_video_id=spec["provider_video_id"],
            source_url=spec["source_url"],
            embed_url=(
                "https://www.youtube-nocookie.com/embed/"
                f"{spec['provider_video_id']}"
            ),
            thumbnail_url=f"https://i.ytimg.com/vi/{spec['provider_video_id']}/hqdefault.jpg",
            title=spec["title"],
            slug=spec["slug"],
        )
        db.add(video)
    if _has_seed_note(video) or video.revision_notes is None:
        video.title = str(spec["title"])
        video.slug = str(spec["slug"])
        video.summary = str(spec["summary"])
        video.category = str(spec["category"])
        video.recorded_at = spec["recorded_at"]
        video.is_featured = spec == VC_VIDEO_SPECS[1]
        _publish(video, now)
    await db.flush()
    return video


async def _upsert_speech(
    db: AsyncSession,
    spec: dict[str, object],
    videos: dict[str, VcVideo],
    now: datetime,
) -> VcSpeech:
    speech = (
        await db.execute(select(VcSpeech).where(VcSpeech.slug == spec["slug"]))
    ).scalar_one_or_none()
    if speech is None:
        speech = VcSpeech(title=spec["title"], slug=spec["slug"])
        db.add(speech)
    if _is_seed_owned(speech.structured_content) or speech.structured_content is None:
        speech.title = str(spec["title"])
        speech.summary = str(spec["summary"])
        speech.plain_text = str(spec["plain_text"])
        speech.rich_text = f"<p>{spec['plain_text']}</p>"
        speech.structured_content = _seed_metadata()
        related: list[dict[str, str]] = []
        if spec.get("video_id"):
            related.append(
                {
                    "label": "Official Kisii University video",
                    "url": videos[str(spec["video_id"])].source_url,
                }
            )
        related.extend(dict(source) for source in spec.get("sources") or ())
        speech.related_links = related
        speech.speech_type = str(spec["speech_type"])
        speech.delivered_at = spec["delivered_at"]
        speech.venue = str(spec["venue"])
        speech.occasion = str(spec["occasion"])
        speech.audience = str(spec["audience"])
        speech.is_featured = bool(spec["is_featured"])
        speech.meta_title = str(spec["title"])
        speech.meta_description = str(spec["summary"])
        _publish(speech, now)
    await db.flush()

    if not spec.get("video_id"):
        return speech

    video = videos[str(spec["video_id"])]
    link = (
        await db.execute(
            select(VcSpeechVideo).where(
                VcSpeechVideo.speech_id == speech.id,
                VcSpeechVideo.video_id == video.id,
                VcSpeechVideo.role == "primary",
            )
        )
    ).scalar_one_or_none()
    if link is None:
        link = VcSpeechVideo(
            speech_id=speech.id,
            video_id=video.id,
            role="primary",
            display_order=10,
        )
        db.add(link)
    else:
        link.deleted_at = None
        link.display_order = 10
    await db.flush()
    return speech


async def _upsert_gallery(
    db: AsyncSession,
    spec: dict[str, object],
    news_by_slug: dict[str, News],
    now: datetime,
) -> VcGalleryAlbum | None:
    source_news = [
        news_by_slug[slug]
        for slug in spec["source_news_slugs"]
        if slug in news_by_slug
    ]
    if not source_news:
        return None
    source_links = (
        await db.execute(
            select(MediaLink)
            .where(
                MediaLink.entity_type == "news",
                MediaLink.entity_id.in_([item.id for item in source_news]),
                MediaLink.role.in_(("cover-image", "gallery")),
                MediaLink.deleted_at.is_(None),
                MediaLink.is_public.is_(True),
                MediaLink.is_published.is_(True),
            )
            .order_by(MediaLink.entity_id, MediaLink.display_order)
        )
    ).scalars().all()
    if not source_links:
        return None

    album = (
        await db.execute(
            select(VcGalleryAlbum).where(VcGalleryAlbum.slug == spec["slug"])
        )
    ).scalar_one_or_none()
    if album is None:
        album = VcGalleryAlbum(title=spec["title"], slug=spec["slug"])
        db.add(album)
    if _has_seed_note(album) or album.revision_notes is None:
        album.title = str(spec["title"])
        album.summary = str(spec["summary"])
        album.location = "Kisii University and partner venues"
        album.cover_media_id = source_links[0].media_id
        album.is_featured = bool(spec["is_featured"])
        album.meta_title = str(spec["title"])
        album.meta_description = str(spec["summary"])
        _publish(album, now)
    await db.flush()

    for order, source_link in enumerate(source_links, start=1):
        link = (
            await db.execute(
                select(MediaLink).where(
                    MediaLink.media_id == source_link.media_id,
                    MediaLink.entity_type == "vc_gallery_album",
                    MediaLink.entity_id == album.id,
                    MediaLink.role == "gallery",
                )
            )
        ).scalar_one_or_none()
        if link is None:
            link = MediaLink(
                media_id=source_link.media_id,
                entity_type="vc_gallery_album",
                entity_id=album.id,
                role="gallery",
            )
            db.add(link)
        link.deleted_at = None
        link.display_order = order * 10
        link.is_public = True
        link.is_published = True
        link.status = "published"
        link.workflow_status = "published"
        link.published_at = link.published_at or now
    await db.flush()
    return album


async def _upsert_event(
    db: AsyncSession,
    spec: dict[str, object],
    now: datetime,
) -> Event:
    event = (
        await db.execute(select(Event).where(Event.slug == spec["slug"]))
    ).scalar_one_or_none()
    if event is None:
        event = Event(title=spec["title"], slug=spec["slug"])
        db.add(event)
    if _is_seed_owned(event.structured_content) or event.structured_content is None:
        event.title = str(spec["title"])
        event.summary = str(spec["summary"])
        event.plain_text = str(spec["plain_text"])
        event.rich_text = f"<p>{spec['plain_text']}</p>"
        event.structured_content = {
            **_seed_metadata(),
            "source_url": spec["source_url"],
            "development_fixture": True,
        }
        event.start_date = spec["start_date"]
        event.end_date = spec["end_date"]
        event.location = str(spec["location"])
        event.is_featured = True
        event.meta_title = str(spec["title"])
        event.meta_description = str(spec["summary"])
        _publish(event, now)
    await db.flush()
    return event


async def _ensure_placement(
    db: AsyncSession,
    hub: VcHub,
    *,
    section: str,
    source_id: uuid.UUID,
    display_order: int,
    is_featured: bool = False,
    editorial_label: str | None = None,
) -> None:
    source_fields = {
        "activities": "news_id",
        "events": "event_id",
        "speeches": "speech_id",
        "videos": "video_id",
        "gallery": "gallery_album_id",
    }
    source_field = source_fields[section]
    placement = (
        await db.execute(
            select(VcHubPlacement).where(
                VcHubPlacement.hub_id == hub.id,
                getattr(VcHubPlacement, source_field) == source_id,
            )
        )
    ).scalar_one_or_none()
    if placement is None:
        placement = VcHubPlacement(
            hub_id=hub.id,
            section=section,
            **{source_field: source_id},
        )
        db.add(placement)
    placement.deleted_at = None
    placement.section = section
    placement.display_order = display_order
    placement.is_featured = is_featured
    placement.is_enabled = True
    if editorial_label and not placement.editorial_label:
        placement.editorial_label = editorial_label
    await db.flush()


async def seed_vice_chancellor_hub(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx
    now = datetime.now(timezone.utc)
    hub = (
        await db.execute(
            select(VcHub).where(
                VcHub.scope_type == "university",
                VcHub.scope_id.is_(None),
                VcHub.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if hub is None:
        hub = VcHub(
            scope_type="university",
            scope_id=None,
        )
        db.add(hub)
        await db.flush()

    assignment = (await db.execute(
        select(StaffAssignment).where(
            StaffAssignment.entity_type == "university",
            StaffAssignment.role.in_(("vc", "vice_chancellor")),
            StaffAssignment.status == "active",
            StaffAssignment.is_public.is_(True),
            StaffAssignment.deleted_at.is_(None),
        ).order_by(StaffAssignment.hierarchy_level, StaffAssignment.start_date.desc().nullslast())
    )).scalars().first()
    can_seed_hub = _has_seed_note(hub) or (
        not hub.is_published and not hub.introduction
    )
    if can_seed_hub:
        hub.eyebrow = "Leadership in motion"
        hub.title = "Meet the Vice Chancellor"
        hub.introduction = (
            "Meet the Vice Chancellor through the messages, engagements, ideas, "
            "and moments shaping Kisii University's public mission."
        )
        hub.welcome_title = "Leadership that listens, connects and acts"
        hub.welcome_message = (
            "Explore recent addresses, conversations, institutional activities, "
            "events, and photo stories from the Office of the Vice Chancellor."
        )
        hub.professional_profile_url = "/about/vice-chancellor/profile"
        hub.section_order = [
            "story",
            "activities",
            "speeches",
            "videos",
            "gallery",
            "events",
        ]
        hub.section_visibility = {section: True for section in VC_SECTIONS}
        _publish(hub, now)

    if assignment is not None:
        hub.staff_assignment_id = assignment.id
        portrait_media_id = await _vc_portrait_media_id(db, assignment)
        if portrait_media_id is not None and can_seed_hub:
            hub.hero_media_id = portrait_media_id
            portrait = (
                await db.execute(
                    select(VcPortrait).where(
                        VcPortrait.hub_id == hub.id,
                        VcPortrait.media_id == portrait_media_id,
                    )
                )
            ).scalar_one_or_none()
            if portrait is None:
                portrait = VcPortrait(
                    hub_id=hub.id,
                    media_id=portrait_media_id,
                )
                db.add(portrait)
            portrait.deleted_at = None
            portrait.alt_text = "Vice Chancellor of Kisii University"
            portrait.display_order = 10

    videos = {
        str(spec["provider_video_id"]): await _upsert_video(db, spec, now)
        for spec in VC_VIDEO_SPECS
    }
    speeches = [
        await _upsert_speech(db, spec, videos, now) for spec in VC_SPEECH_SPECS
    ]
    events = [await _upsert_event(db, spec, now) for spec in VC_EVENT_SPECS]

    news_items = (
        await db.execute(
            select(News).where(
                News.slug.in_(VC_ACTIVITY_SLUGS),
                News.deleted_at.is_(None),
            )
        )
    ).scalars().all()
    news_by_slug = {item.slug: item for item in news_items}
    galleries = [
        gallery
        for spec in VC_GALLERY_SPECS
        if (gallery := await _upsert_gallery(db, spec, news_by_slug, now))
        is not None
    ]

    for order, news in enumerate(news_items, start=1):
        await _ensure_placement(
            db,
            hub,
            section="activities",
            source_id=news.id,
            display_order=100 + order * 10,
            is_featured=order == 1,
            editorial_label=VC_ACTIVITY_PLACES.get(news.slug),
        )
    for order, speech in enumerate(speeches, start=1):
        await _ensure_placement(
            db,
            hub,
            section="speeches",
            source_id=speech.id,
            display_order=200 + order * 10,
            is_featured=order == 1,
        )
    for order, video in enumerate(videos.values(), start=1):
        await _ensure_placement(
            db,
            hub,
            section="videos",
            source_id=video.id,
            display_order=300 + order * 10,
            is_featured=order == 1,
        )
    for order, gallery in enumerate(galleries, start=1):
        await _ensure_placement(
            db,
            hub,
            section="gallery",
            source_id=gallery.id,
            display_order=400 + order * 10,
            is_featured=order == 1,
        )
    for order, event in enumerate(events, start=1):
        await _ensure_placement(
            db,
            hub,
            section="events",
            source_id=event.id,
            display_order=500 + order * 10,
            is_featured=order == 1,
        )

    if can_seed_hub:
        hub.welcome_video_id = videos["_krrQWU98b4"].id
    await db.flush()


__all__ = [
    "VC_ACTIVITY_PLACES",
    "VC_EVENT_SPECS",
    "VC_GALLERY_SPECS",
    "VC_SEED_OWNER",
    "VC_SEED_VERSION",
    "VC_SPEECH_SPECS",
    "VC_VIDEO_SPECS",
    "seed_vice_chancellor_hub",
]
