"""Synchronize public lecturer profiles from the Digital Kisii API."""

from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any

import httpx
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Department, Person, PersonWorkExperience, Programme, StaffAssignment
from ..schemas.base import slugify

SOURCE = "digital_kisii"
TRUSTED_DEPARTMENT_SOURCES = frozenset({"", SOURCE, "kisii_main_website"})
PROGRAMME_EXTERNAL_FIELDS = frozenset({"code", "external_source", "external_source_id", "external_name", "level"})
LECTURER_SYNC_FIELDS = frozenset({
    "first_name", "middle_name", "last_name", "full_name", "email",
    "external_source", "external_source_id", "external_avatar_url", "department_id",
})
WORKFLOW_STAGES = (
    "initialize",
    "fetch",
    "clean",
    "synchronize",
    "match",
    "map",
    "persist",
    "present_results",
)


def _date(value: Any) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except ValueError:
        try:
            return date(int(str(value)[:4]), 1, 1)
        except (ValueError, TypeError):
            return None


def _normal(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def _department_key(value: str | None) -> str:
    return re.sub(r"^department\s+of\s+", "", _normal(value))


# External Digital Kisii department labels -> canonical local department keys.
# Keep this mapping centralized so previews, programme imports, and staff syncs
# make the same decision on every run.
DEPARTMENT_ALIASES = {
    "agricultural education extension": "agricultural education and extension",
    "computing": "computing science",
    "computing sciences": "computing science",
    "computer science": "computing science",
    "curriculum instruction and media": "curriculum instruction and media cim",
    "edfo and eape": "educational foundations educational administration planning and economics edfo eape",
    "environment natural resources aquatiic sciences": "environment natural resources applied aquatic sciences",
    "epsc ecde and sne": "educational psychology special needs education early childhood education epsc snes ecde",
    "epsc ecde sne": "educational psychology special needs education early childhood education epsc snes ecde",
    "biochemistry": "medical biochemistry",
    "foods nutrition and dietetics": "food nutrition and dietetics",
    "mathematics acturial science": "mathematics and actuarial sciences",
    "microbiology and parasitology": "medical microbiology and parasitology",
    "microbiology parasitology": "medical microbiology and parasitology",
    "political science and peace studies": "political science peace studies",
    "pharmacology": "clinical pharmacology",
    "tourism hospitality": "tourism and hospitality management",
    "communication media library and information sciences": "communication media and information science comlis",
    "communication media and information sciences": "communication media and information science comlis",
    "library information sciences": "library and information science",
    "history heritage studies": "history heritage",
    "community health behavioural sciences": "community health behavioral sciences",
    "community health behavioral sciences": "community health behavioral sciences",
    "mathematics actuarial science": "mathematics actuarial sciences",
    "accounting finance": "accounting and finance",
    "sociology gender and development studies": "sociology gender development studies",
    # Legacy/abbreviated labels returned by the Digital Kisii catalogue.
    "educational psychology": "educational psychology special needs education early childhood education epsc snes ecde",
    "psychology educationa": "educational psychology special needs education early childhood education epsc snes ecde",
    "special needs education": "educational psychology special needs education early childhood education epsc snes ecde",
    "r": "philosophy and religious studies",
    "human resource strategic co operative management": "human resource and strategic management",
}

# A few rows use a broad/truncated external department label. These mappings
# are intentionally programme-specific and are applied by both preview and
# synchronization; they are not inferred from the programme title at runtime.
PROGRAMME_DEPARTMENT_OVERRIDES = {
    "EDP02": "educational psychology special needs education early childhood education epsc snes ecde",
    "DED16": "educational psychology special needs education early childhood education epsc snes ecde",
    "E17": "educational psychology special needs education early childhood education epsc snes ecde",
    "MED13": "educational psychology special needs education early childhood education epsc snes ecde",
    "FASS11": "philosophy and religious studies",
    "AS06": "sociology gender development studies",
    "ASP11": "political science peace studies",
}

# Verified against the current public response: these repeated codes are
# spelling/format variants of one programme. MAN13 is deliberately excluded
# because the source assigns its two rows to different departments.
SAFE_DUPLICATE_PROGRAMME_CODES = frozenset({
    "AN10", "AS18", "AS19", "CB13", "CCPS", "DAS13", "DAS28", "DCB15",
    "ED15", "HEP06", "INP02", "MAN10", "MAN12", "MPS17", "PS32",
})


def _match_department(departments: dict[str, Department], value: str | None) -> Department | None:
    key = _department_key(value)
    return departments.get(key) or departments.get(DEPARTMENT_ALIASES.get(key, ""))


def _match_programme_department(departments: dict[str, Department], row: dict) -> Department | None:
    code = str(row.get("programme_code") or "").strip()
    override = PROGRAMME_DEPARTMENT_OVERRIDES.get(code)
    if override:
        return departments.get(override)
    return _match_department(departments, str(row.get("department") or ""))


def _programme_duplicate_key(row: dict) -> tuple:
    """Return fields that define equivalent catalogue duplicates."""
    return (
        _normal(str(row.get("name") or "")).replace(" and ", " "),
        _normal(str(row.get("department") or "")),
        _normal(str(row.get("category") or "")),
        _normal(str(row.get("details") or "")),
        _normal(str(row.get("curriculum_overview") or "")),
        _normal(str(row.get("course_prospects") or "")),
    )


async def _programme_source(db, url, school_id=None):
    rows = _clean_rows(await DigitalLecturerSyncService.fetch_programmes(url))
    # Resolve the source's global department names before selecting a school.
    # Duplicate local names are ambiguous, never last-row-wins ownership.
    departments = (await db.execute(select(Department).options(selectinload(Department.school)).where(
        Department.deleted_at.is_(None), Department.is_active.is_(True),
    ))).scalars().all()
    grouped = {}
    for department in departments:
        key = _department_key(department.name)
        grouped.setdefault(DEPARTMENT_ALIASES.get(key, key), []).append(department)
    by_name = {key: values[0] for key, values in grouped.items() if len(values) == 1}
    if school_id is not None:
        scoped = []
        for row in rows:
            department = _match_programme_department(by_name, row)
            if department is not None and str(department.school_id) == str(school_id):
                scoped.append(row)
        rows = scoped
    return rows, by_name


def _clean_rows(rows: list[dict]) -> list[dict]:
    """Drop malformed records and trim string fields before matching/upserting."""
    cleaned = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        cleaned.append({key: value.strip() if isinstance(value, str) else value for key, value in row.items()})
    return cleaned


def _workflow_result(*, fetched: int, cleaned: int, matched: int, mapped: int, persisted: int) -> list[dict[str, Any]]:
    metrics = {"fetch": fetched, "clean": cleaned, "match": matched, "map": mapped, "persist": persisted}
    return [
        {"step": step, "status": "completed", **({"records": metrics[step]} if step in metrics else {})}
        for step in WORKFLOW_STAGES
    ]


def _names(full_name: str) -> tuple[str, str, str | None]:
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0], parts[0], None
    return parts[0], parts[-1], " ".join(parts[1:-1]) or None


