"""Reviewed COD appointments from the 24 August 2026 Senate notice.

Only the explicitly listed CODs are reconciled. Names are matched using reviewed
identities, never fuzzy matching, and no login accounts or contact data are invented.
"""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import noload

from app.models import Department, Person, StaffAssignment

FIXTURE = Path(__file__).with_name("agenda_cods_20260824.json")
HEAD_ROLES = {"cod", "hod", "head", "department_head"}


def normalized_name(value: str) -> str:
    value = re.sub(r"^(?:dr|prof|mr|mrs|ms)\.?\s*", "", value.strip().lower())
    value = re.sub(r",?\s*(?:phd|msc|mba|cpa|cps)\.?$", "", value)
    return re.sub(r"[^a-z0-9]", "", value)


def resolve_person(people, entry):
    # A reviewed email identifies which existing profile to retain when the
    # legacy import already contains duplicate names.
    exact = [p for p in people if entry["person_email"] and p.email == entry["person_email"]]
    if not exact:
        exact = [p for p in people if normalized_name(p.full_name) == normalized_name(entry["person_name"])]
    if len(exact) > 1:
        raise ValueError(f"Ambiguous staff identity: {entry['person_name']}")
    if exact and normalized_name(exact[0].full_name) != normalized_name(entry["person_name"]):
        raise ValueError(f"Staff identity changed: {entry['person_name']}")
    if not exact and not entry["allow_create"]:
        raise ValueError(f"Seed the existing staff directory first: {entry['person_name']}")
    return exact[0] if exact else None


async def seed_agenda_cods(db, ctx=None):
    source = json.loads(FIXTURE.read_text(encoding="utf-8"))
    entries = source["entries"]
    if len(entries) != 44 or len({e['department_code'] for e in entries}) != 44:
        raise ValueError("The reviewed COD roster must contain 44 distinct departments")
    people = list((await db.scalars(select(Person).options(noload("*")).where(Person.deleted_at.is_(None)))).all())
    departments = {d.code: d for d in (await db.scalars(select(Department).options(noload("*")).where(Department.deleted_at.is_(None)).with_for_update())).all()}
    # Validate every identity and department before modifying records.
    resolved = []
    for entry in entries:
        department = departments.get(entry["department_code"])
        if department is None or department.department_type != "academic":
            raise ValueError(f"Academic department missing: {entry['department_code']}")
        resolved.append((entry, department, resolve_person(people, entry)))
    report = {"source_file": source["source_file"], "source_sha256": source["source_sha256"], "notice_date": source["notice_date"], "created_people": [], "departments": []}
    for entry, department, person in resolved:
        if person is None:
            names = entry["person_name"].split()
            person = Person(
                id=uuid.uuid5(uuid.NAMESPACE_URL, f"ksu:agenda:20260824:person:{entry['row']}"),
                title=entry["title"], first_name=names[0], last_name=names[-1],
                middle_name=" ".join(names[1:-1]) or None, full_name=entry["person_name"],
                email=None, external_source="senate_agenda_20260824", external_source_id=str(entry["row"]),
                is_active=True, is_public=True, show_on_directory=True,
            )
            db.add(person)
            await db.flush()
            report["created_people"].append({"id": str(person.id), "name": person.full_name})
        assignments = list((await db.scalars(select(StaffAssignment).options(noload("*")).where(
            StaffAssignment.entity_type == "department", StaffAssignment.entity_id == department.id,
            StaffAssignment.deleted_at.is_(None), StaffAssignment.role.in_(HEAD_ROLES),
        ).with_for_update())).all())
        same = sorted((a for a in assignments if a.person_id == person.id), key=lambda a: (a.status != "active", str(a.id)))
        chosen = same[0] if same else None
        record = {"code": department.code, "department": department.name, "source_row": entry["row"],
                  "person_id": str(person.id), "person_name": person.full_name,
                  "old_head_id": str(department.head_id) if department.head_id else None,
                  "old_person_department_id": str(person.department_id) if person.department_id else None,
                  "assignments_before": [{"id":str(a.id), "person_id":str(a.person_id), "status":a.status,
                                          "is_public":a.is_public, "is_primary":a.is_primary} for a in assignments],
                  "assignment_created": chosen is None}
        report["departments"].append(record)
        for assignment in assignments:
            if assignment is not chosen and assignment.status == "active":
                assignment.status = "ended"
                assignment.is_primary = False
                assignment.is_public = False
                assignment.appointment_status = "archived"
                assignment.workflow_status = "archived"
        if chosen is None:
            chosen = StaffAssignment(
                id=uuid.uuid5(uuid.NAMESPACE_URL, f"ksu:agenda-cod:{department.id}:{person.id}"),
                person_id=person.id, entity_type="department", entity_id=department.id,
                is_primary=False, display_order=0,
            )
            db.add(chosen)
        chosen.role = "cod"
        chosen.title = "Chairperson of Department"
        chosen.public_role_label = "COD"
        chosen.official_designation = "Chairperson of Department"
        chosen.hierarchy_level = 7
        chosen.status = "active"
        chosen.is_public = True
        chosen.is_acting = False
        chosen.appointment_status = "published"
        chosen.workflow_status = "published"
        chosen.published_at = chosen.published_at or datetime.now(timezone.utc)
        provenance = f"AGENDA.pdf; notice 2026-08-24; page {entry['page']}, row {entry['row']}; source name: {entry['source_name']}; SHA256 {source['source_sha256']}. Appointment date not supplied."
        if provenance not in (chosen.notes or ""):
            chosen.notes = ((chosen.notes or "") + "\n" + provenance).strip()
        department.head_id = person.id
        person.department_id = department.id
        person.is_active = True
        person.is_public = True
        person.show_on_directory = True
        await db.flush()
    return report
