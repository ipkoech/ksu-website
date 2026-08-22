"""Seed official staff profiles crawled from the public Kisii University site."""

from __future__ import annotations

import hashlib
import mimetypes
import re
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Department, Media, Person, StaffAssignment
from app.schemas.base import slugify

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person
from .live_staff_profile_snapshot import LIVE_STAFF_PROFILE_PAGES
from .live_staff_profile_updates_20260810 import LIVE_STAFF_PROFILE_UPDATES

TITLE_PATTERN = re.compile(r"^(Prof\. Dr\.|Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.|Miss\.)\s+", re.IGNORECASE)
SUFFIX_PATTERN = re.compile(r",?\s*(PhD|PHD|MSc|MBA|CPA|CPS)\.?$", re.IGNORECASE)
LOWERCASE_NAME_PARTICLES = {"de", "del", "da", "di", "du", "la", "le", "van", "von", "wa"}

SCHOOL_DEAN_PROFILE_KEYS = {
    "/profile_view/dr-caleb-n-akuku": "dean_business",
    "/profile_view/dr-charles-otuke-moitui": "dean_law",
    "/profile_view/dr-judith-achieng-odhiambo": "dean_agriculture",
    "/profile_view/dr-peter-nyansera-otieno": "dean_arts",
    "/profile_view/dr-raymond-oigara": "dean_health",
    "/profile_view/dr-robert-karieko-obogi": "dean_pure_sciences",
    "/profile_view/jane-cherono-maina": "dean_ist",
    "/profile_view/sr-drjustina-ndaita": "dean_education",
}
SCHOOL_DEAN_LEADERSHIP_KEYS = frozenset(SCHOOL_DEAN_PROFILE_KEYS.values())
SCHOOL_DEAN_INSTITUTIONAL_ROLES = frozenset(
    str(LEADERSHIP_PEOPLE[key]["institutional_role"])
    for key in SCHOOL_DEAN_LEADERSHIP_KEYS
)
DEAN_STUDENTS_INSTITUTIONAL_ROLE = str(LEADERSHIP_PEOPLE["dean_students"]["institutional_role"])


def _normalize_name_token(token: str) -> str:
    if not token:
        return token
    if len(token.rstrip(".")) == 1:
        return token.upper()
    if token.lower() in LOWERCASE_NAME_PARTICLES:
        return token.lower()
    return "-".join(part[:1].upper() + part[1:].lower() for part in token.split("-") if part)


def _normalize_profile_full_name(full_name: str) -> str:
    """Convert all-caps scraped profile names to readable display casing."""

    if not full_name or full_name != full_name.upper():
        return full_name
    return " ".join(_normalize_name_token(token) for token in full_name.split())


def _profile_name(spec: dict[str, Any]) -> str:
    for heading in spec.get("headings") or []:
        text = str(heading.get("text") or "").strip()
        if heading.get("level") == "h2" and text and text != "Search Kisii University:":
            return text
    return str(spec["path"]).rsplit("/", 1)[-1].replace("-", " ").title()


def _profile_body(spec: dict[str, Any], display_name: str) -> str:
    text = str(spec.get("plain_text") or "")
    start = text.find(display_name)
    if start >= 0:
        text = text[start:]
    footer = text.find(" mode_comment close")
    if footer >= 0:
        text = text[:footer]
    return " ".join(text.split())


def _split_title(display_name: str) -> tuple[str | None, str, str | None]:
    title = None
    name = display_name.strip()
    title_match = TITLE_PATTERN.match(name)
    if title_match:
        title = title_match.group(1)
        name = name[title_match.end() :].strip()

    suffix = None
    suffix_match = SUFFIX_PATTERN.search(name)
    if suffix_match:
        suffix = suffix_match.group(1).upper().replace("PHD", "PhD")
        name = SUFFIX_PATTERN.sub("", name).strip()
    return title, _normalize_profile_full_name(name), suffix


def _between(text: str, start_marker: str, end_markers: tuple[str, ...]) -> str | None:
    start = text.find(start_marker)
    if start < 0:
        return None
    start += len(start_marker)
    end_positions = [text.find(marker, start) for marker in end_markers]
    end_positions = [position for position in end_positions if position >= 0]
    end = min(end_positions) if end_positions else len(text)
    value = " ".join(text[start:end].split()).strip()
    return value or None


def _role_from_body(body: str, display_name: str) -> str | None:
    start = len(display_name)
    end = body.find(" Biography", start)
    if end < 0:
        return None
    role = " ".join(body[start:end].split()).strip(" -")
    return role or None


