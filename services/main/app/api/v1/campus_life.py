"""Public composition endpoint for the Life Around Studies experience."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...models import (
    Accommodation,
    ArtsCulture,
    Club,
    ClubActivity,
    ContactDirectory,
    FAQ,
    SportsFacility,
    StudentGovernance,
)
from ...services import HomepageCompositionService

router = APIRouter()


def _media_payload(media: Any | None) -> dict[str, Any] | None:
    if media is None:
        return None
    return {
        "id": str(media.id),
        "url": media.url,
        "public_url": media.public_url,
        "cdn_url": media.cdn_url,
        "thumbnail_url": media.thumbnail_url,
        "alt_text": media.alt_text,
        "title": media.title,
        "caption": media.caption,
    }


def _record_payload(record: Any, *, href_prefix: str, description: str | None = None) -> dict[str, Any]:
    slug = getattr(record, "slug", None)
    payload = {
        "id": str(record.id),
        "name": getattr(record, "name", None) or getattr(record, "title", None),
        "slug": slug,
        "href": f"{href_prefix}/{slug}" if slug else None,
        "description": description
        or getattr(record, "about", None)
        or getattr(record, "mission", None)
        or getattr(record, "mandate", None),
        "is_active": getattr(record, "is_active", True),
    }
    for key in (
        "club_type",
        "membership_count",
        "meeting_schedule",
        "facility_type",
        "sport_types",
        "location",
        "accommodation_type",
        "gender",
        "capacity",
        "is_accepting_applications",
        "category",
        "acronym",
        "governance_type",
        "term_start",
        "term_end",
    ):
        if hasattr(record, key):
            payload[key] = getattr(record, key)
    if hasattr(record, "cover_image"):
        payload["cover_image"] = _media_payload(record.cover_image)
    return payload


async def _count(db: DbSession, model: Any, *conditions: Any) -> int:
    result = await db.execute(select(func.count()).select_from(model).where(*conditions))
    return int(result.scalar_one() or 0)


@router.get("/homepage")
@cached_public(timeout=180, vary_on=("audience",))
async def get_life_around_studies_homepage(
    db: DbSession,
    audience: str = "all",
):
    """Return the editorial composition plus live student-life highlights."""
    now = datetime.now(timezone.utc)
    composition = await HomepageCompositionService.compose(db, "homepage", "university")
    section = next(
        (
            item
            for item in composition["sections"]
            if item.get("section_key") == "campus-life"
        ),
        None,
    )
    if section is None:
        section = {
            "section_key": "campus-life",
            "title": "Life Around Studies",
            "subtitle": "Life around studies",
            "description": None,
            "items": [],
        }
    else:
        section = dict(section)
        section["items"] = [
            item
            for item in section.get("items", [])
            if item.get("is_enabled", True)
            and item.get("audience", "all") in {"all", audience}
        ]

    clubs = (
        await db.execute(
            select(Club)
            .options(selectinload(Club.cover_image))
            .where(Club.is_active.is_(True), Club.is_public.is_(True))
            .order_by(Club.display_order.asc(), Club.name.asc())
            .limit(6)
        )
    ).scalars().all()
    sports = (
        await db.execute(
            select(SportsFacility)
            .options(selectinload(SportsFacility.cover_image))
            .where(SportsFacility.is_active.is_(True))
            .order_by(SportsFacility.name.asc())
            .limit(4)
        )
    ).scalars().all()
    accommodation = (
        await db.execute(
            select(Accommodation)
            .options(selectinload(Accommodation.cover_image))
            .where(Accommodation.is_active.is_(True))
            .order_by(Accommodation.name.asc())
            .limit(4)
        )
    ).scalars().all()
    arts = (
        await db.execute(
            select(ArtsCulture)
            .options(selectinload(ArtsCulture.cover_image))
            .where(ArtsCulture.is_active.is_(True))
            .order_by(ArtsCulture.title.asc())
            .limit(4)
        )
    ).scalars().all()
    governance = (
        await db.execute(
            select(StudentGovernance)
            .where(StudentGovernance.is_active.is_(True))
            .order_by(StudentGovernance.name.asc())
            .limit(4)
        )
    ).scalars().all()
    activities = (
        await db.execute(
            select(ClubActivity)
            .options(selectinload(ClubActivity.club), selectinload(ClubActivity.cover_image))
            .where(
                ClubActivity.is_public.is_(True),
                ClubActivity.is_published.is_(True),
                ClubActivity.archived_at.is_(None),
                ClubActivity.start_datetime >= now,
            )
            .order_by(ClubActivity.start_datetime.asc())
            .limit(6)
        )
    ).scalars().all()
    faqs = (
        await db.execute(
            select(FAQ)
            .where(FAQ.scope_type == "student_life", FAQ.is_public.is_(True), FAQ.status == "published")
            .order_by(FAQ.display_order.asc())
            .limit(8)
        )
    ).scalars().all()
    contacts = (
        await db.execute(
            select(ContactDirectory)
            .where(ContactDirectory.scope_type == "student_life", ContactDirectory.is_public.is_(True), ContactDirectory.status == "active")
            .order_by(ContactDirectory.is_main.desc(), ContactDirectory.name.asc())
            .limit(8)
        )
    ).scalars().all()

    return success(
        data={
            "section": section,
            "stats": {
                "clubs": await _count(db, Club, Club.is_active.is_(True), Club.is_public.is_(True)),
                "sports": await _count(db, SportsFacility, SportsFacility.is_active.is_(True)),
                "accommodation": await _count(db, Accommodation, Accommodation.is_active.is_(True)),
                "arts": await _count(db, ArtsCulture, ArtsCulture.is_active.is_(True)),
                "governance": await _count(db, StudentGovernance, StudentGovernance.is_active.is_(True)),
            },
            "clubs": [_record_payload(item, href_prefix="/campus-life/clubs") for item in clubs],
            "sports": [_record_payload(item, href_prefix="/campus-life/sports") for item in sports],
            "accommodation": [_record_payload(item, href_prefix="/campus-life/accommodation") for item in accommodation],
            "arts": [_record_payload(item, href_prefix="/campus-life/gallery") for item in arts],
            "governance": [_record_payload(item, href_prefix="/campus-life/student-life") for item in governance],
            "activities": [
                {
                    "id": str(item.id),
                    "title": item.title,
                    "description": item.description,
                    "activity_type": item.activity_type,
                    "start_datetime": item.start_datetime,
                    "end_datetime": item.end_datetime,
                    "location": item.location,
                    "club": {"id": str(item.club.id), "name": item.club.name} if item.club else None,
                    "cover_image": _media_payload(item.cover_image),
                }
                for item in activities
            ],
            "faqs": [
                {"id": str(item.id), "question": item.question, "answer": item.answer_plain_text, "category": item.category}
                for item in faqs
            ],
            "contacts": [
                {"id": str(item.id), "name": item.name, "contact_type": item.contact_type, "email": item.email, "phone": item.phone, "building": item.building, "room_number": item.room_number}
                for item in contacts
            ],
        }
    )
