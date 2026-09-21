"""Apply a reviewed official-site head mapping, with a before-state record.

Run inside the main service: python scripts/match_department_heads.py PLAN REPORT [--apply]
No identities, login accounts, access roles, or fabricated appointment dates are created.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine
from app.models import Department, Person, StaffAssignment

HEAD_ROLES = {"cod", "hod", "head", "director", "manager", "section_head", "registrar", "registrar_academic", "registrar_admin", "finance_officer"}
FIELDS = ("id", "person_id", "role", "title", "hierarchy_level", "status", "is_primary", "is_public", "is_acting", "notes", "public_role_label", "official_designation", "appointment_status", "workflow_status", "published_at")


def snapshot(record):
    return {field: getattr(record, field) for field in FIELDS}


async def run(plan_path: Path, report_path: Path, apply: bool):
    plan = json.loads(plan_path.read_text())
    matched = [item for item in plan if item['status'] == 'matched']
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'applied': False, 'departments': []}
    async with AsyncSessionLocal() as db:
        async with db.begin():
            for item in matched:
                department = await db.get(Department, uuid.UUID(item['id']), with_for_update=True)
                person = await db.get(Person, uuid.UUID(item['person_id']))
                if not department or department.code != item['code'] or department.deleted_at:
                    raise ValueError(f"Department changed or missing: {item['code']}")
                if not person or person.full_name != item['local_name'] or person.deleted_at or not person.is_active:
                    raise ValueError(f"Person changed or missing: {item['local_name']}")
                if not person.is_public or not person.show_on_directory:
                    raise ValueError(f"Selected person is not public: {item['local_name']}")
                if str(department.head_id) not in {str(item['head_id']), item['person_id']}:
                    raise ValueError(f"Head changed since discovery: {department.code}")
                assignments = list((await db.scalars(select(StaffAssignment).where(
                    StaffAssignment.entity_type == 'department',
                    StaffAssignment.entity_id == department.id,
                    StaffAssignment.deleted_at.is_(None),
                    StaffAssignment.status == 'active',
                    StaffAssignment.role.in_(HEAD_ROLES),
                ).with_for_update())).all())
                same = [a for a in assignments if a.person_id == person.id]
                same.sort(key=lambda a: (not a.is_primary, a.created_at, str(a.id)))
                chosen = same[0] if same else None
                previous_head = await db.get(Person, department.head_id) if department.head_id else None
                entry = {
                    'code': department.code, 'department': department.name,
                    'department_id': department.id, 'department_type': department.department_type,
                    'old_head_id': department.head_id, 'old_head_name': previous_head.full_name if previous_head else None,
                    'new_head_id': person.id, 'new_head_name': person.full_name,
                    'source_url': item['source_url'], 'designation': item['designation'],
                    'assignments_before': [snapshot(a) for a in assignments],
                    'assignment_action': 'update' if chosen else 'create',
                }
                report['departments'].append(entry)
                if not apply:
                    continue
                for old in assignments:
                    if old is chosen:
                        continue
                    old.status = 'ended'
                    old.is_primary = False
                    old.notes = (old.notes or '') + f"\nSuperseded by official department head reconciliation ({report['checked_at']}); source: {item['source_url']}. Actual appointment end date not supplied."
                if chosen is None:
                    chosen = StaffAssignment(
                        id=uuid.uuid5(uuid.NAMESPACE_URL, f"ksu:official-department-head:{department.id}:{person.id}"),
                        person_id=person.id, entity_type='department', entity_id=department.id,
                        is_primary=False, display_order=0,
                    )
                    db.add(chosen)
                chosen.role = 'cod' if department.department_type == 'academic' else 'head'
                chosen.title = item['designation']
                chosen.public_role_label = item['designation']
                chosen.official_designation = item['designation']
                chosen.hierarchy_level = 7
                chosen.status = 'active'
                chosen.is_public = True
                chosen.is_acting = item['designation'].lower().startswith(('ag.', 'acting'))
                chosen.appointment_status = 'published'
                chosen.workflow_status = 'published'
                chosen.published_at = chosen.published_at or datetime.now(timezone.utc)
                provenance = f"Official department head verified {item['checked_at']}; {item['source_url']}; source name: {item['source_name']}."
                if provenance not in (chosen.notes or ''):
                    chosen.notes = ((chosen.notes or '') + '\n' + provenance).strip()
                department.head_id = person.id
                await db.flush()
                entry['assignment_after'] = snapshot(chosen)
            # Persist a before-state artifact before committing any database change.
            report_path.write_text(json.dumps(report, indent=2, default=str), encoding='utf-8')
        report['applied'] = apply
        report_path.write_text(json.dumps(report, indent=2, default=str), encoding='utf-8')
    await engine.dispose()
    print(json.dumps({'departments': len(report['departments']), 'applied': apply, 'head_changes': sum(str(d['old_head_id']) != str(d['new_head_id']) for d in report['departments']), 'new_assignments': sum(d['assignment_action']=='create' for d in report['departments'])}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('plan', type=Path)
    parser.add_argument('report', type=Path)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    asyncio.run(run(args.plan, args.report, args.apply))
