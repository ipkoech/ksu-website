"""Seed realistic public Library service records for UI iteration."""

from __future__ import annotations

import asyncio
import re
from decimal import Decimal
from typing import Any

from sqlalchemy import delete, select, update

from app.core.database import AsyncSessionLocal
from app.core.config import get_settings
from app.models import (
    ElectronicResource,
    ElectronicResourceGuide,
    Library,
    LibraryCharge,
    LibraryExternalLink,
    LibraryFile,
    LibraryHours,
    LibraryPolicyPage,
    LibraryRegulation,
    LibraryResource,
    LibraryService,
    LibraryStatistics,
)
from ksu_common.live_library_site import (
    LIVE_LIBRARY_BRANCHES,
    LIVE_LIBRARY_CHARGES,
    LIVE_LIBRARY_ELECTRONIC_RESOURCES,
    LIVE_LIBRARY_FILES,
    LIVE_LIBRARY_HOURS,
    LIVE_LIBRARY_REGULATIONS,
    LIVE_LIBRARY_SERVICES,
    LIVE_LIBRARY_RULES,
)
from ksu_common.internal_client import get_integration_pool


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "record"


async def upsert_by_slug(db, model, slug: str, payload: dict[str, Any]):
    normalized_slug = slugify(slug)
    result = await db.execute(select(model).where(model.slug == normalized_slug))
    row = result.scalar_one_or_none()
    if row is None:
        row = model(slug=normalized_slug, **payload)
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


CATALOG = [
    # Verified against the public Kisii University Koha OPAC on 2026-08-10.
    ("Scientific Data Management", "Arie Shoshani", "CRC Press", 2010, "book", "Q 183.9.S56 2010", "011090", 1, 1, ["electronic data processing", "data management"]),
    ("Sabina and the Mystery of the Ogre", "Christopher Okemwa", "Nsemia Inc. Publishers", 2015, "book", "PR 9199.3 .O44 2015", "000000023575", 1, 1, ["literature", "fiction"]),
    ("A Framework for Effective Information Security Risk Management in Kenyan Public Universities", "Patrick Macharia Njoroge", "Kisii University", 2020, "thesis", "THE LB 2866 .M33 2020", "000000024528", 1, 1, ["information security", "risk management", "universities"]),
    ("Developing a Model for Security Control in Web Content Management Systems", "Alex Maraga", "Kisii University", 2021, "thesis", "THE TK 5105.59 .M37 2021", "000000024091", 1, 1, ["web content management", "security controls"]),
    ("Mapambazuko ya Machweo na Hadithi Nyingine", "D. W. Lutomia; Phibbian I. Muthama", "Mountain Top Educational Publishers Limited", 2021, "book", "PL 8704 .A2 M37 2021", "000000009972", 1, 1, ["kiswahili", "short stories"]),
]

BRANCHES = LIVE_LIBRARY_BRANCHES
SERVICES = LIVE_LIBRARY_SERVICES
ELECTRONIC = LIVE_LIBRARY_ELECTRONIC_RESOURCES

