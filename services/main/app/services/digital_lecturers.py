"""Synchronize public lecturer profiles from the Digital Kisii API."""

from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Department, Person, PersonWorkExperience, Programme, StaffAssignment
from ..schemas.base import slugify

SOURCE = "digital_kisii"


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


class DigitalLecturerSyncService:
    """Idempotent lecturer synchronization; missing source values remain nullable."""

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
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            payload = response.json()
        if not payload.get("success") or not isinstance(payload.get("data"), list):
            raise ValueError("Digital programmes API returned an invalid payload")
        return payload["data"]

    @staticmethod
    async def programme_preview(db: AsyncSession, *, url: str) -> dict[str, Any]:
        """Preview programme-to-live-department matching; never writes data."""
        rows = await DigitalLecturerSyncService.fetch_programmes(url)
        departments = (await db.execute(select(Department).options(selectinload(Department.school)).where(Department.deleted_at.is_(None)))).scalars().all()
        by_name = {_department_key(item.name): item for item in departments}
        codes: dict[str, list[dict]] = {}
        for row in rows:
            codes.setdefault(str(row.get("programme_code") or "").strip(), []).append(row)
        aliases = {
            "computing": "computing science", "history heritage studies": "history heritage",
            "community health behavioral sciences": "community health behavioral sciences",
            "community health behavioural sciences": "community health behavioral sciences",
            "mathematics actuarial science": "mathematics actuarial sciences",
            "accounting finance": "accounting and finance",
        }
        records = []
        for row in rows:
            code = str(row.get("programme_code") or "").strip()
            external_name = str(row.get("department") or "").strip()
            key = _department_key(external_name)
            department = by_name.get(key) or by_name.get(aliases.get(key, ""))
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
            "programmes": records,
        }

    @staticmethod
    async def sync_programmes(db: AsyncSession, *, url: str) -> dict[str, Any]:
        """Upsert externally supplied programme fields without replacing local content."""
        rows = await DigitalLecturerSyncService.fetch_programmes(url)
        departments = (await db.execute(select(Department).where(Department.deleted_at.is_(None)))).scalars().all()
        by_name = {_department_key(item.name): item for item in departments}
        aliases = {"computing": "computing science", "history heritage studies": "history heritage", "mathematics actuarial science": "mathematics actuarial sciences", "accounting finance": "accounting and finance", "community health behavioural sciences": "community health behavioral sciences"}
        result = {"fetched": len(rows), "created": 0, "updated": 0, "skipped": 0, "errors": [], "unmatched_departments": [], "duplicates": []}
        seen: set[str] = set()
        for row in rows:
            code = str(row.get("programme_code") or "").strip()
            if not code or code in seen:
                result["skipped"] += 1
                if code in seen: result["duplicates"].append(code)
                continue
            seen.add(code)
            try:
                department_name = str(row.get("department") or "").strip()
                department = by_name.get(_department_key(department_name)) or by_name.get(aliases.get(_department_key(department_name), ""))
                if department is None:
                    result["skipped"] += 1; result["unmatched_departments"].append(department_name); continue
                programme = (await db.execute(select(Programme).where(Programme.external_source == SOURCE, Programme.external_source_id == code, Programme.deleted_at.is_(None)))).scalar_one_or_none()
                if programme is None:
                    programme = (await db.execute(select(Programme).where(Programme.code == code, Programme.deleted_at.is_(None)))).scalar_one_or_none()
                name = str(row.get("name") or "Programme").strip()
                discipline = department.name.removeprefix("Department of ")
                values = {"name": name, "code": code, "external_source": SOURCE, "external_source_id": code, "external_name": name, "level": str(row.get("category") or "").lower().replace("bachelors", "undergraduate").replace("doctor of pholosophy(phd)", "phd").replace("post graduate diploma", "postgraduate_diploma"), "department_id": department.id, "about": row.get("details") or f"{name} provides structured study in {discipline}, combining subject knowledge, applied learning, and assessment at the qualification level.", "curriculum_overview": row.get("curriculum_overview") or f"The curriculum covers core and applied units in {discipline}, with research or project work where required by the qualification.", "career_prospects": row.get("course_prospects") or f"Graduates of {name} may pursue work and further study in fields related to {discipline}."}
                if department.school and department.school.cover_image_id:
                    values["cover_image_id"] = department.school.cover_image_id
                values = {key: value for key, value in values.items() if value is not None and value != ""}
                if programme is None:
                    values["slug"] = slugify(f"{name}-{code}")
                    programme = Programme(**values); db.add(programme); result["created"] += 1
                else:
                    for key, value in values.items():
                        setattr(programme, key, value)
                    result["updated"] += 1
            except Exception as exc:
                result["errors"].append({"programme_code": code, "error": str(exc)})
        result["duplicates"] = sorted(set(result["duplicates"]))
        result["unmatched_departments"] = sorted(set(x for x in result["unmatched_departments"] if x))
        await db.commit()
        return result

    @staticmethod
    async def sync(db: AsyncSession, *, url: str, dry_run: bool = False) -> dict[str, Any]:
        rows = await DigitalLecturerSyncService.fetch(url)
        departments = (await db.execute(select(Department).where(Department.deleted_at.is_(None)))).scalars().all()
        by_external = {str(d.external_source_id): d for d in departments if d.external_source == SOURCE and d.external_source_id}
        by_name = {_department_key(d.name): d for d in departments}
        result = {"fetched": len(rows), "created": 0, "updated": 0, "work_experience": 0, "unmatched_departments": [], "errors": []}

        for row in rows:
            try:
                external_id = str(row["id"])
                first, last, middle = _names(row["name"])
                department_data = row.get("department") or {}
                department = by_external.get(str(department_data.get("id"))) or by_name.get(_department_key(department_data.get("name")))
                if department_data and department is None:
                    result["unmatched_departments"].append(department_data.get("name"))
                person = (await db.execute(select(Person).where(Person.external_source == SOURCE, Person.external_source_id == external_id, Person.deleted_at.is_(None)))).scalar_one_or_none()
                if person is None:
                    person = (await db.execute(select(Person).where(Person.email == row["email"], Person.deleted_at.is_(None)))).scalar_one_or_none()
                values = {
                    "first_name": first, "middle_name": middle, "last_name": last, "full_name": row["name"],
                    "email": row["email"].strip().lower(), "external_source": SOURCE, "external_source_id": external_id,
                    "external_avatar_url": row.get("avatar"), "bio": (row.get("personal_details") or {}).get("biography"),
                    "qualifications": _qualifications(row.get("education") or {}) or None,
                    "education_background": _secondary_education(row.get("education") or {}) or None,
                    "research_interests": [x.get("name") for x in row.get("research_interests") or [] if x.get("name")],
                    "skills": [x.get("name") for x in row.get("skills") or [] if x.get("name")],
                    "publication_records": row.get("publications") or None, "research_grants_won": row.get("research_grants") or None,
                    "publications_count": len(row.get("publications") or []), "department_id": department.id if department else None,
                }
                if department and department_data.get("id") is not None:
                    department.external_source = SOURCE
                    department.external_source_id = str(department_data["id"])
                    department.external_name = department_data.get("name")
                if person is None:
                    values["is_active"] = True
                    values["is_public"] = True
                    person = Person(**values); db.add(person); await db.flush(); result["created"] += 1
                else:
                    for key, value in values.items():
                        if value is not None and value != []:
                            setattr(person, key, value)
                    result["updated"] += 1
                if department:
                    assignment = (await db.execute(select(StaffAssignment).where(StaffAssignment.person_id == person.id, StaffAssignment.external_source == SOURCE, StaffAssignment.external_source_id == external_id, StaffAssignment.deleted_at.is_(None)))).scalar_one_or_none()
                    if assignment is None:
                        db.add(StaffAssignment(person_id=person.id, entity_type="department", entity_id=department.id, role="lecturer", title="Lecturer", hierarchy_level=10, is_primary=True, is_public=True, status="active", external_source=SOURCE, external_source_id=external_id))
                for experience in row.get("work_experience") or []:
                    source_exp_id = str(experience.get("id")) if experience.get("id") is not None else None
                    query = select(PersonWorkExperience).where(PersonWorkExperience.person_id == person.id, PersonWorkExperience.external_source == SOURCE, PersonWorkExperience.external_source_id == source_exp_id, PersonWorkExperience.deleted_at.is_(None))
                    item = (await db.execute(query)).scalar_one_or_none() if source_exp_id else None
                    values_exp = {"person_id": person.id, "external_source": SOURCE, "external_source_id": source_exp_id, "organization": experience.get("organization") or "Unknown organization", "designation": experience.get("designation"), "assignment": experience.get("assignment"), "start_date": _date(experience.get("year_from")), "end_date": _date(experience.get("year_to")), "source_status": experience.get("status")}
                    if item is None:
                        db.add(PersonWorkExperience(**values_exp)); result["work_experience"] += 1
                    else:
                        for key, value in values_exp.items():
                            if key != "person_id" and value is not None and value != []:
                                setattr(item, key, value)
            except Exception as exc: result["errors"].append({"external_id": row.get("id"), "error": str(exc)})
        if dry_run:
            await db.rollback()
        else:
            await db.commit()
        result["unmatched_departments"] = sorted(set(x for x in result["unmatched_departments"] if x))
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
                "source_fields": source_status, "local_fields": local_status,
                "missing_source_fields": [key for key, value in source_status.items() if not value],
                "missing_local_fields": [key for key, value in local_status.items() if not value],
            })
        count = len(rows) or 1
        return {
            "source": SOURCE, "fetched": len(rows),
            "average_source_profile_percentage": round(sum(item["source_profile_percentage"] for item in records) / count, 1),
            "average_local_profile_percentage": round(sum(item["local_profile_percentage"] for item in records) / count, 1),
            "locally_matched": sum(item["local_record_exists"] for item in records),
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
            department = by_external.get(key) or by_name.get(_department_key(source_name)) if source_name else None
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
