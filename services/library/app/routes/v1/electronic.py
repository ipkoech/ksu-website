"""Routes for ElectronicResource, ElectronicResourceGuide, publication search, and SavedPublication."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload, get_optional_user
from ksu_common.rbac import has_scope, requires_scope
from ksu_common.schemas.responses import success
from ksu_common.field_selection import FieldSelection, FieldsQuery, FieldSelector
from ksu_common.cache import cached_public, cache_response, invalidate_prefix
from ksu_common.audit import audit_action
from ksu_common.rate_limit import rate_limit

from ...core.database import get_db
from ...models import ElectronicResource
from ...schemas import (
    CitationRequest,
    ElectronicResourceCreate,
    ElectronicResourceDetail,
    ElectronicResourceGuideCreate,
    ElectronicResourceGuideOut,
    ElectronicResourceGuideUpdate,
    ElectronicResourceOut,
    ElectronicResourceUpdate,
    PublicationResult,
    PublicationSearchQuery,
    SavedPublicationCreate,
    SavedPublicationOut,
    SavedPublicationUpdate,
)
from ...services.electronic import (
    create_guide,
    create_resource,
    delete_guide,
    delete_resource,
    format_citation,
    get_resource,
    get_resource_by_slug,
    list_by_letter,
    list_guides,
    list_resources,
    list_saved,
    save_publication,
    search_publications,
    unsave_publication,
    update_guide,
    update_resource,
    update_saved,
)

# ── Electronic resources router ───────────────────────────────────────────────

resources_router = APIRouter(
    prefix="/library/databases", tags=["Library – Electronic Resources"]
)


async def invalidate_public_library_cache() -> None:
    await invalidate_prefix("public")


@resources_router.get("/az")
@cached_public(timeout=3600, vary_on=())
async def list_resources_az(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all electronic resources grouped by first letter (A-Z listing)."""
    grouped = await list_by_letter(db)
    data = {
        letter: [ElectronicResourceOut.model_validate(r).model_dump() for r in items]
        for letter, items in sorted(grouped.items())
    }
    return success(data=data)


@resources_router.get("/slug/{slug}")
async def get_resource_by_slug_route(
    request: Request,
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload | None = Depends(get_optional_user),
    fields: FieldSelection = Depends(FieldsQuery(always_include={"id"})),
):
    """Get electronic resource by slug with guides."""
    is_writer = user is not None and has_scope(user.roles, "library:write")
    resource = await get_resource_by_slug(db, slug, public_only=not is_writer)
    guides = await list_guides(db, resource.id)
    detail = ElectronicResourceDetail.model_validate(resource)
    detail.guides = [ElectronicResourceGuideOut.model_validate(g) for g in guides]

    selector = FieldSelector(ElectronicResource, fields, always_include={"id"})
    return success(data=selector.apply(detail))


@resources_router.get("/{resource_id}")
async def get_resource_detail(
    request: Request,
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload | None = Depends(get_optional_user),
    fields: FieldSelection = Depends(FieldsQuery(always_include={"id"})),
):
    """Get electronic resource by ID with guides."""
    is_writer = user is not None and has_scope(user.roles, "library:write")
    resource = await get_resource(db, resource_id, public_only=not is_writer)
    guides = await list_guides(db, resource.id)
    detail = ElectronicResourceDetail.model_validate(resource)
    detail.guides = [ElectronicResourceGuideOut.model_validate(g) for g in guides]

    selector = FieldSelector(ElectronicResource, fields, always_include={"id"})
    return success(data=selector.apply(detail))