def _qualifications(data: dict) -> list[dict]:
    result = []
    for item in data.get("other_qualifications") or []:
        category = item.get("category") or {}
        result.append({
            "degree": category.get("name") or item.get("certificate_awarded") or "Qualification",
            "institution": item.get("institution_attended") or "Unknown institution",
            "year": item.get("year_to") or item.get("year_from"),
            "field": item.get("subjects_studied"),
            "thesis": item.get("thesis"),
            "external_id": item.get("id"),
        })
    return result


def _secondary_education(data: dict) -> list[dict]:
    return [
        {
            "institution": item.get("school"),
            "qualification": item.get("qualification_obtained"),
            "from": item.get("from"),
            "to": item.get("to"),
            "external_id": item.get("id"),
        }
        for item in data.get("secondary_schools") or []
    ]


def _active_items(data: Any) -> list[dict]:
    """Return source child records that have not been soft-deleted."""
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict) and item.get("deleted_at") is None]


def _skills(data: dict) -> list[str]:
    """Convert the source skill records to the Person.skills string list."""
    result: list[str] = []
    for item in _active_items(data.get("skills")):
        value = item.get("name") if isinstance(item, dict) else item
        if not value:
            continue
        for skill in re.split(r"[,;]", str(value)):
            skill = skill.strip()
            if skill and skill not in result:
                result.append(skill)
    return result


