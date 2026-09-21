"""Export matching fields for the user-provided COD roster."""
import asyncio
import json
from pathlib import Path
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models import Person, Department

async def main():
    async with AsyncSessionLocal() as db:
        people = (await db.execute(select(Person.id, Person.full_name, Person.title, Person.email,
                    Person.department_id, Person.external_source_id, Person.is_active, Person.is_public)
                    .where(Person.deleted_at.is_(None)))).mappings().all()
        departments = (await db.execute(select(Department.id, Department.name, Department.slug,
                    Department.code, Department.department_type, Department.head_id)
                    .where(Department.deleted_at.is_(None)))).mappings().all()
        Path('/tmp/agenda-local.json').write_text(json.dumps(dict(people=[dict(p) for p in people],
                    departments=[dict(d) for d in departments]), default=str, indent=2))
        print(f'{len(people)} people; {len(departments)} departments')
    await engine.dispose()

asyncio.run(main())
