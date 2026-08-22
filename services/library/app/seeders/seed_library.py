"""Seed realistic public Library service records for UI iteration."""

from __future__ import annotations

import asyncio
import re
from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.models import (
    ElectronicResource,
    ElectronicResourceGuide,
    Library,
    LibraryCharge,
    LibraryExternalLink,
    LibraryHours,
    LibraryRegulation,
    LibraryResource,
    LibraryService,
    LibraryStatistics,
)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "record"


async def upsert_by_slug(db, model, slug: str, payload: dict[str, Any]):
    result = await db.execute(select(model).where(model.slug == slug))
    row = result.scalar_one_or_none()
    if row is None:
        row = model(slug=slug, **payload)
        db.add(row)
    else:
        for field, value in payload.items():
            setattr(row, field, value)
        row.deleted_at = None
    await db.flush()
    return row


async def upsert_resource(db, payload: dict[str, Any]):
    barcode = payload["barcode"]
    result = await db.execute(select(LibraryResource).where(LibraryResource.barcode == barcode))
    row = result.scalar_one_or_none()
    if row is None:
        row = LibraryResource(**payload)
        db.add(row)
    else:
        for field, value in payload.items():
            setattr(row, field, value)
        row.deleted_at = None
    await db.flush()
    return row


async def upsert_named(db, model, where_clause, payload: dict[str, Any]):
    result = await db.execute(select(model).where(where_clause))
    row = result.scalar_one_or_none()
    if row is None:
        row = model(**payload)
        db.add(row)
    else:
        for field, value in payload.items():
            setattr(row, field, value)
        row.deleted_at = None
    await db.flush()
    return row


BRANCHES = [
    {
        "name": "Main Campus Library",
        "short_name": "Main Library",
        "slug": "main-campus-library",
        "description": "The central library serving undergraduate, postgraduate, and academic staff needs at Main Campus.",
        "objectives": "Provide scholarly resources, study spaces, information literacy training, and research support.",
        "mission": "To connect Kisii University learners and researchers with credible knowledge resources.",
        "vision": "A responsive academic library supporting teaching, learning, innovation, and community engagement.",
        "address": "Main Campus, Kisii University, Kisii",
        "phone": "+254720875082",
        "email": "library@kisiiuniversity.ac.ke",
        "website_url": "https://library.kisiiuniversity.ac.ke",
        "latitude": -0.681306,
        "longitude": 34.777061,
        "library_type": "main",
        "sort_order": 10,
    },
    {
        "name": "Digital Library",
        "short_name": "Digital",
        "slug": "digital-library",
        "description": "Online access point for subscribed databases, repository resources, guides, and remote access support.",
        "address": "Online services desk",
        "phone": "+254720875082",
        "email": "eresources@kisiiuniversity.ac.ke",
        "website_url": "https://library.kisiiuniversity.ac.ke",
        "library_type": "digital",
        "sort_order": 20,
    },
    {
        "name": "Town Campus Library",
        "short_name": "Town Campus",
        "slug": "town-campus-library",
        "description": "Branch library supporting evening, professional, and town campus programmes.",
        "address": "Kisii Town Campus",
        "phone": "+254720875082",
        "email": "townlibrary@kisiiuniversity.ac.ke",
        "library_type": "branch",
        "sort_order": 30,
    },
]

SERVICES = [
    ("Borrowing and returns", "borrowing", "Undergraduate and postgraduate students, staff, and approved external users.", "Visit the circulation desk with a valid university ID.", "circulation@kisiiuniversity.ac.ke"),
    ("Reference and research help", "reference", "Students, faculty, researchers, and visiting scholars.", "Book a consultation or visit the reference desk.", "reference@kisiiuniversity.ac.ke"),
    ("Information literacy training", "training", "Classes, departments, postgraduate groups, and researchers.", "Request a session through the library training desk.", "training@kisiiuniversity.ac.ke"),
    ("Printing, scanning, and photocopying", "printing", "Library users with valid access to branch services.", "Request support at the circulation counter.", "library@kisiiuniversity.ac.ke"),
    ("Inter-library loan", "inter_library_loan", "Researchers and postgraduate students requiring material outside the collection.", "Submit bibliographic details to the reference librarian.", "ill@kisiiuniversity.ac.ke"),
]

CATALOG = [
    # Verified against the public Kisii University Koha OPAC on 2026-08-10.
    ("Scientific Data Management", "Arie Shoshani", "CRC Press", 2010, "book", "Q 183.9.S56 2010", "011090", 1, 1, ["electronic data processing", "data management"]),
    ("Sabina and the Mystery of the Ogre", "Christopher Okemwa", "Nsemia Inc. Publishers", 2015, "book", "PR 9199.3 .O44 2015", "000000023575", 1, 1, ["literature", "fiction"]),
    ("A Framework for Effective Information Security Risk Management in Kenyan Public Universities", "Patrick Macharia Njoroge", "Kisii University", 2020, "thesis", "THE LB 2866 .M33 2020", "000000024528", 1, 1, ["information security", "risk management", "universities"]),
    ("Developing a Model for Security Control in Web Content Management Systems", "Alex Maraga", "Kisii University", 2021, "thesis", "THE TK 5105.59 .M37 2021", "000000024091", 1, 1, ["web content management", "security controls"]),
    ("Mapambazuko ya Machweo na Hadithi Nyingine", "D. W. Lutomia; Phibbian I. Muthama", "Mountain Top Educational Publishers Limited", 2021, "book", "PL 8704 .A2 M37 2021", "000000009972", 1, 1, ["kiswahili", "short stories"]),
]