def _clean_list_value(value: str | None, empty_markers: tuple[str, ...]) -> list[str] | None:
    if not value:
        return None
    lowered = value.lower().strip(".")
    if any(lowered == marker.lower().strip(".") for marker in empty_markers):
        return None
    items = [item.strip(" .") for item in re.split(r";|\n|\s{2,}", value) if item.strip(" .")]
    return items or [value]


def _institutional_role(official_role: str | None) -> str | None:
    if not official_role:
        return None
    normalized = official_role.lower()
    if "deputy vice chancellor" in normalized or normalized.startswith("dvc"):
        return "dvc"
    if "c.o.d" in normalized or "cod" in normalized or "head of department" in normalized:
        return "hod"
    if "dean" in normalized:
        return "dean"
    if "director" in normalized:
        return "director"
    if "registrar" in normalized:
        return "registrar"
    return None


def _publications_count(value: str | None) -> int:
    if not value or value.lower().strip(".") == "no publications available":
        return 0
    return len([item for item in re.split(r";|\n", value) if item.strip()])


def _raw_records(value: str | None, empty_markers: tuple[str, ...]) -> list[dict[str, Any]] | None:
    if not value:
        return None
    lowered = value.lower().strip(".")
    if any(lowered == marker.lower().strip(".") for marker in empty_markers):
        return None
    items = [item.strip(" .") for item in re.split(r";|\n", value) if item.strip(" .")]
    return [{"title": item, "source": "official_profile"} for item in (items or [value])]


def _department_from_role(role: str | None, departments: dict[str, Department]) -> Department | None:
    if not role or "," not in role:
        return None
    unit = role.split(",", 1)[1].strip()
    if not unit:
        return None
    unit_slug = slugify(unit)
    for department in departments.values():
        if slugify(department.name) == unit_slug:
            return department
    for department in departments.values():
        department_slug = slugify(department.name)
        if unit_slug in department_slug or department_slug in unit_slug:
            return department
    return None


def _profile_spec(page: dict[str, Any]) -> dict[str, Any]:
    display_name = _profile_name(page)
    title, full_name, suffix = _split_title(display_name)
    body = _profile_body(page, display_name)
    official_role = _role_from_body(body, display_name)

    research_text = _between(body, "Research Interests", ("Education Background", "Work Experience", "Publications"))
    education_text = _between(body, "Education Background", ("Work Experience", "Publications", "Research Grants"))
    work_text = _between(body, "Work Experience", ("Publications", "Research Grants", "Skills"))
    publications_text = _between(body, "Publications", ("Research Grants", "Skills"))
    grants_text = _between(body, "Research Grants", ("Skills",))
    skills_text = _between(body, "Skills", ())

    qualifications = [{"credential": suffix, "source": "official_profile"}] if suffix else None
    education_background = None
    if education_text and education_text.lower().strip(".") != "no education records":
        education_background = [{"raw": education_text, "source": "official_profile"}]
    professional_memberships = None
    if work_text and work_text.lower().strip(".") != "no work experience":
        professional_memberships = [{"type": "work_experience", "raw": work_text, "source": "official_profile"}]

    photo_url = next(
        (
            str(image.get("url"))
            for image in page.get("images") or []
            if image.get("url")
            and "default-avatar" not in str(image.get("url"))
            and "/logo/" not in str(image.get("url"))
        ),
        None,
    )

    return {
        "source_path": page["path"],
        "source_url": page["source_url"],
        "display_name": display_name,
        "title": title,
        "full_name": full_name,
        "official_role": official_role,
        "bio": official_role,
        "full_bio": body,
        "qualifications": qualifications,
        "education_background": education_background,
        "professional_memberships": professional_memberships,
        "research_interests": _clean_list_value(research_text, ("No research interests provided",)),
        "teaching_areas": _clean_list_value(skills_text, ("No skills listed",)),
        "publications_count": _publications_count(publications_text),
        "publication_records": _raw_records(publications_text, ("No publications available",)),
        "research_grants_won": _raw_records(grants_text, ("No research grants", "N/A")),
        "institutional_role": _institutional_role(official_role),
        "specialization": official_role,
        "website_url": page["source_url"],
        "photo_url": photo_url,
        "is_researcher": bool(
            research_text
            and research_text.lower().strip(".") != "no research interests provided"
            or publications_text
            and publications_text.lower().strip(".") != "no publications available"
            or grants_text
            and grants_text.lower().strip(".") != "no research grants"
        ),
        "show_on_directory": True,
    }


_PROFILE_PAGES_BY_SOURCE = {
    str(page["source_url"]): page
    for page in [*LIVE_STAFF_PROFILE_PAGES, *LIVE_STAFF_PROFILE_UPDATES]
}

LIVE_STAFF_PROFILE_SPECS = [
    _profile_spec(page)
    for page in _PROFILE_PAGES_BY_SOURCE.values()
    if page["page_type"] == "profile" and str(page["path"]).startswith("/profile_view/")
]


