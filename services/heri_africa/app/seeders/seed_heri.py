from __future__ import annotations

import asyncio

from ..core.database import AsyncSessionLocal
from ..services.seed import seed_heri


async def main() -> None:
    async with AsyncSessionLocal() as db:
        try:
            await seed_heri(db)
            await db.commit()
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
