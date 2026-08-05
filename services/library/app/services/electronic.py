"""Services for ElectronicResource, ElectronicResourceGuide, publication search, and SavedPublication."""

from __future__ import annotations

import asyncio
import uuid
from collections import defaultdict
from collections.abc import Sequence

from ksu_common.internal_client import get_integration_pool
from ksu_common.pagination import PaginatedResult, paginate
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    ElectronicResource,
    ElectronicResourceGuide,
    Library,
    SavedPublication,
)
from ..schemas import (
    CitationOut,
    ElectronicResourceCreate,
    ElectronicResourceGuideCreate,
    ElectronicResourceGuideUpdate,
    ElectronicResourceUpdate,
    PublicationResult,
    PublicationSearchQuery,
    SavedPublicationCreate,
    SavedPublicationUpdate,
)

_HTTPX_TIMEOUT = 5.0


# ── ElectronicResource ────────────────────────────────────────────────────────


def public_resource_parent_filter():
    return or_(
        ElectronicResource.library_id.is_(None),
        select(Library.id)
        .where(
            Library.id == ElectronicResource.library_id,
            Library.is_active.is_(True),
            Library.is_public.is_(True),
            Library.deleted_at.is_(None),
        )
        .exists(),
    )


async def list_resources(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    section_letter: str | None = None,
    resource_type: str | None = None,
    access_level: str | None = None,
    featured_only: bool = False,
    q: str | None = None,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    load_options: Sequence = (),
    public_only: bool = True,
) -> PaginatedResult:
    """List electronic resources with filtering."""
    query = ElectronicResource.active_query().where(
        ElectronicResource.is_active.is_(True)
    )
    if public_only:
        query = query.where(public_resource_parent_filter())
    if library_id is not None:
        query = query.where(ElectronicResource.library_id == library_id)
    if section_letter is not None:
        query = query.where(ElectronicResource.section_letter == section_letter.upper())
    if resource_type is not None:
        query = query.where(ElectronicResource.resource_type == resource_type)
    if access_level is not None:
        query = query.where(ElectronicResource.access_level == access_level)
    if featured_only:
        query = query.where(ElectronicResource.is_featured.is_(True))
    if q:
        term = f"%{q}%"
        query = query.where(ElectronicResource.name.ilike(term))
    if load_options:
        query = query.options(*load_options)
    query = query.order_by(
        ElectronicResource.section_letter,
        ElectronicResource.sort_order,
        ElectronicResource.name,
    )
    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return result


async def get_resource(
    db: AsyncSession, resource_id: uuid.UUID, *, public_only: bool = True
) -> ElectronicResource:
    """Get electronic resource entity by ID."""
    query = ElectronicResource.active_query().where(
        ElectronicResource.id == resource_id,
        ElectronicResource.is_active.is_(True),
    )
    if public_only:
        query = query.where(public_resource_parent_filter())
    result = await db.execute(query)
    row = result.scalar_one_or_none()
    if row is None:
        raise ValueError("Electronic resource not found")
    return row


async def get_resource_library_id(
    db: AsyncSession, resource_id: uuid.UUID
) -> uuid.UUID | None:
    resource = await get_resource(db, resource_id, public_only=False)
    return resource.library_id


async def get_resource_by_slug(
    db: AsyncSession, slug: str, *, public_only: bool = True
) -> ElectronicResource:
    """Get electronic resource entity by slug."""
    query = ElectronicResource.active_query().where(
        ElectronicResource.slug == slug,
        ElectronicResource.is_active.is_(True),
    )
    if public_only:
        query = query.where(public_resource_parent_filter())
    result = await db.execute(query)
    row = result.scalar_one_or_none()
    if row is None:
        raise ValueError("Electronic resource not found")
    return row


async def list_by_letter(db: AsyncSession) -> dict[str, list[ElectronicResource]]:
    """Returns active resources grouped by section_letter for A-Z page."""
    query = (
        ElectronicResource.active_query()
        .where(ElectronicResource.is_active.is_(True), public_resource_parent_filter())
        .order_by(
            ElectronicResource.section_letter,
            ElectronicResource.sort_order,
            ElectronicResource.name,
        )
    )
    result = await db.execute(query)
    rows = result.scalars().all()
    grouped: dict[str, list[ElectronicResource]] = defaultdict(list)
    for row in rows:
        grouped[row.section_letter].append(row)
    return dict(grouped)


