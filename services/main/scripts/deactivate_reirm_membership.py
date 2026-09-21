"""Apply the confirmed inactive REIRM office state, retaining appointment history."""
import asyncio
import json
from pathlib import Path
from app.core.database import AsyncSessionLocal, engine
from app.seeders.seed_management import deactivate_reirm_membership


async def main():
    async with AsyncSessionLocal() as db:
        async with db.begin():
            changes = await deactivate_reirm_membership(db)
            Path('/tmp/reirm-inactive.json').write_text(json.dumps(changes, indent=2))
        print(json.dumps(changes))
    await engine.dispose()


if __name__ == '__main__':
    asyncio.run(main())