LEGACY_LIBRARY_SLUGS = {"digital-library", "town-campus-library"}
LEGACY_ELECTRONIC_SLUGS = {"myloft-remote-access", "doaj", "pubmed"}


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
        if slug == "main-campus-library":
            payload["regulations"] = LIVE_LIBRARY_RULES
        libraries[slug] = await upsert_by_slug(db, Library, slug, payload)

    await db.execute(
        update(Library)
        .where(Library.slug.in_(LEGACY_LIBRARY_SLUGS))
        .values(is_active=False, is_public=False)
    )

    for library in libraries.values():
        await db.execute(delete(LibraryHours).where(LibraryHours.library_id == library.id))
        db.add_all(
            [
                LibraryHours(library_id=library.id, is_closed=False, **hours)
                for hours in LIVE_LIBRARY_HOURS[library.slug]
            ]
        )

    main = libraries["main-campus-library"]
    links = [
        ("opac", "LIBRARY CATALOGUE", "http://library.kisiiuniversity.ac.ke/", "Official Library Catalogue.", "book-open", 10),
        ("repository", "INSTITUTIONAL REPOSITORY", "http://repository.kisiiuniversity.ac.ke:8080/xmlui/", "Official Institutional Repository.", "database", 20),
        ("myloft", "MYLOFT E-RESOURCE ACCESS", "https://app.myloft.xyz/user/login?institute=cl4pou55huc740960l7k1mftg", "Access Electronic Resources off campus through MYLOFT Application.", "shield", 30),
    ]
    links.extend(
        (
            "other",
            spec["title"],
            spec["source_url"],
            spec["description"],
            "file-text",
            40 + index * 10,
        )
        for index, spec in enumerate(LIVE_LIBRARY_FILES)
    )
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

    await db.execute(
        update(LibraryExternalLink)
        .where(
            (LibraryExternalLink.library_id == main.id)
            & LibraryExternalLink.label.not_in(
                {link[1] for link in links}
            )
        )
        .values(is_active=False)
    )

    return libraries


