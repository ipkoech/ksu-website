"""Seed verified Kisii University partner organizations into the Research service."""

from __future__ import annotations

import asyncio
from pathlib import Path

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Partner
from app.schemas.base import slugify

ASSET_ROOT = Path(__file__).resolve().parent / "assets" / "partners"

PARTNER_SPECS = [
    {
        "name": "University of Minnesota",
        "acronym": "UMN",
        "partner_type": "academic",
        "partnership_level": "strategic",
        "country": "United States",
        "website": "https://twin-cities.umn.edu/",
        "about": (
            "Long-standing academic and research partner supporting staff and student development "
            "programmes with Kisii University."
        ),
        "collaboration_areas": (
            "Research funding, staff and student development, community leadership training, and internationalization."
        ),
        "key_achievements": (
            "Kisii University reported that the University of Minnesota was supporting the partnership "
            "with over USD 660,000 in research funding over three years."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/blog/partnering-university-of-minnesota",
            "source_type": "official_ksu_news",
            "asset_path": "/seed-assets/partners/university-of-minnesota.ico",
        },
        "is_featured": True,
        "display_order": 10,
    },
    {
        "name": "University of Manchester",
        "partner_type": "academic",
        "partnership_level": "strategic",
        "country": "United Kingdom",
        "website": "https://www.manchester.ac.uk/",
        "about": (
            "Academic exchange partner working with Kisii University through the School of Health Sciences."
        ),
        "collaboration_areas": "Medical student exchange, teaching programmes, and health sciences collaboration.",
        "key_achievements": (
            "Kisii University publicized an active MOU supporting reciprocal student exchange under the "
            "Kenya UK Health Alliance umbrella."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/blog/kisii-and-university-of-manchester-mou",
            "source_type": "official_ksu_news",
            "asset_path": "/seed-assets/partners/university-of-manchester.ico",
        },
        "is_featured": True,
        "display_order": 20,
    },
    {
        "name": "Mozilla Foundation",
        "acronym": "Mozilla",
        "partner_type": "foundation",
        "partnership_level": "technical",
        "country": "United States",
        "website": "https://foundation.mozilla.org/",
        "about": (
            "Foundation partner behind Kisii University's Responsible Computing Challenge and ethical AI curriculum work."
        ),
        "collaboration_areas": "Responsible computing, AI ethics, curriculum redesign, and student innovation.",
        "key_achievements": (
            "Kisii University publicly credits the Mozilla Foundation partnership with embedding responsible "
            "computing concepts into student projects and coursework."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/blog/mozilla-foundation-responsible-computing-challenge",
            "source_type": "official_ksu_news",
            "asset_path": "/seed-assets/partners/mozilla-foundation.png",
        },
        "is_featured": True,
        "display_order": 30,
    },
    {
        "name": "Sheffield Hallam University",
        "partner_type": "academic",
        "partnership_level": "implementing",
        "country": "United Kingdom",
        "website": "https://www.shu.ac.uk/",
        "about": (
            "Collaborating university in Kisii University's carbon literacy and youth employability project network."
        ),
        "collaboration_areas": "Carbon literacy, youth employability, green innovation, and entrepreneurship.",
        "key_achievements": (
            "Named by Kisii University as a collaborator in the British Council-funded CL4YEJCP project."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/kisii-university-partners-with-universities-in-ssa-and-uk-to-leverage-carbon-literacy-for-youth-employability-and-job-creation",
            "source_type": "official_ksu_research_site",
            "asset_path": "/seed-assets/partners/sheffield-hallam-university.ico",
        },
        "display_order": 40,
    },
    {
        "name": "Durban University of Technology",
        "acronym": "DUT",
        "partner_type": "academic",
        "partnership_level": "implementing",
        "country": "South Africa",
        "website": "https://www.dut.ac.za/",
        "about": (
            "Regional university partner in Kisii University's carbon literacy and youth employability collaboration."
        ),
        "collaboration_areas": "Climate innovation, carbon literacy, youth employability, and joint project delivery.",
        "key_achievements": (
            "Named by Kisii University as part of the CL4YEJCP international university collaboration network."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/kisii-university-partners-with-universities-in-ssa-and-uk-to-leverage-carbon-literacy-for-youth-employability-and-job-creation",
            "source_type": "official_ksu_research_site",
            "asset_path": "/seed-assets/partners/durban-university-of-technology.ico",
        },
        "display_order": 50,
    },
    {
        "name": "Ladoke Akintola University of Technology",
        "acronym": "LAUTECH",
        "partner_type": "academic",
        "partnership_level": "implementing",
        "country": "Nigeria",
        "website": "https://www.lautech.edu.ng/",
        "about": (
            "West African university collaborator in Kisii University's carbon literacy and youth employability project."
        ),
        "collaboration_areas": "Carbon literacy, youth employability, innovation, and entrepreneurship.",
        "key_achievements": (
            "Listed by Kisii University as one of the institutions participating in the CL4YEJCP grant network."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/kisii-university-partners-with-universities-in-ssa-and-uk-to-leverage-carbon-literacy-for-youth-employability-and-job-creation",
            "source_type": "official_ksu_research_site",
            "asset_path": "/seed-assets/partners/ladoke-akintola-university-of-technology.png",
        },
        "display_order": 60,
    },
    {
        "name": "Innovate Durban",
        "partner_type": "industry",
        "partnership_level": "technical",
        "country": "South Africa",
        "website": "https://www.innovate.durban/",
        "about": (
            "Innovation ecosystem partner participating in Kisii University's carbon literacy employability collaboration."
        ),
        "collaboration_areas": "Innovation ecosystems, entrepreneurship, green skills, and project implementation.",
        "key_achievements": (
            "Listed by Kisii University among the CL4YEJCP collaborating organizations funded through the British Council IAU grant."
        ),
        "social_links": {
            "source_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/kisii-university-partners-with-universities-in-ssa-and-uk-to-leverage-carbon-literacy-for-youth-employability-and-job-creation",
            "source_type": "official_ksu_research_site",
            "asset_path": "/seed-assets/partners/innovate-durban.png",
        },
        "display_order": 70,
    },
]


async def upsert_partner(db, spec: dict) -> None:
    slug = slugify(spec["name"])
    result = await db.execute(select(Partner).where(Partner.slug == slug))
    partner = result.scalar_one_or_none()

    payload = {
        **spec,
        "slug": slug,
        "status": "active",
        "is_active": True,
    }

    if partner is None:
        partner = Partner(**payload)
        db.add(partner)
    else:
        for field_name, value in payload.items():
            setattr(partner, field_name, value)


async def run() -> None:
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    async with AsyncSessionLocal() as db:
        try:
            for spec in PARTNER_SPECS:
                await upsert_partner(db, spec)
            await db.commit()
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