def _publications(data: dict) -> list[dict]:
    """Map source publication records to the fields used by local profiles."""
    result = []
    for item in _active_items(data.get("publications")):
        if not isinstance(item, dict) or not item.get("name"):
            continue
        published = item.get("when")
        result.append({
            "external_id": item.get("id"),
            "title": item.get("name"),
            "name": item.get("name"),
            "venue": item.get("where"),
            "date": published,
            "year": str(published)[:4] if published else None,
            "publication_type_id": item.get("publication_type_id"),
            "source": SOURCE,
        })
    return result


def _research_grants(data: dict) -> list[dict]:
    """Map source grant records without persisting source-only audit columns."""
    result = []
    for item in _active_items(data.get("research_grants")):
        if not isinstance(item, dict) or not (item.get("name") or item.get("funding_organization")):
            continue
        result.append({
            "external_id": item.get("id"),
            "title": item.get("name"),
            "funder": item.get("funding_organization"),
            "amount": item.get("amount") or item.get("amount_in_foreign_currency"),
            "amount_in_kenya_shillings": item.get("amout_in_kenya_shillings"),
            "contact": item.get("contact_person"),
            "role": item.get("role"),
            "principal_investigator": item.get("pi"),
            "duration": item.get("duration"),
            "start": item.get("start"),
            "end": item.get("end"),
            "status": item.get("status"),
            "address": item.get("address"),
            "source": SOURCE,
        })
    return result


def _academic_rank(value: Any) -> str | None:
    if not value:
        return None
    normalized = _normal(str(value))
    aliases = {
        "assistant professor": "assistant_lecturer",
        "associate professor": "associate_professor",
        "senior lecturer": "senior_lecturer",
        "assistant lecturer": "assistant_lecturer",
        "tutorial fellow": "tutorial_fellow",
    }
    return aliases.get(normalized, normalized.replace(" ", "_"))