@resources_router.get("/")
async def list_resources_route(
    request: Request,
    library_id: Optional[uuid.UUID] = Query(None),
    section_letter: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    access_level: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    user: TokenPayload | None = Depends(get_optional_user),
    fields: FieldSelection = Depends(FieldsQuery(always_include={"id"})),
):
    """List electronic resources with filtering."""
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(ElectronicResource, fields, always_include={"id"})
    result = await list_resources(
        db,
        library_id=library_id,
        section_letter=section_letter,
        resource_type=resource_type,
        access_level=access_level,
        featured_only=featured or False,
        q=q,
        page=page,
        per_page=per_page,
        include_total=include_total,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(
        data=selector.apply(result.items),
        meta=result.meta,
    )


@resources_router.post("/", status_code=201)
@audit_action(
    "electronic_resource.create", target_type="ElectronicResource", include_body=True
)
async def create_resource_route(
    request: Request,
    body: ElectronicResourceCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:write")),
):
    """Create a new electronic resource."""
    resource = await create_resource(db, body)
    await invalidate_public_library_cache()
    return success(
        data=ElectronicResourceOut.model_validate(resource).model_dump(),
        message="Created",
    )


@resources_router.patch("/{resource_id}")
@audit_action(
    "electronic_resource.update",
    target_type="ElectronicResource",
    target_id_param="resource_id",
)
async def update_resource_route(
    request: Request,
    resource_id: uuid.UUID,
    body: ElectronicResourceUpdate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:write")),
):
    """Update an electronic resource."""
    resource = await update_resource(db, resource_id, body)
    await invalidate_public_library_cache()
    return success(data=ElectronicResourceOut.model_validate(resource).model_dump())


@resources_router.delete("/{resource_id}", status_code=204)
@audit_action(
    "electronic_resource.delete",
    target_type="ElectronicResource",
    target_id_param="resource_id",
)
async def delete_resource_route(
    request: Request,
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:admin")),
):
    """Delete an electronic resource."""
    await delete_resource(db, resource_id)
    await invalidate_public_library_cache()


# ── Guides sub-router ─────────────────────────────────────────────────────────

guides_router = APIRouter(
    prefix="/library/databases/{resource_id}/guides",
    tags=["Library – Electronic Resource Guides"],
)


@guides_router.get("/")
@cached_public(timeout=300, vary_on=())
async def list_guides_route(
    request: Request,
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List guides for an electronic resource."""
    guides = await list_guides(db, resource_id)
    return success(
        data=[ElectronicResourceGuideOut.model_validate(g).model_dump() for g in guides]
    )


@guides_router.post("/", status_code=201)
@audit_action(
    "electronic_guide.create", target_type="ElectronicResourceGuide", include_body=True
)
async def create_guide_route(
    request: Request,
    resource_id: uuid.UUID,
    body: ElectronicResourceGuideCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:write")),
):
    """Create a guide for an electronic resource."""
    guide = await create_guide(db, resource_id, body)
    await invalidate_public_library_cache()
    return success(
        data=ElectronicResourceGuideOut.model_validate(guide).model_dump(),
        message="Created",
    )


@guides_router.patch("/{guide_id}")
@audit_action(
    "electronic_guide.update",
    target_type="ElectronicResourceGuide",
    target_id_param="guide_id",
)
async def update_guide_route(
    request: Request,
    resource_id: uuid.UUID,
    guide_id: uuid.UUID,
    body: ElectronicResourceGuideUpdate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:write")),
):
    """Update an electronic resource guide."""
    guide = await update_guide(db, guide_id, body)
    await invalidate_public_library_cache()
    return success(data=ElectronicResourceGuideOut.model_validate(guide).model_dump())


@guides_router.delete("/{guide_id}", status_code=204)
@audit_action(
    "electronic_guide.delete",
    target_type="ElectronicResourceGuide",
    target_id_param="guide_id",
)
async def delete_guide_route(
    request: Request,
    resource_id: uuid.UUID,
    guide_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:admin")),
):
    """Delete an electronic resource guide."""
    await delete_guide(db, guide_id)
    await invalidate_public_library_cache()


# ── Publications router ───────────────────────────────────────────────────────

publications_router = APIRouter(
    prefix="/library/publications", tags=["Library – Publications"]
)


@publications_router.get("/search")
@rate_limit(requests=30, window=60, by_user=False)
@cached_public(
    timeout=60, vary_on=("q", "author", "year", "source", "page", "per_page")
)
async def search_publications_route(
    request: Request,
    q: str = Query(...),
    author: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    source: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Search external publication databases (CrossRef, PubMed, etc.)."""
    query = PublicationSearchQuery(
        q=q, author=author, year=year, source=source, page=page, per_page=per_page
    )
    result = await search_publications(query)
    return success(
        data=[r.model_dump() for r in result["results"]],
        meta={"total": result["total"], "sources_queried": result["sources_queried"]},
    )


@publications_router.post("/cite")
@rate_limit(requests=60, window=60, by_user=False)
async def cite_publication(request: Request, body: CitationRequest):
    """Format a publication citation in various styles (APA, MLA, Chicago, etc.)."""
    citation = await format_citation(body.publication, body.style)
    return success(data=citation.model_dump())


@publications_router.get("/saved")
@cache_response(timeout=60, vary_on=("page", "per_page", "include_total"))
async def list_saved_publications(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:read")),
):
    """List user's saved publications."""
    person_id = uuid.UUID(user.sub)
    result = await list_saved(
        db,
        person_id,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return success(
        data=[SavedPublicationOut.model_validate(p).model_dump() for p in result.items],
        meta=result.meta,
    )


@publications_router.post("/saved", status_code=201)
@audit_action("publication.save", target_type="SavedPublication", include_body=True)
async def save_publication_route(
    request: Request,
    body: SavedPublicationCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:read")),
):
    """Save a publication to user's reading list."""
    person_id = uuid.UUID(user.sub)
    pub = await save_publication(db, person_id, body)
    return success(
        data=SavedPublicationOut.model_validate(pub).model_dump(), message="Saved"
    )


@publications_router.patch("/saved/{saved_id}")
@audit_action(
    "publication.update_saved",
    target_type="SavedPublication",
    target_id_param="saved_id",
)
async def update_saved_publication(
    request: Request,
    saved_id: uuid.UUID,
    body: SavedPublicationUpdate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:read")),
):
    """Update a saved publication (notes, reading status)."""
    person_id = uuid.UUID(user.sub)
    pub = await update_saved(db, saved_id, person_id, body)
    return success(data=SavedPublicationOut.model_validate(pub).model_dump())


@publications_router.delete("/saved/{saved_id}", status_code=204)
@audit_action(
    "publication.unsave", target_type="SavedPublication", target_id_param="saved_id"
)
async def unsave_publication_route(
    request: Request,
    saved_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library:read")),
):
    """Remove a publication from user's saved list."""
    person_id = uuid.UUID(user.sub)
    await unsave_publication(db, saved_id, person_id)


# ── Combined router exported for registration ─────────────────────────────────

router = APIRouter()
router.include_router(resources_router)
router.include_router(guides_router)
router.include_router(publications_router)