ELECTRONIC = [
    {
        "name": "Institutional Repository",
        "slug": "institutional-repository",
        "provider": "Kisii University",
        "description": "Open access theses, dissertations, publications, and institutional scholarly outputs.",
        "access_url": "http://repository.kisiiuniversity.ac.ke:8080/xmlui/",
        "section_letter": "I",
        "resource_type": "reference",
        "subjects": ["Research outputs", "Theses", "Open access"],
        "access_level": "all",
        "access_type": "both",
        "is_featured": True,
        "sort_order": 10,
    },
    {
        "name": "MyLOFT Remote Access",
        "slug": "myloft-remote-access",
        "provider": "MyLOFT",
        "description": "Remote access gateway for subscribed library resources and reading lists.",
        "access_url": "https://app.myloft.xyz/user/login?institute=cl4pou55huc740960l7k1mftg",
        "section_letter": "M",
        "resource_type": "database",
        "subjects": ["Remote access", "Databases"],
        "access_level": "students",
        "access_type": "off_campus",
        "requires_registration": True,
        "is_featured": True,
        "sort_order": 20,
    },
    {
        "name": "DOAJ",
        "slug": "doaj",
        "provider": "Directory of Open Access Journals",
        "description": "Peer-reviewed open access journals across disciplines.",
        "access_url": "https://doaj.org/",
        "section_letter": "D",
        "resource_type": "ejournal_aggregator",
        "subjects": ["Open access", "Journals"],
        "access_level": "all",
        "access_type": "both",
        "is_featured": True,
        "sort_order": 30,
    },
    {
        "name": "PubMed",
        "slug": "pubmed",
        "provider": "National Library of Medicine",
        "description": "Biomedical literature search platform for health sciences research.",
        "access_url": "https://pubmed.ncbi.nlm.nih.gov/",
        "section_letter": "P",
        "resource_type": "database",
        "subjects": ["Medicine", "Health sciences"],
        "access_level": "all",
        "access_type": "both",
        "sort_order": 40,
    },
]


async def seed_libraries(db) -> dict[str, Library]:
    libraries: dict[str, Library] = {}
    for spec in BRANCHES:
        slug = spec["slug"]
        payload = {
            **spec,
            "is_active": True,
            "is_public": True,
        }
        payload.pop("slug")
        libraries[slug] = await upsert_by_slug(db, Library, slug, payload)

    for library in libraries.values():
        await db.execute(delete(LibraryHours).where(LibraryHours.library_id == library.id))
        db.add_all(
            [
                LibraryHours(library_id=library.id, day_type="weekday", opens_at="08:00", closes_at="21:00", note="Semester hours"),
                LibraryHours(library_id=library.id, day_type="saturday", opens_at="09:00", closes_at="17:00", note="Weekend service"),
                LibraryHours(library_id=library.id, day_type="sunday", is_closed=True, note="Closed"),
                LibraryHours(library_id=library.id, day_type="public_holiday", is_closed=True, note="Closed on public holidays"),
            ]
        )

    main = libraries["main-campus-library"]
    links = [
        ("opac", "Online catalog", "https://library.kisiiuniversity.ac.ke", "Search library holdings.", "book-open", 10),
        ("repository", "Institutional repository", "http://repository.kisiiuniversity.ac.ke:8080/xmlui/", "Browse KSU scholarly output.", "database", 20),
        ("myloft", "MyLOFT", "https://app.myloft.xyz/user/login?institute=cl4pou55huc740960l7k1mftg", "Access subscribed resources remotely.", "shield", 30),
    ]
    for link_type, label, url, description, icon, sort_order in links:
        await upsert_named(
            db,
            LibraryExternalLink,
            (LibraryExternalLink.library_id == main.id) & (LibraryExternalLink.label == label),
            {
                "library_id": main.id,
                "link_type": link_type,
                "label": label,
                "url": url,
                "description": description,
                "is_active": True,
                "opens_in_new_tab": True,
                "icon": icon,
                "sort_order": sort_order,
            },
        )

    return libraries


async def seed_services(db, libraries: dict[str, Library]) -> None:
    for library in libraries.values():
        for index, (name, service_type, eligibility, how_to_access, contact) in enumerate(SERVICES, start=1):
            slug = slugify(f"{library.slug}-{name}")
            await upsert_by_slug(
                db,
                LibraryService,
                slug,
                {
                    "library_id": library.id,
                    "name": name,
                    "description": f"{name} support for {library.name}.",
                    "eligibility": eligibility,
                    "service_type": service_type,
                    "how_to_access": how_to_access,
                    "contact_info": contact,
                    "is_public": True,
                    "is_active": True,
                    "sort_order": index * 10,
                },
            )


