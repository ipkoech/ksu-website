"""Export existing leadership profile fields for a scoped official-site refresh."""
import asyncio
import json
from pathlib import Path

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models import Person


async def main():
    async with AsyncSessionLocal() as db:
        people = (await db.scalars(select(Person).where(Person.deleted_at.is_(None)))).all()
        fields = ['id', 'full_name', 'institutional_role', 'bio', 'full_bio', 'qualifications',
                  'education_background', 'photo_id', 'cv_file_id', 'website_url']
        records = [{k: getattr(p, k) for k in fields} for p in people
                   if any(x in (p.institutional_role or '') for x in
                          ['council', 'chancellor', 'dvc', 'registrar', 'finance_officer'])]
        Path('/tmp/leadership-before.json').write_text(json.dumps(records, default=str, indent=2))
        print(json.dumps([{k: r[k] for k in ['id', 'full_name', 'institutional_role']} for r in records], default=str))
    await engine.dispose()


asyncio.run(main())
