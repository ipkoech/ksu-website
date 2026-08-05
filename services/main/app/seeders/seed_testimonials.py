"""Seed approved, public testimonials for Kisii University public pages.

Testimonials are fictional but specific voices written for seed/demo use.
They are scoped to real seeded schools (by code) and programmes (by exact
catalogue name) so the public campus-life and programme-detail surfaces
have genuine records to render.
"""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Programme, School, Testimonial

from ._shared import SeedContext, fetch_one

SEED_OWNER = "testimonials-v1"

# school_key matches SeedContext.schools keys from seed_schools;
# school_code is the fallback lookup when the context is not populated.
# programme_name must match the exact catalogue name from programme_catalogue.py.
TESTIMONIAL_SPECS: list[dict[str, Any]] = [
    {
        "name": "Faith Kemunto Nyabuto",
        "role": "Third-year student, Bachelor of Laws",
        "testimonial_type": "student",
        "school_key": "law",
        "school_code": "SOL",
        "programme_name": "Bachelor of Laws",
        "quote": (
            "The moot court sessions changed how I think. Standing before a bench of my own "
            "lecturers to argue a constitutional question taught me more about precision and "
            "composure than any textbook could."
        ),
        "full_story": (
            "I joined the School of Law from Nyamira County expecting four years of memorising "
            "statutes. Instead I found legal aid clinics in Kisii town, moot court competitions "
            "against other Kenyan law schools, and lecturers who insist that every argument be "
            "grounded in authority. The library's law collection and the small-group case "
            "discussions have made the difference for me."
        ),
        "is_featured": True,
        "display_order": 10,
    },
    {
        "name": "Brian Otieno Ouma",
        "role": "Software Engineer, Nairobi · BSc Computer Science, Class of 2022",
        "testimonial_type": "alumni",
        "school_key": "ist",
        "school_code": "SIST",
        "programme_name": "Bachelor of Science in Computer Science",
        "quote": (
            "My final-year project at Kisii University became my interview portfolio. The "
            "Computing Science department pushed us to build working systems, not slide decks, "
            "and that is exactly what employers asked to see."
        ),
        "full_story": (
            "I graduated in 2022 and joined a Nairobi fintech as a junior developer within three "
            "months. The programming fundamentals, database units, and the innovation week demos "
            "at the ICT building gave me a portfolio I could defend in interviews. I still refer "
            "juniors from my village to the programme."
        ),
        "is_featured": True,
        "display_order": 20,
    },
    {
        "name": "Mercy Chebet Langat",
        "role": "Fourth-year student, BSc Nursing",
        "testimonial_type": "student",
        "school_key": "health",
        "school_code": "SHS",
        "programme_name": "Bachelor of Science in Nursing (Direct Entry)",
        "quote": (
            "Clinical placements at the referral hospital start early and are taken seriously. By "
            "third year I had handled real ward rotations with supervisors who treated us as "
            "future colleagues, not visitors."
        ),
        "is_featured": False,
        "display_order": 30,
    },
    {
        "name": "Dennis Mokaya Ombui",
        "role": "Audit Associate, Kisumu · Bachelor of Commerce, Class of 2021",
        "testimonial_type": "alumni",
        "school_key": "business",
        "school_code": "SBE",
        "programme_name": "Bachelor of Commerce",
        "quote": (
            "The accounting units at the School of Business and Economics mapped almost one to "
            "one onto my CPA papers. I sat my professional exams while still on campus and walked "
            "into my first audit job with both qualifications."
        ),
        "full_story": (
            "Coming from Keroka, commuting to the main campus was demanding, but the evening "
            "revision groups in the Sakagwa Building and lecturers who doubled as practising "
            "accountants kept me on track. Combining the degree with CPA preparation was the "
            "single best decision of my twenties."
        ),
        "is_featured": True,
        "display_order": 40,
    },
    {
        "name": "Sharon Akinyi Owuor",
        "role": "Teaching practice student, Bachelor of Education (Arts)",
        "testimonial_type": "student",
        "school_key": "education",
        "school_code": "SEHRD",
        "programme_name": "Bachelor of Education (Arts)",
        "quote": (
            "Teaching practice was supervised, honest, and humbling. My assessor sat through my "
            "literature lesson in a Gusii highlands secondary school and gave me feedback I still "
            "use every time I stand before a class."
        ),
        "is_featured": False,
        "display_order": 50,
    },
    {
        "name": "Paul Kipruto Sang",
        "role": "Senior Laboratory Technologist, Department of Chemistry",
        "testimonial_type": "staff",
        "school_key": "pure_sciences",
        "school_code": "SPAS",
        "programme_name": None,
        "quote": (
            "Our undergraduate labs are not demonstrations from a distance. Every student titrates, "
            "calibrates, and records their own results. When you watch a first-year gain confidence "
            "with the instruments, you understand why practical science matters here."
        ),
        "is_featured": False,
        "display_order": 60,
    },
    {
        "name": "Esther Moraa Nyangau",
        "role": "Final-year student, BA Social Work and Sociology",
        "testimonial_type": "student",
        "school_key": "arts",
        "school_code": "SASS",
        "programme_name": "Bachelor of Arts (Social Work and Sociology)",
        "quote": (
            "My community attachment placed me with a children's office right here in Kisii County. "
            "The course did not just describe social problems, it put me in rooms where they are "
            "being solved case by case."
        ),
        "is_featured": False,
        "display_order": 70,
    },
    {
        "name": "Kevin Nyamweya Ondieki",
        "role": "Agripreneur, Nyamira · BSc Agriculture, Class of 2020",
        "testimonial_type": "alumni",
        "school_key": "agriculture",
        "school_code": "SANRM",
        "programme_name": "Bachelor of Science in Agriculture",
        "quote": (
            "The demonstration farm taught me what the lecture hall could not: soil is a business "
            "partner. Today my horticulture enterprise employs six people, and its first business "
            "plan was my agribusiness coursework."
        ),
        "full_story": (
            "After graduating in 2020 I went back to our family land in Nyamira with a plan built "
            "during my agribusiness units. Drip irrigation, soil testing, record keeping - all of "
            "it started as coursework at the School of Agriculture and Natural Resources "
            "Management. The university farm attachments made agriculture feel like a profession, "
            "not a fallback."
        ),
        "is_featured": False,
        "display_order": 80,
    },
    {
        "name": "Naomi Bosibori Ratemo",
        "role": "Senior Assistant Librarian, University Library",
        "testimonial_type": "staff",
        "school_key": None,
        "school_code": None,
        "programme_name": None,
        "quote": (
            "Many of our students are the first in their families to reach university. Watching them "
            "move from asking where the catalogue is to teaching classmates how to search e-resources "
            "is the quiet success story of this library, every single semester."
        ),
        "is_featured": True,
        "display_order": 90,
    },
]