async def seed_catalog(db, libraries: dict[str, Library]) -> None:
    main = libraries["main-campus-library"]
    for title, authors, publisher, year, resource_type, call_number, barcode, total, available, tags in CATALOG:
        await upsert_resource(
            db,
            {
                "library_id": main.id,
                "title": title,
                "authors": authors,
                "publisher": publisher,
                "publication_year": year,
                "language": "en",
                "call_number": call_number,
                "barcode": barcode,
                "resource_type": resource_type,
                "status": "available" if available > 0 else "on_loan",
                "location_shelf": "Main stacks",
                "total_copies": total,
                "available_copies": available,
                "subject_tags": tags,
                "description": f"{title} is available through the Library catalog for learning, teaching, and research support.",
                "is_loanable": resource_type not in {"journal"},
                "is_reference_only": resource_type in {"journal", "thesis"},
                "is_active": True,
            },
        )


async def seed_electronic(db, libraries: dict[str, Library]) -> None:
    digital = libraries["digital-library"]
    for spec in ELECTRONIC:
        payload = {**spec, "library_id": digital.id, "is_active": True}
        slug = payload.pop("slug")
        resource = await upsert_by_slug(db, ElectronicResource, slug, payload)
        await upsert_named(
            db,
            ElectronicResourceGuide,
            (ElectronicResourceGuide.electronic_resource_id == resource.id)
            & (ElectronicResourceGuide.title == "Getting started"),
            {
                "electronic_resource_id": resource.id,
                "title": "Getting started",
                "summary": f"Access guide for {resource.name}.",
                "access_steps": [
                    {"step": 1, "instruction": "Open the resource link from the Library portal."},
                    {"step": 2, "instruction": "Use institutional credentials or follow the registration note where required."},
                    {"step": 3, "instruction": "Contact the digital library desk if access fails."},
                ],
                "search_tips": "Start broad, then filter by year, subject, author, or document type.",
                "recommended_subjects": spec.get("subjects", []),
                "guide_type": "html",
                "is_active": True,
                "sort_order": 10,
            },
        )


async def seed_charges_regulations_stats(db, libraries: dict[str, Library]) -> None:
    main = libraries["main-campus-library"]
    charges = [
        ("Overdue fine", "overdue_fine", Decimal("10.00"), "per_day", "Fine charged per overdue day."),
        ("Photocopying", "photocopy", Decimal("5.00"), "per_page", "Standard photocopying rate."),
        ("Lost item processing", "lost_item", Decimal("1500.00"), "flat", "Administrative fee before replacement cost assessment."),
    ]
    for name, charge_type, amount, rate_unit, description in charges:
        await upsert_named(
            db,
            LibraryCharge,
            (LibraryCharge.library_id == main.id) & (LibraryCharge.name == name),
            {
                "library_id": main.id,
                "name": name,
                "description": description,
                "charge_type": charge_type,
                "amount": amount,
                "rate_unit": rate_unit,
                "currency": "KES",
                "is_active": True,
                "effective_from": date(2026, 1, 1),
            },
        )

    regulations = [
        ("Borrowing rules", "borrowing", "Borrowers must present a valid university ID. Items should be returned or renewed before the due date."),
        ("Library conduct", "conduct", "Users should maintain a quiet study environment, protect library property, and follow staff guidance."),
        ("Electronic resource access", "access", "Subscribed e-resources are for authorized academic use. Sharing credentials is not permitted."),
        ("Fees and fines", "fees", "Overdue, lost, damaged, photocopying, and printing charges are applied using the active fee schedule."),
    ]
    for title, category, content in regulations:
        await upsert_named(
            db,
            LibraryRegulation,
            (LibraryRegulation.library_id == main.id) & (LibraryRegulation.title == title),
            {
                "library_id": main.id,
                "title": title,
                "category": category,
                "content": content,
                "effective_date": date(2026, 1, 1),
                "status": "active",
            },
        )

    await upsert_named(
        db,
        LibraryStatistics,
        (LibraryStatistics.library_id == main.id)
        & (LibraryStatistics.period_type == "annual")
        & (LibraryStatistics.period_start == date(2026, 1, 1)),
        {
            "library_id": main.id,
            "period_type": "annual",
            "period_start": date(2026, 1, 1),
            "period_end": date(2026, 12, 31),
            "total_books": 42500,
            "total_journals": 320,
            "total_theses": 1800,
            "total_ebooks": 120000,
            "total_loans": 8400,
            "total_renewals": 1650,
            "total_reservations": 740,
            "total_visits": 98000,
            "fines_collected": Decimal("142500.00"),
            "currency": "KES",
            "extra": {"study_seats": 620, "training_sessions": 48},
            "notes": "Seeded annual snapshot for UI iteration.",
        },
    )


async def run() -> None:
    async with AsyncSessionLocal() as db:
        try:
            libraries = await seed_libraries(db)
            await seed_services(db, libraries)
            await seed_catalog(db, libraries)
            await seed_electronic(db, libraries)
            await seed_charges_regulations_stats(db, libraries)
            await db.commit()
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