async def create_resource(
    db: AsyncSession, data: ElectronicResourceCreate
) -> ElectronicResource:
    """Create a new electronic resource."""
    resource = ElectronicResource(**data.model_dump())
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


async def update_resource(
    db: AsyncSession, resource_id: uuid.UUID, data: ElectronicResourceUpdate
) -> ElectronicResource:
    """Update an electronic resource."""
    resource = await get_resource(db, resource_id, public_only=False)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(resource, field, value)
    await db.commit()
    await db.refresh(resource)
    return resource


async def delete_resource(db: AsyncSession, resource_id: uuid.UUID) -> None:
    """Soft-delete an electronic resource."""
    resource = await get_resource(db, resource_id, public_only=False)
    resource.soft_delete()
    await db.commit()


# ── ElectronicResourceGuide ───────────────────────────────────────────────────


async def list_guides(
    db: AsyncSession, electronic_resource_id: uuid.UUID
) -> list[ElectronicResourceGuide]:
    result = await db.execute(
        select(ElectronicResourceGuide)
        .join(
            ElectronicResource,
            ElectronicResource.id == ElectronicResourceGuide.electronic_resource_id,
        )
        .where(ElectronicResourceGuide.electronic_resource_id == electronic_resource_id)
        .where(
            ElectronicResourceGuide.deleted_at.is_(None),
            ElectronicResourceGuide.is_active.is_(True),
            ElectronicResource.is_active.is_(True),
            ElectronicResource.deleted_at.is_(None),
            public_resource_parent_filter(),
        )
        .order_by(
            ElectronicResourceGuide.sort_order, ElectronicResourceGuide.created_at
        )
    )
    return list(result.scalars().all())


async def get_guide_library_id(
    db: AsyncSession, guide_id: uuid.UUID
) -> uuid.UUID | None:
    result = await db.execute(
        select(ElectronicResource.library_id)
        .join(
            ElectronicResourceGuide,
            ElectronicResourceGuide.electronic_resource_id == ElectronicResource.id,
        )
        .where(
            ElectronicResourceGuide.id == guide_id,
            ElectronicResourceGuide.deleted_at.is_(None),
            ElectronicResource.deleted_at.is_(None),
        )
    )
    library_id = result.scalar_one_or_none()
    if library_id is None:
        guide_result = await db.execute(
            select(ElectronicResourceGuide.id).where(
                ElectronicResourceGuide.id == guide_id,
                ElectronicResourceGuide.deleted_at.is_(None),
            )
        )
        if guide_result.scalar_one_or_none() is None:
            raise ValueError("Guide not found")
    return library_id


async def create_guide(
    db: AsyncSession,
    electronic_resource_id: uuid.UUID,
    data: ElectronicResourceGuideCreate,
) -> ElectronicResourceGuide:
    guide = ElectronicResourceGuide(
        electronic_resource_id=electronic_resource_id,
        **data.model_dump(),
    )
    db.add(guide)
    await db.commit()
    await db.refresh(guide)
    return guide