async def _resolve_school(
    db: AsyncSession, ctx: SeedContext, spec: dict[str, Any]
) -> School | None:
    school_key = spec.get("school_key")
    if school_key and school_key in ctx.schools:
        return ctx.schools[school_key]
    school_code = spec.get("school_code")
    if school_code:
        return await fetch_one(db, School, code=school_code)
    return None


async def _resolve_programme(db: AsyncSession, spec: dict[str, Any]) -> Programme | None:
    programme_name = spec.get("programme_name")
    if not programme_name:
        return None
    return await fetch_one(db, Programme, name=programme_name)


async def seed_testimonials(db: AsyncSession, ctx: SeedContext) -> None:
    """Upsert seed-owned approved+public testimonials keyed by (name, type)."""
    for spec in TESTIMONIAL_SPECS:
        school = await _resolve_school(db, ctx, spec)
        programme = await _resolve_programme(db, spec)

        payload = {
            "name": spec["name"],
            "role": spec.get("role"),
            "quote": spec["quote"],
            "full_story": spec.get("full_story"),
            "testimonial_type": spec["testimonial_type"],
            "school_id": school.id if school is not None else None,
            "department_id": None,
            "programme_id": programme.id if programme is not None else None,
            "photo_id": None,
            "video_url": None,
            "is_featured": bool(spec.get("is_featured", False)),
            "display_order": int(spec.get("display_order", 100)),
            "is_approved": True,
            "is_public": True,
        }

        item = await fetch_one(
            db,
            Testimonial,
            name=spec["name"],
            testimonial_type=spec["testimonial_type"],
        )
        if item is None:
            item = Testimonial(id=uuid.uuid4(), **payload)
            db.add(item)
        else:
            for field_name, value in payload.items():
                setattr(item, field_name, value)
        await db.flush()


__all__ = ["TESTIMONIAL_SPECS", "seed_testimonials"]