class DigitalLecturerSyncService:
    """Digital Kisii integration workflow for programmes and lecturers.

    Every run follows: initialize -> fetch -> clean -> synchronize -> match
    -> map -> persist -> present_results. Synchronization is idempotent and
    source identifiers are retained for subsequent runs.
    """

    @staticmethod
    async def fetch(url: str) -> list[dict]:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            payload = response.json()
        if not payload.get("status") or not isinstance(payload.get("data"), list):
            raise ValueError("Digital lecturers API returned an invalid payload")
        return payload["data"]

    @staticmethod
    async def fetch_programmes(url: str) -> list[dict]:
        endpoint = url.rstrip("/")
        if not endpoint.lower().endswith("/programmes"):
            endpoint = f"{endpoint}/programmes"
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            response = await client.get(endpoint)
            response.raise_for_status()
            payload = response.json()
        if not payload.get("success") or not isinstance(payload.get("data"), list):
            raise ValueError("Digital programmes API returned an invalid payload")
        return payload["data"]

    @staticmethod
    async def programme_preview(db: AsyncSession, *, url: str, school_id=None) -> dict[str, Any]:
        """Preview programme-to-live-department matching; never writes data."""
        rows, by_name = await _programme_source(db, url, school_id)
        codes: dict[str, list[dict]] = {}
        for row in rows:
            codes.setdefault(str(row.get("programme_code") or "").strip(), []).append(row)
        records = []
        for row in rows:
            code = str(row.get("programme_code") or "").strip()
            external_name = str(row.get("department") or "").strip()
            department = _match_programme_department(by_name, row)
            records.append({
                "name": row.get("name"), "programme_code": code, "category": row.get("category"),
                "external_department": external_name or None,
                "local_department_id": str(department.id) if department else None,
                "local_department_name": department.name if department else None,
                "school_id": str(department.school_id) if department and department.school_id else None,
                "status": "ready" if department and code else ("missing_code" if not code else "unmatched_department"),
                "duplicate_code": len(codes.get(code, [])) > 1 if code else False,
            })
        return {
            "source": SOURCE, "fetched": len(rows), "unique_codes": len([key for key in codes if key]),
            "duplicate_code_count": sum(1 for key, values in codes.items() if key and len(values) > 1),
            "ready_count": sum(item["status"] == "ready" and not item["duplicate_code"] for item in records),
            "unmatched_department_count": sum(item["status"] == "unmatched_department" for item in records),
            "duplicate_record_count": sum(item["duplicate_code"] for item in records),
            # Keep the preview envelope compatible with the synchronization
            # summary cards. Preview never writes, so mutation counts are
            # explicitly zero rather than omitted.
            "created": 0,
            "updated": 0,
            "skipped": sum(item["status"] != "ready" or item["duplicate_code"] for item in records),
            "errors": [],
            "workflow": _workflow_result(fetched=len(rows), cleaned=len(rows), matched=sum(bool(item["local_department_id"]) for item in records), mapped=sum(bool(item["local_department_id"]) for item in records), persisted=0),
            "programmes": records,
        }

    @staticmethod
    async def sync_programmes(db: AsyncSession, *, url: str, school_id=None) -> dict[str, Any]:
        """Upsert externally supplied programme fields without replacing local content."""
        rows, by_name = await _programme_source(db, url, school_id)
        result = {"source": SOURCE, "fetched": len(rows), "created": 0, "updated": 0, "skipped": 0, "errors": [], "unmatched_departments": [], "duplicates": []}
        grouped: dict[str, list[dict]] = {}
        for row in rows:
            code = str(row.get("programme_code") or "").strip()
            grouped.setdefault(code, []).append(row)

        # The source currently repeats several codes with punctuation or
        # spelling-only differences. Pick the richest equivalent row. A code
        # with materially different department/name data is a hard conflict,
        # never last-row-wins.
        candidate_rows: list[dict] = []
        for code, matches in grouped.items():
            if not code:
                candidate_rows.extend(matches)
                continue
            if len(matches) == 1:
                candidate_rows.append(matches[0])
                continue
            result["duplicates"].append(code)
            if code in SAFE_DUPLICATE_PROGRAMME_CODES or len({_programme_duplicate_key(item) for item in matches}) == 1:
                candidate_rows.append(max(matches, key=lambda item: sum(bool(item.get(field)) for field in ("details", "curriculum_overview", "course_prospects", "name"))))
            else:
                result["errors"].append({"programme_code": code, "error": "Conflicting duplicate source rows; synchronization skipped until explicitly reconciled"})
                result["skipped"] += len(matches)

        for row in candidate_rows:
            code = str(row.get("programme_code") or "").strip()
            if not code:
                result["skipped"] += 1
                continue
            try:
                department_name = str(row.get("department") or "").strip()
                department = _match_programme_department(by_name, row)
                if department is None:
                    result["skipped"] += 1
                    result["unmatched_departments"].append(department_name)
                    continue
                programme = (await db.execute(select(Programme).where(Programme.external_source == SOURCE, Programme.external_source_id == code, Programme.deleted_at.is_(None)))).scalar_one_or_none()
                if programme is None:
                    programme = (await db.execute(select(Programme).where(Programme.code == code, Programme.deleted_at.is_(None)))).scalar_one_or_none()
                if programme is not None and programme.department_id != department.id:
                    result["skipped"] += 1
                    result["errors"].append({"programme_code": code, "error": "Department ownership conflict; explicit reconciliation required"})
                    continue
                name = str(row.get("name") or "Programme").strip()
                values = {"name": name, "code": code, "external_source": SOURCE, "external_source_id": code, "external_name": name, "level": str(row.get("category") or "").lower().replace("bachelors", "undergraduate").replace("doctor of pholosophy(phd)", "phd").replace("post graduate diploma", "postgraduate_diploma"), "department_id": department.id}
                for field, source_field in (("about", "details"), ("curriculum_overview", "curriculum_overview"), ("career_prospects", "course_prospects")):
                    if row.get(source_field):
                        values[field] = row[source_field]
                if department.school and department.school.cover_image_id:
                    values["cover_image_id"] = department.school.cover_image_id
                values = {key: value for key, value in values.items() if value is not None and value != ""}
                if programme is None:
                    base_slug = slugify(f"{name}-{code}")
                    slug_exists = await db.scalar(select(Programme.id).where(
                        Programme.slug == base_slug, Programme.deleted_at.is_(None),
                    ))
                    values["slug"] = f"{base_slug}-digital-kisii" if slug_exists else base_slug
                    programme = Programme(**values)
                    db.add(programme)
                    result["created"] += 1
                else:
                    for key, value in values.items():
                        if key in PROGRAMME_EXTERNAL_FIELDS:
                            setattr(programme, key, value)
                    result["updated"] += 1
            except Exception as exc:
                result["errors"].append({"programme_code": code, "error": str(exc)})
        result["duplicates"] = sorted(set(result["duplicates"]))
        result["unmatched_departments"] = sorted(set(x for x in result["unmatched_departments"] if x))
        # The request boundary or worker owns the final commit.  Flush here so
        # generated identifiers and constraint failures are observed while
        # keeping the whole synchronization atomic for the caller.
        await db.flush()
        result["workflow"] = _workflow_result(fetched=len(rows), cleaned=len(rows), matched=len(rows) - len(result["unmatched_departments"]), mapped=result["created"] + result["updated"], persisted=result["created"] + result["updated"])
        return result

    @staticmethod
    async def sync(db: AsyncSession, *, url: str, dry_run: bool = False, school_id=None) -> dict[str, Any]:
        if dry_run:
            # Preview must neither flush pending caller edits nor roll back
            # the caller's transaction. Only read/projection branches run.
            with db.no_autoflush:
                return await DigitalLecturerSyncService._sync(db, url=url, dry_run=True, school_id=school_id)
        return await DigitalLecturerSyncService._sync(db, url=url, school_id=school_id)

    @staticmethod
    async def _sync(db: AsyncSession, *, url: str, dry_run: bool = False, school_id=None) -> dict[str, Any]:
        rows = _clean_rows(await DigitalLecturerSyncService.fetch(url))
        departments = (await db.execute(select(Department).where(Department.deleted_at.is_(None), Department.is_active.is_(True)))).scalars().all()
        external_groups, name_groups = {}, {}
        for department in departments:
            if department.external_source == SOURCE and department.external_source_id:
                external_groups.setdefault(str(department.external_source_id), []).append(department)
            key = _department_key(department.name)
            name_groups.setdefault(DEPARTMENT_ALIASES.get(key, key), []).append(department)
        by_external = {key: items[0] for key, items in external_groups.items() if len(items) == 1}
        by_name = {key: items[0] for key, items in name_groups.items() if len(items) == 1}

        def resolve_department(row):
            data = row.get("department") or {}
            if not isinstance(data, dict):
                return None
            external_id = str(data.get("id"))
            if external_id in external_groups:
                return by_external.get(external_id)
            candidate = _match_department(by_name, data.get("name"))
            if candidate is not None and (candidate.external_source or "") not in TRUSTED_DEPARTMENT_SOURCES:
                return None
            # A source department id can change when the external directory is
            # re-seeded. A unique source-name match remains safe here; the
            # persistence phase refreshes its external_source_id. Ambiguous
            # ids and departments owned by another source are still blocked.
            return candidate

        if school_id is not None:
            rows = [row for row in rows if (department := resolve_department(row)) is not None
                    and str(department.school_id) == str(school_id)]
        result = {"source": SOURCE, "fetched": len(rows), "created": 0, "updated": 0, "work_experience": 0, "unmatched_departments": [], "errors": []}

        # The school portal requests a read-only preview and is subject to a
        # query budget. Resolve all candidate people in one query rather than
        # issuing two person lookups per lecturer. The global sync path keeps
        # its existing lookup behavior for compatibility with its transaction
        # and conflict handling.
        preview_people_by_external: dict[str, Person] = {}
        preview_people_by_email: dict[str, Person] = {}
        if dry_run and school_id is not None and rows:
            emails = [str(row.get("email") or "").strip().lower() for row in rows if row.get("email")]
            candidates = (await db.execute(select(Person).where(
                Person.deleted_at.is_(None),
                or_(
                    Person.external_source == SOURCE,
                    Person.email.in_(emails),
                ),
            ))).scalars().all()
            for candidate in candidates:
                if candidate.external_source == SOURCE and candidate.external_source_id:
                    preview_people_by_external[str(candidate.external_source_id)] = candidate
                if candidate.email:
                    preview_people_by_email[candidate.email.strip().lower()] = candidate

        for row in rows:
            try:
                external_id = str(row["id"])
                first, last, middle = _names(row["name"])
                department_data = row.get("department") or {}
                department = resolve_department(row)
                if department_data and department is None:
                    result["unmatched_departments"].append(department_data.get("name"))
                if dry_run and school_id is not None:
                    person = preview_people_by_external.get(external_id)
                    if person is None:
                        person = preview_people_by_email.get(row["email"].strip().lower())
                else:
                    person = (await db.execute(select(Person).where(Person.external_source == SOURCE, Person.external_source_id == external_id, Person.deleted_at.is_(None)))).scalar_one_or_none()
                    if person is None:
                        person = (await db.execute(select(Person).where(Person.email == row["email"], Person.deleted_at.is_(None)))).scalar_one_or_none()
                if person is not None and (person.external_source not in (None, "", SOURCE)
                    or (person.external_source == SOURCE and str(person.external_source_id) != external_id)):
                    result["errors"].append({"external_id": external_id, "error": "Profile ownership or source conflict; explicit reconciliation required"})
                    continue
                if person is not None and department is not None and person.department_id != department.id:
                    result["errors"].append({"external_id": external_id, "error": "Department ownership conflict; explicit reconciliation required"})
                    continue
                values = {
                    "first_name": first, "middle_name": middle, "last_name": last, "full_name": row["name"],
                    "email": row["email"].strip().lower(), "external_source": SOURCE, "external_source_id": external_id,
                    "external_avatar_url": row.get("avatar"),
                    "bio": (row.get("personal_details") or {}).get("biography"),
                    "full_bio": (row.get("personal_details") or {}).get("biography"),
                    "qualifications": _qualifications(row.get("education") or {}) or None,
                    "education_background": _secondary_education(row.get("education") or {}) or None,
                    "research_interests": [x.get("name") for x in _active_items(row.get("research_interests")) if x.get("name")],
                    "skills": _skills(row) or None,
                    "publication_records": _publications(row) or None,
                    "research_grants_won": _research_grants(row) or None,
                    "publications_count": len(_publications(row)),
                    "academic_rank": _academic_rank(row.get("current_position")),
                    # Department is optional on Person. Preserve an existing
                    # local department when the source has no safe match, but
                    # leave new/unassigned people without a guessed owner.
                    "department_id": department.id if department else None,
                }
                if dry_run:
                    result["created" if person is None else "updated"] += 1
                    for experience in row.get("work_experience") or []:
                        # A preview reports source work-experience records
                        # available to synchronize. Existing rows are checked
                        # during the protected persist path; avoiding a query
                        # per item keeps the school preview within its budget.
                        result["work_experience"] += 1
                    continue
                if department and department_data.get("id") is not None:
                    department.external_source = SOURCE
                    department.external_source_id = str(department_data["id"])
                    department.external_name = department_data.get("name")
                if person is None:
                    values["is_active"] = True
                    values["is_public"] = False
                    person = Person(**values)
                    db.add(person)
                    await db.flush()
                    result["created"] += 1
                else:
                    for key, value in values.items():
                        if key in LECTURER_SYNC_FIELDS and value is not None and value != []:
                            setattr(person, key, value)
                    result["updated"] += 1
                if department:
                    assignment = (await db.execute(select(StaffAssignment).where(StaffAssignment.person_id == person.id, StaffAssignment.external_source == SOURCE, StaffAssignment.external_source_id == external_id, StaffAssignment.deleted_at.is_(None)))).scalar_one_or_none()
                    if assignment is None:
                        db.add(StaffAssignment(person_id=person.id, entity_type="department", entity_id=department.id, role="lecturer", title="Lecturer", hierarchy_level=10, is_primary=True, is_public=False, status="active", external_source=SOURCE, external_source_id=external_id))
                for experience in row.get("work_experience") or []:
                    source_exp_id = str(experience.get("id")) if experience.get("id") is not None else None
                    query = select(PersonWorkExperience).where(PersonWorkExperience.person_id == person.id, PersonWorkExperience.external_source == SOURCE, PersonWorkExperience.external_source_id == source_exp_id, PersonWorkExperience.deleted_at.is_(None))
                    item = (await db.execute(query)).scalar_one_or_none() if source_exp_id else None
                    values_exp = {"person_id": person.id, "external_source": SOURCE, "external_source_id": source_exp_id, "organization": experience.get("organization") or "Unknown organization", "designation": experience.get("designation"), "assignment": experience.get("assignment"), "start_date": _date(experience.get("year_from")), "end_date": _date(experience.get("year_to")), "source_status": experience.get("status")}
                    if item is None:
                        db.add(PersonWorkExperience(**values_exp))
                        result["work_experience"] += 1
                    else:
                        for key, value in values_exp.items():
                            if key != "person_id" and value is not None and value != []:
                                setattr(item, key, value)
            except Exception as exc:
                result["errors"].append({"external_id": row.get("id"), "error": str(exc)})
        if not dry_run:
            # The request boundary or worker owns the final commit.
            await db.flush()
        result["unmatched_departments"] = sorted(set(x for x in result["unmatched_departments"] if x))
        result["workflow"] = _workflow_result(fetched=len(rows), cleaned=len(rows), matched=len(rows) - len(result["unmatched_departments"]), mapped=result["created"] + result["updated"], persisted=0 if dry_run else result["created"] + result["updated"])
        return result

    @staticmethod
    async def completeness(db: AsyncSession, *, url: str) -> dict[str, Any]:
        """Report source completeness and local synchronization coverage without writes."""
        rows = await DigitalLecturerSyncService.fetch(url)
        people = (await db.execute(select(Person).where(Person.external_source == SOURCE, Person.deleted_at.is_(None)))).scalars().all()
        by_external = {str(item.external_source_id): item for item in people if item.external_source_id}
        by_email = {item.email.lower(): item for item in people}
        fields = {
            "identity": lambda r: bool(r.get("name") and r.get("email")),
            "avatar": lambda r: bool(r.get("avatar")),
            "department": lambda r: bool(r.get("department")),
            "biography": lambda r: bool((r.get("personal_details") or {}).get("biography")),
            "education": lambda r: bool((r.get("education") or {}).get("other_qualifications") or (r.get("education") or {}).get("secondary_schools")),
            "work_experience": lambda r: bool(r.get("work_experience")),
            "publications": lambda r: bool(r.get("publications")),
            "research_grants": lambda r: bool(r.get("research_grants")),
            "research_interests": lambda r: bool(r.get("research_interests")),
            "skills": lambda r: bool(r.get("skills")),
        }
        local_fields = {
            "identity": lambda p: bool(p and p.full_name and p.email),
            "avatar": lambda p: bool(p and (p.photo_id or p.external_avatar_url)),
            "department": lambda p: bool(p and p.department_id),
            "biography": lambda p: bool(p and (p.bio or p.full_bio)),
            "education": lambda p: bool(p and p.qualifications),
            "work_experience": lambda p: bool(p and p.work_experience),
            "publications": lambda p: bool(p and p.publication_records),
            "research_grants": lambda p: bool(p and p.research_grants_won),
            "research_interests": lambda p: bool(p and p.research_interests),
            "skills": lambda p: bool(p and p.skills),
        }
        totals = {key: 0 for key in fields}
        records = []
        for row in rows:
            source_status = {key: bool(check(row)) for key, check in fields.items()}
            for key, populated in source_status.items():
                totals[key] += int(populated)
            person = by_external.get(str(row.get("id"))) or by_email.get(str(row.get("email", "")).lower())
            local_status = {key: bool(check(person)) for key, check in local_fields.items()}
            source_score = round(sum(source_status.values()) / len(fields) * 100, 1)
            local_score = round(sum(local_status.values()) / len(fields) * 100, 1)
            records.append({
                "external_id": row.get("id"), "name": row.get("name"), "email": row.get("email"),
                "external_department_id": (row.get("department") or {}).get("id"),
                "external_department_name": (row.get("department") or {}).get("name"),
                "source_profile_percentage": source_score, "local_profile_percentage": local_score,
                "local_record_exists": person is not None,
                "source_record_exists": str(row.get("id")) in by_external,
                "source_fields": source_status, "local_fields": local_status,
                "missing_source_fields": [key for key, value in source_status.items() if not value],
                "missing_local_fields": [key for key, value in local_status.items() if not value],
            })
        count = len(rows) or 1
        return {
            "source": SOURCE, "fetched": len(rows),
            "average_source_profile_percentage": round(sum(item["source_profile_percentage"] for item in records) / count, 1),
            "average_local_profile_percentage": round(sum(item["local_profile_percentage"] for item in records) / count, 1),
            "locally_matched": sum(item["source_record_exists"] for item in records),
            "email_only_matches": sum(item["local_record_exists"] and not item["source_record_exists"] for item in records),
            "field_coverage": {key: {"populated": value, "total": len(rows), "percentage": round(value / count * 100, 1)} for key, value in totals.items()},
            "lecturers": records,
        }

    @staticmethod
    async def department_stats(db: AsyncSession, *, url: str) -> dict[str, Any]:
        """Aggregate lecturer completeness by source department without writing data."""
        report = await DigitalLecturerSyncService.completeness(db, url=url)
        departments = (await db.execute(select(Department).where(Department.deleted_at.is_(None)))).scalars().all()
        by_external = {str(item.external_source_id): item for item in departments if item.external_source == SOURCE and item.external_source_id}
        by_name = {_department_key(item.name): item for item in departments}
        groups: dict[str, list[dict]] = {}
        for lecturer in report["lecturers"]:
            key = str(lecturer["external_department_id"]) if lecturer["external_department_id"] is not None else "unassigned"
            groups.setdefault(key, []).append(lecturer)
        result = []
        for key, lecturers in groups.items():
            source_name = next((item["external_department_name"] for item in lecturers if item["external_department_name"]), None)
            department = by_external.get(key) or _match_department(by_name, source_name) if source_name else None
            result.append({
                "external_department_id": None if key == "unassigned" else key,
                "external_department_name": source_name or "Unassigned department",
                "local_department_id": str(department.id) if department else None,
                "local_department_name": department.name if department else None,
                "department_type": department.department_type if department else None,
                "lecturer_count": len(lecturers),
                "matched_local_lecturers": sum(item["local_record_exists"] for item in lecturers),
                "average_source_profile_percentage": round(sum(item["source_profile_percentage"] for item in lecturers) / len(lecturers), 1),
                "average_local_profile_percentage": round(sum(item["local_profile_percentage"] for item in lecturers) / len(lecturers), 1),
                "missing_department_mapping": department is None and key != "unassigned",
            })
        result.sort(key=lambda item: (-item["lecturer_count"], item["external_department_name"]))
        return {"source": SOURCE, "departments": result, "department_count": len(result), "unassigned_lecturer_count": len(groups.get("unassigned", []))}