async def update_guide(
    db: AsyncSession, guide_id: uuid.UUID, data: ElectronicResourceGuideUpdate
) -> ElectronicResourceGuide:
    result = await db.execute(
        select(ElectronicResourceGuide)
        .where(ElectronicResourceGuide.id == guide_id)
        .where(ElectronicResourceGuide.deleted_at.is_(None))
    )
    guide = result.scalar_one_or_none()
    if guide is None:
        raise ValueError("Guide not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(guide, field, value)
    await db.commit()
    await db.refresh(guide)
    return guide


async def delete_guide(db: AsyncSession, guide_id: uuid.UUID) -> None:
    result = await db.execute(
        select(ElectronicResourceGuide)
        .where(ElectronicResourceGuide.id == guide_id)
        .where(ElectronicResourceGuide.deleted_at.is_(None))
    )
    guide = result.scalar_one_or_none()
    if guide is None:
        raise ValueError("Guide not found")
    guide.soft_delete()
    await db.commit()


# ── Publication search ────────────────────────────────────────────────────────


async def _search_internal(
    q: str,
    author: str | None,
    year: int | None,
    page: int,
    per_page: int,
) -> list[PublicationResult]:
    return []


async def _search_crossref(
    q: str,
    author: str | None,
    year: int | None,
    page: int,
    per_page: int,
) -> list[PublicationResult]:
    params: dict = {"query": q, "rows": per_page, "offset": (page - 1) * per_page}
    if author:
        params["query.author"] = author
    if year:
        params["filter"] = f"from-pub-date:{year},until-pub-date:{year}"
    resp = await get_integration_pool().request(
        "crossref", "https://api.crossref.org", "GET", "/works", params=params
    )
    resp.raise_for_status()
    items = resp.json().get("message", {}).get("items", [])
    results = []
    for item in items:
        authors = []
        for a in item.get("author", []):
            name_parts = [a.get("given", ""), a.get("family", "")]
            authors.append(" ".join(p for p in name_parts if p).strip())
        doi = item.get("DOI")
        results.append(
            PublicationResult(
                source="crossref",
                external_id=doi,
                title=(item.get("title") or [""])[0],
                authors=authors,
                journal=(item.get("container-title") or [None])[0],
                year=(item.get("published", {}).get("date-parts") or [[None]])[0][0],
                doi=doi,
                url=item.get("URL"),
                abstract=item.get("abstract"),
                is_open_access=item.get("is-referenced-by-count") is not None
                and item.get("license") is not None,
            )
        )
    return results


async def _search_openalex(
    q: str,
    author: str | None,
    year: int | None,
    page: int,
    per_page: int,
) -> list[PublicationResult]:
    params: dict = {"search": q, "per-page": per_page, "page": page}
    if year:
        params["filter"] = f"publication_year:{year}"
    resp = await get_integration_pool().request(
        "openalex", "https://api.openalex.org", "GET", "/works", params=params
    )
    resp.raise_for_status()
    items = resp.json().get("results", [])
    results = []
    for item in items:
        authors = [
            a.get("author", {}).get("display_name", "")
            for a in item.get("authorships", [])
        ]
        doi = item.get("doi", "").replace("https://doi.org/", "") or None
        results.append(
            PublicationResult(
                source="openalex",
                external_id=item.get("id"),
                title=item.get("title") or "",
                authors=[a for a in authors if a],
                journal=item.get("primary_location", {})
                .get("source", {})
                .get("display_name"),
                year=item.get("publication_year"),
                doi=doi,
                url=item.get("doi") or item.get("landing_page_url"),
                abstract=item.get("abstract"),
                is_open_access=item.get("open_access", {}).get("is_oa"),
            )
        )
    return results


async def _search_pubmed(
    q: str,
    author: str | None,
    year: int | None,
    page: int,
    per_page: int,
) -> list[PublicationResult]:
    search_term = q
    if author:
        search_term += f" {author}[Author]"
    if year:
        search_term += f" {year}[PDAT]"
    esearch_params = {
        "db": "pubmed",
        "term": search_term,
        "retmax": per_page,
        "retstart": (page - 1) * per_page,
        "retmode": "json",
    }
    pool = get_integration_pool()
    esearch = await pool.request(
        "pubmed",
        "https://eutils.ncbi.nlm.nih.gov",
        "GET",
        "/entrez/eutils/esearch.fcgi",
        params=esearch_params,
    )
    esearch.raise_for_status()
    ids = esearch.json().get("esearchresult", {}).get("idlist", [])
    if not ids:
        return []
    efetch = await pool.request(
        "pubmed",
        "https://eutils.ncbi.nlm.nih.gov",
        "GET",
        "/entrez/eutils/esummary.fcgi",
        params={"db": "pubmed", "id": ",".join(ids), "retmode": "json"},
    )
    efetch.raise_for_status()
    result_map = efetch.json().get("result", {})
    results = []
    for pmid in ids:
        item = result_map.get(pmid, {})
        authors = [a.get("name", "") for a in item.get("authors", [])]
        results.append(
            PublicationResult(
                source="pubmed",
                external_id=pmid,
                title=item.get("title") or "",
                authors=[a for a in authors if a],
                journal=item.get("source"),
                year=int(item["pubdate"][:4])
                if item.get("pubdate") and item["pubdate"][:4].isdigit()
                else None,
                doi=item.get("elocationid", "").replace("doi: ", "") or None,
                url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                abstract=None,
                is_open_access=None,
            )
        )
    return results


async def _search_doaj(
    q: str,
    author: str | None,
    year: int | None,
    page: int,
    per_page: int,
) -> list[PublicationResult]:
    resp = await get_integration_pool().request(
        "doaj",
        "https://doaj.org",
        "GET",
        "/api/search/articles/" + q,
        params={"pageSize": per_page, "page": page},
    )
    resp.raise_for_status()
    items = resp.json().get("results", [])
    results = []
    for item in items:
        bib = item.get("bibjson", {})
        authors = [a.get("name", "") for a in bib.get("author", [])]
        year_val = None
        if bib.get("year"):
            try:
                year_val = int(bib["year"])
            except (ValueError, TypeError):
                pass
        doi = next(
            (i.get("id") for i in bib.get("identifier", []) if i.get("type") == "doi"),
            None,
        )
        results.append(
            PublicationResult(
                source="doaj",
                external_id=item.get("id"),
                title=bib.get("title") or "",
                authors=[a for a in authors if a],
                journal=bib.get("journal", {}).get("title"),
                year=year_val,
                doi=doi,
                url=next(
                    (
                        l.get("url")
                        for l in bib.get("link", [])
                        if l.get("type") == "fulltext"
                    ),
                    None,
                ),
                abstract=bib.get("abstract"),
                is_open_access=True,
            )
        )
    return results


_SOURCE_FUNCS = {
    "internal": _search_internal,
    "crossref": _search_crossref,
    "openalex": _search_openalex,
    "pubmed": _search_pubmed,
    "doaj": _search_doaj,
}


async def search_publications(query: PublicationSearchQuery) -> dict:
    source = query.source or "all"
    if source == "all":
        active_sources = list(_SOURCE_FUNCS.keys())
    else:
        active_sources = [source]

    tasks = [
        _SOURCE_FUNCS[src](
            query.q, query.author, query.year, query.page, query.per_page
        )
        for src in active_sources
    ]
    outcomes = await asyncio.gather(*tasks, return_exceptions=True)

    all_results: list[PublicationResult] = []
    queried: list[str] = []
    for src, outcome in zip(active_sources, outcomes):
        if isinstance(outcome, Exception):
            continue
        queried.append(src)
        all_results.extend(outcome)

    return {
        "results": all_results,
        "sources_queried": queried,
        "total": len(all_results),
    }


# ── Citation formatters ───────────────────────────────────────────────────────


def _fmt_authors_apa(authors: list[str]) -> str:
    if not authors:
        return ""
    formatted = []
    for name in authors:
        parts = name.strip().split()
        if len(parts) >= 2:
            last = parts[-1]
            initials = " ".join(p[0].upper() + "." for p in parts[:-1])
            formatted.append(f"{last}, {initials}")
        else:
            formatted.append(name)
    if len(formatted) == 1:
        return formatted[0]
    return ", & ".join([", ".join(formatted[:-1]), formatted[-1]])


async def format_citation(pub: PublicationResult, style: str) -> CitationOut:
    authors = pub.authors or []
    title = pub.title or ""
    journal = pub.journal or ""
    year = str(pub.year) if pub.year else "n.d."
    doi_str = f"https://doi.org/{pub.doi}" if pub.doi else (pub.url or "")

    if style == "apa7":
        author_str = _fmt_authors_apa(authors) or "Unknown Author"
        parts = [f"{author_str} ({year}). {title}."]
        if journal:
            parts.append(f" {journal}.")
        if doi_str:
            parts.append(f" {doi_str}")
        formatted = "".join(parts)

    elif style == "mla9":
        if authors:
            first = authors[0].strip().split()
            if len(first) >= 2:
                lead = f"{first[-1]}, {' '.join(first[:-1])}"
            else:
                lead = authors[0]
            et_al = ", et al." if len(authors) > 1 else ""
            author_str = f"{lead}{et_al}"
        else:
            author_str = ""
        parts = []
        if author_str:
            parts.append(f"{author_str}. ")
        parts.append(f'"{title}."')
        if journal:
            parts.append(f" {journal},")
        parts.append(f" {year}.")
        if doi_str:
            parts.append(f" {doi_str}.")
        formatted = "".join(parts)

    elif style == "chicago17":
        if authors:
            first = authors[0].strip().split()
            if len(first) >= 2:
                lead = f"{first[-1]}, {' '.join(first[:-1])}"
            else:
                lead = authors[0]
            rest = ", ".join(authors[1:])
            author_str = f"{lead}" + (f", {rest}" if rest else "")
        else:
            author_str = ""
        parts = []
        if author_str:
            parts.append(f"{author_str}. ")
        parts.append(f'"{title}."')
        if journal:
            parts.append(f" {journal}")
        parts.append(f" ({year}).")
        if doi_str:
            parts.append(f" {doi_str}.")
        formatted = "".join(parts)

    elif style == "harvard":
        if authors:
            formatted_authors = []
            for name in authors:
                parts_name = name.strip().split()
                if len(parts_name) >= 2:
                    last = parts_name[-1]
                    initials = "".join(p[0].upper() + "." for p in parts_name[:-1])
                    formatted_authors.append(f"{last}, {initials}")
                else:
                    formatted_authors.append(name)
            author_str = (
                " and ".join(formatted_authors)
                if len(formatted_authors) <= 2
                else formatted_authors[0] + " et al."
            )
        else:
            author_str = ""
        parts = []
        if author_str:
            parts.append(f"{author_str} ")
        parts.append(f"({year}). '{title}'.")
        if journal:
            parts.append(f" {journal}.")
        if doi_str:
            parts.append(f" {doi_str}.")
        formatted = "".join(parts)

    elif style == "vancouver":
        if authors:
            formatted_authors = []
            for name in authors:
                parts_name = name.strip().split()
                if len(parts_name) >= 2:
                    last = parts_name[-1]
                    initials = "".join(p[0].upper() for p in parts_name[:-1])
                    formatted_authors.append(f"{last} {initials}")
                else:
                    formatted_authors.append(name)
            author_str = ", ".join(formatted_authors)
        else:
            author_str = ""
        parts = []
        if author_str:
            parts.append(f"{author_str}. ")
        parts.append(f"{title}.")
        if journal:
            parts.append(f" {journal}.")
        parts.append(f" {year}.")
        if doi_str:
            parts.append(f" {doi_str}.")
        formatted = "".join(parts)

    else:
        raise ValueError(f"Unsupported citation style: {style}")

    return CitationOut(style=style, formatted=formatted)


# ── SavedPublication ──────────────────────────────────────────────────────────


async def save_publication(
    db: AsyncSession, person_id: uuid.UUID, data: SavedPublicationCreate
) -> SavedPublication:
    pub = SavedPublication(person_id=person_id, **data.model_dump())
    db.add(pub)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ValueError("Already saved")
    await db.refresh(pub)
    return pub


async def unsave_publication(
    db: AsyncSession, saved_id: uuid.UUID, person_id: uuid.UUID
) -> None:
    result = await db.execute(
        select(SavedPublication).where(SavedPublication.id == saved_id)
    )
    pub = result.scalar_one_or_none()
    if pub is None:
        raise ValueError("Saved publication not found")
    if pub.person_id != person_id:
        raise PermissionError("Cannot delete another user's saved publication")
    await db.delete(pub)
    await db.commit()


async def list_saved(
    db: AsyncSession,
    person_id: uuid.UUID,
    *,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
) -> PaginatedResult:
    query = (
        select(SavedPublication)
        .where(SavedPublication.person_id == person_id)
        .order_by(SavedPublication.created_at.desc())
    )
    return await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )


async def update_saved(
    db: AsyncSession,
    saved_id: uuid.UUID,
    person_id: uuid.UUID,
    data: SavedPublicationUpdate,
) -> SavedPublication:
    result = await db.execute(
        select(SavedPublication).where(SavedPublication.id == saved_id)
    )
    pub = result.scalar_one_or_none()
    if pub is None:
        raise ValueError("Saved publication not found")
    if pub.person_id != person_id:
        raise PermissionError("Cannot update another user's saved publication")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pub, field, value)
    await db.commit()
    await db.refresh(pub)
    return pub
