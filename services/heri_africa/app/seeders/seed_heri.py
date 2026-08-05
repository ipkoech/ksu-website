from __future__ import annotations

import asyncio

from ..core.database import AsyncSessionLocal
from ..services.seed import seed_heri


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed_heri(db)
        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())