async def seed_services(db, libraries: dict[str, Library]) -> None:
    main = libraries["main-campus-library"]
    official_slugs = set()
    for index, spec in enumerate(SERVICES, start=1):
        slug = slugify(f"{main.slug}-{spec['name']}")
        official_slugs.add(slug)
        await upsert_by_slug(
            db,
            LibraryService,
            slug,
            {
                "library_id": main.id,
                "name": spec["name"],
                "description": spec["description"],
                "eligibility": None,
                "service_type": spec["service_type"],
                "how_to_access": None,
                "contact_info": None,
                "is_public": True,
                "is_active": True,
                "sort_order": index * 10,
            },
        )

    await db.execute(
        update(LibraryService)
        .where(
            (LibraryService.library_id == main.id)
            & LibraryService.slug.not_in(official_slugs)
        )
        .values(is_public=False, is_active=False)
    )
    await db.execute(
        update(LibraryService)
        .where(
            LibraryService.library_id.in_(
                select(Library.id).where(Library.slug.in_(LEGACY_LIBRARY_SLUGS))
            )
        )
        .values(is_public=False, is_active=False)
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
    main = libraries["main-campus-library"]
    official_slugs = set()
    for spec in ELECTRONIC:
        payload = {**spec, "library_id": main.id, "is_active": True}
        slug = payload.pop("slug")
        official_slugs.add(slugify(slug))
        resource = await upsert_by_slug(db, ElectronicResource, slug, payload)
        await db.execute(
            update(ElectronicResourceGuide)
            .where(
                (ElectronicResourceGuide.electronic_resource_id == resource.id)
                & (ElectronicResourceGuide.title == "Getting started")
            )
            .values(is_active=False)
        )

    await db.execute(
        update(ElectronicResource)
        .where(
            ElectronicResource.slug.in_(LEGACY_ELECTRONIC_SLUGS)
            | (
                (ElectronicResource.library_id == main.id)
                & ElectronicResource.slug.not_in(official_slugs)
            )
        )
        .values(is_active=False)
    )
    await db.execute(
        update(ElectronicResourceGuide)
        .where(ElectronicResourceGuide.title == "Getting started")
        .values(is_active=False)
    )


async def seed_charges_regulations_stats(db, libraries: dict[str, Library]) -> None:
    main = libraries["main-campus-library"]
    for spec in LIVE_LIBRARY_CHARGES:
        await upsert_named(
            db,
            LibraryCharge,
            (LibraryCharge.library_id == main.id) & (LibraryCharge.name == spec["name"]),
            {
                "library_id": main.id,
                "name": spec["name"],
                "description": spec["description"],
                "charge_type": spec["charge_type"],
                "amount": Decimal(spec["amount"]),
                "rate_unit": spec["rate_unit"],
                "currency": "KES",
                "is_active": True,
                "effective_from": None,
            },
        )

    await db.execute(
        update(LibraryCharge)
        .where(
            (LibraryCharge.library_id == main.id)
            & LibraryCharge.name.in_(
                {"Overdue fine", "Photocopying", "Lost item processing"}
            )
        )
        .values(is_active=False)
    )

    for title, category, content in LIVE_LIBRARY_REGULATIONS:
        await upsert_named(
            db,
            LibraryRegulation,
            (LibraryRegulation.library_id == main.id) & (LibraryRegulation.title == title),
            {
                "library_id": main.id,
                "title": title,
                "category": category,
                "content": content,
                "effective_date": None,
                "status": "active",
                "is_public": True,
            },
        )

    await db.execute(
        update(LibraryRegulation)
        .where(
            (LibraryRegulation.library_id == main.id)
            & LibraryRegulation.title.in_(
                {"Borrowing rules", "Library conduct", "Electronic resource access", "Fees and fines"}
            )
        )
        .values(status="archived", is_public=False)
    )
    await db.execute(
        delete(LibraryStatistics).where(
            (LibraryStatistics.library_id == main.id)
            & (LibraryStatistics.notes == "Seeded annual snapshot for UI iteration.")
        )
    )


async def resolve_main_media_id(*, source_url: str, filename: str):
    settings = get_settings()
    response = await get_integration_pool().request_internal(
        "main-public-media",
        settings.MAIN_SERVICE_URL.rstrip("/"),
        "POST",
        "/api/v1/internal/media/resolve-by-source",
        api_key=settings.MAIN_SERVICE_API_KEY,
        json={"sources": [{"source_url": source_url, "filename": filename}]},
        timeout=5.0,
    )
    response.raise_for_status()
    body = response.json()
    matches = body.get("data") if isinstance(body, dict) else None
    if not isinstance(matches, list) or not matches:
        raise RuntimeError(f"Public Main media not found for Library file: {filename}")
    media_id = matches[0].get("media_id")
    if not media_id:
        raise RuntimeError(f"Main media resolver returned no ID for Library file: {filename}")
    return media_id


async def seed_files_and_policies(db, libraries: dict[str, Library]) -> None:
    main = libraries["main-campus-library"]
    files_by_title = {}
    for index, spec in enumerate(LIVE_LIBRARY_FILES, start=1):
        media_id = await resolve_main_media_id(
            source_url=spec["source_url"], filename=spec["media_filename"]
        )
        file_record = await upsert_named(
            db,
            LibraryFile,
            (LibraryFile.library_id == main.id) & (LibraryFile.title == spec["title"]),
            {
                "library_id": main.id,
                "media_id": media_id,
                "title": spec["title"],
                "description": spec["description"],
                "file_category": spec["file_category"],
                "access_level": "public",
                "is_public": True,
                "sort_order": index * 10,
            },
        )
        files_by_title[file_record.title] = file_record

    rules = await db.scalar(
        select(LibraryRegulation).where(
            (LibraryRegulation.library_id == main.id)
            & (LibraryRegulation.title == "General Library Rules And Regulations")
        )
    )
    rules_file = files_by_title.get("LIBRARY RULES AND REGULATIONS.pdf")
    await upsert_named(
        db,
        LibraryPolicyPage,
        (LibraryPolicyPage.library_id == main.id)
        & (LibraryPolicyPage.slug == "general-library-rules-and-regulations"),
        {
            "library_id": main.id,
            "policy_type": "conduct",
            "title": "General Library Rules And Regulations",
            "slug": "general-library-rules-and-regulations",
            "content": LIVE_LIBRARY_RULES,
            "related_regulation_id": rules.id if rules else None,
            "file_id": rules_file.id if rules_file else None,
            "is_public": True,
            "status": "active",
            "sort_order": 10,
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
            await seed_files_and_policies(db, libraries)
            await db.commit()
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
