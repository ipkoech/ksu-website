"""Refresh existing canonical leadership profiles; dry run unless --apply.

PYTHONPATH=/app python scripts/refresh_leadership_profiles.py /tmp/leadership-report.json [--apply]
"""
import argparse
import asyncio
import json
from pathlib import Path
from types import SimpleNamespace

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models import Person, StaffAssignment
from app.seeders.seed_leadership_profiles import SNAPSHOT, seed_leadership_profiles


async def main(report_path, apply):
    async with AsyncSessionLocal() as db:
        async with db.begin():
            people = {}
            for spec in SNAPSHOT['profiles']:
                person = (await db.scalars(select(Person).where(
                    Person.full_name == spec['full_name'], Person.deleted_at.is_(None),
                    Person.is_active.is_(True), Person.is_public.is_(True),
                ).with_for_update())).one()
                assignments = (await db.scalars(select(StaffAssignment).where(
                    StaffAssignment.person_id == person.id, StaffAssignment.deleted_at.is_(None),
                    StaffAssignment.status == 'active', StaffAssignment.is_public.is_(True),
                ))).all()
                if not assignments:
                    raise ValueError(f"No published appointment for {person.full_name}")
                people[spec['key']] = person
            changes = await seed_leadership_profiles(db, SimpleNamespace(people=people))
            report = dict(applied=False, verified_on=SNAPSHOT['verified_on'], profiles=changes, unresolved=SNAPSHOT['unresolved'])
            report_path.write_text(json.dumps(report, default=str, ensure_ascii=False, indent=2), encoding='utf-8')
            if not apply:
                await db.rollback()
        if apply:
            report['applied'] = True
            report_path.write_text(json.dumps(report, default=str, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps({'applied': apply, 'profiles': len(changes), 'changed': sum(p['before'] != p['after'] for p in changes)}))
    await engine.dispose()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', type=Path)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    asyncio.run(main(args.report, args.apply))
