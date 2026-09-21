"""Run the reviewed COD seeder; dry-run rolls back the entire transaction."""
import argparse
import asyncio
import json
from pathlib import Path

from app.core.database import AsyncSessionLocal, engine
from app.seeders.seed_agenda_cods import seed_agenda_cods


async def run(args):
    try:
        async with AsyncSessionLocal() as db:
            report = await seed_agenda_cods(db)
            report["applied"] = False
            args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
            if args.apply:
                await db.commit()
                report["applied"] = True
                args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
            else:
                await db.rollback()
            print(json.dumps({"applied":report["applied"], "departments":len(report["departments"]),
                              "created_people":report["created_people"],
                              "head_changes":sum(d['old_head_id'] != d['person_id'] for d in report['departments']),
                              "created_assignments":sum(d['assignment_created'] for d in report['departments'])}))
    finally:
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--report", type=Path, required=True)
    asyncio.run(run(parser.parse_args()))
