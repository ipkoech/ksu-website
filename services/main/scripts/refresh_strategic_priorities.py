"""Apply only the six verified strategic result areas, preserving other About content."""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import noload
from app.core.database import AsyncSessionLocal, engine
from app.models import InstitutionalPage, InstitutionalPageSection, InstitutionalPageItem, UniversityInfo
from app.seeders.seed_about_content import INSTITUTIONAL_PAGES

async def run():
    spec = next(s for p in INSTITUTIONAL_PAGES if p["slug"] == "strategic-plan" for s in p["sections"] if s["slug"] == "strategic-priorities")
    async with AsyncSessionLocal() as db:
        page = (await db.scalars(select(InstitutionalPage).options(noload("*")).where(InstitutionalPage.slug == "strategic-plan"))).one()
        section = (await db.scalars(select(InstitutionalPageSection).options(noload("*")).where(InstitutionalPageSection.institutional_page_id == page.id, InstitutionalPageSection.slug == spec["slug"]))).one()
        items = list((await db.scalars(select(InstitutionalPageItem).options(noload("*")).where(InstitutionalPageItem.section_id == section.id))).all())
        report = {"before": [{"id":str(i.id), "title":i.title, "status":i.status} for i in items], "after": [x[0] for x in spec["items"]]}
        Path("/tmp/strategic-priorities-before.json").write_text(json.dumps(report,indent=2))
        titles = set(report["after"])
        for item in items:
            if item.title not in titles:
                item.status = item.workflow_status = "archived"
        section.heading = spec["heading"]
        section.summary = spec["summary"]
        for order, (title, body, icon) in enumerate(spec["items"], 1):
            item = next((i for i in items if i.title == title), None)
            if item is None:
                item = InstitutionalPageItem(section_id=section.id, title=title)
                db.add(item)
            item.description, item.icon_key, item.display_order = body, icon, order * 10
            item.status = item.workflow_status = "published"
            item.is_enabled = True
            item.published_at = item.published_at or datetime.now(timezone.utc)
        university = await db.get(UniversityInfo, page.university_info_id)
        university.strategic_priorities = [{"title":title,"body":body} for title,body,_ in spec["items"]]
        await db.commit()
        print(json.dumps({"published": len(titles), "titles": sorted(titles)}))
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run())