async def _upsert_profile_photo(db: AsyncSession, spec: dict[str, Any]) -> Media | None:
    public_url = spec.get("photo_url")
    if not public_url:
        return None
    media = (await db.execute(select(Media).where(Media.public_url == public_url))).scalar_one_or_none()
    filename = str(public_url).rstrip("/").rsplit("/", 1)[-1]
    mime_type, _ = mimetypes.guess_type(filename)
    payload = {
        "filename": filename,
        "original_filename": filename,
        "mime_type": mime_type or "image/jpeg",
        "file_size": 0,
        "file_hash": hashlib.sha256(str(public_url).encode("utf-8")).hexdigest(),
        "storage_provider": "remote",
        "storage_path": str(public_url),
        "public_url": str(public_url),
        "title": f"Portrait of {spec['full_name']}",
        "alt_text": f"Portrait of {spec['full_name']}",
        "description": f"Official staff portrait published on {spec['source_url']}.",
        "tags": ["staff", "portrait", "official-profile"],
        "credit": "Kisii University",
        "media_type": "image",
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {"source_url": spec["source_url"], "verified_on": "2026-08-10"},
    }
    if media is None:
        media = Media(**payload)
        db.add(media)
    else:
        for field_name, value in payload.items():
            setattr(media, field_name, value)
    await db.flush()
    return media


async def seed_staff_profiles(db: AsyncSession, ctx: SeedContext) -> None:
    for spec in LIVE_STAFF_PROFILE_SPECS:
        leadership_key = SCHOOL_DEAN_PROFILE_KEYS.get(spec["source_path"])
        if leadership_key:
            person = ctx.people.get(leadership_key)
            if person is None:
                person = await get_or_create_person(db, ctx, leadership_key, **LEADERSHIP_PEOPLE[leadership_key])
        else:
            person = await get_or_create_person(
                db,
                ctx,
                f"live_profile:{slugify(spec['source_path'])}",
                full_name=spec["full_name"],
                title=spec["title"],
                bio=spec["bio"],
                qualifications=spec["qualifications"],
                academic_rank=None,
                specialization=spec["specialization"],
                research_interests=spec["research_interests"],
                institutional_role=spec["institutional_role"],
                is_researcher=spec["is_researcher"],
            )
        department = _department_from_role(spec["official_role"], ctx.departments)
        photo = await _upsert_profile_photo(db, spec)
        person.department_id = department.id if department else person.department_id
        if photo is not None:
            person.photo_id = photo.id
        person.website_url = spec["website_url"]
        person.full_bio = spec["full_bio"]
        person.education_background = spec["education_background"]
        person.professional_memberships = spec["professional_memberships"]
        person.teaching_areas = spec["teaching_areas"]
        person.publications_count = spec["publications_count"]
        person.publication_records = spec["publication_records"]
        person.research_grants_won = spec["research_grants_won"]
        person.show_on_directory = spec["show_on_directory"]
        person.is_public = True
        await db.flush()
    await delete_unassigned_legacy_dean_profiles(db, ctx)


async def delete_unassigned_legacy_dean_profiles(db: AsyncSession, ctx: SeedContext) -> int:
    # Every person held by this run's context is canonical seed input. Some
    # profiles legitimately acquire a dean-like institutional role while the
    # live profile data is merged, so limiting this protection to school-dean
    # keys can delete a person that later assignment steps still reference.
    canonical_ids = {person.id for person in ctx.people.values() if person is not None}
    candidate_roles = {"dean", *SCHOOL_DEAN_INSTITUTIONAL_ROLES}
    if DEAN_STUDENTS_INSTITUTIONAL_ROLE in candidate_roles:
        candidate_roles.remove(DEAN_STUDENTS_INSTITUTIONAL_ROLE)
    has_assignment = (
        select(StaffAssignment.id)
        .where(
            StaffAssignment.person_id == Person.id,
            StaffAssignment.deleted_at.is_(None),
        )
        .exists()
    )
    query = select(Person).where(
        Person.deleted_at.is_(None),
        Person.user_id.is_(None),
        Person.institutional_role.in_(candidate_roles),
        ~has_assignment,
    )
    if canonical_ids:
        query = query.where(Person.id.not_in(canonical_ids))
    result = await db.execute(query)
    people = list(result.scalars().all())
    for person in people:
        await db.delete(person)
    if people:
        await db.flush()
    return len(people)


__all__ = [
    "LIVE_STAFF_PROFILE_SPECS",
    "SCHOOL_DEAN_PROFILE_KEYS",
    "delete_unassigned_legacy_dean_profiles",
    "seed_staff_profiles",
]
