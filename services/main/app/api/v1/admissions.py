"""Admission information endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import (
    AdmissionDocument,
    AdmissionFaq,
    AdmissionInfo,
    AdmissionPageSection,
    AdmissionPathway,
    AdmissionRequirement,
    ProgrammeFeeStructure,
)
from ...schemas import (
    AdmissionDocumentCreate,
    AdmissionDocumentUpdate,
    AdmissionFaqCreate,
    AdmissionFaqUpdate,
    AdmissionInfoCreate,
    AdmissionInfoUpdate,
    AdmissionPageSectionCreate,
    AdmissionPageSectionUpdate,
    AdmissionPathwayCreate,
    AdmissionPathwayUpdate,
    AdmissionRequirementCreate,
    AdmissionRequirementUpdate,
    ProgrammeFeeStructureCreate,
    ProgrammeFeeStructureUpdate,
)
from ...services import (
    AdmissionDocumentService,
    AdmissionFaqService,
    AdmissionInfoService,
    AdmissionPageSectionService,
    AdmissionPathwayService,
    AdmissionRequirementService,
    ProgrammeFeeStructureService,
)

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "content_type", "audience_level", "school_id", "fields", "include"))
async def list_admission_info(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = None,
    audience_level: str | None = None,
    school_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionInfo, fields)
    result = await AdmissionInfoService.list(
        db,
        page=page,
        per_page=per_page,
        content_type=content_type,
        audience_level=audience_level,
        school_id=school_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin", dependencies=[Depends(require_scope("academic:write"))])
async def list_admin_admission_info(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = None,
    audience_level: str | None = None,
    school_id: uuid.UUID | None = None,
    is_published: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionInfo, fields)
    result = await AdmissionInfoService.list(
        db,
        page=page,
        per_page=per_page,
        content_type=content_type,
        audience_level=audience_level,
        school_id=school_id,
        is_published=is_published,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/pathways")
@cached_public(timeout=300, vary_on=("page", "per_page", "applicant_type", "fields", "include"))
async def list_admission_pathways(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    applicant_type: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionPathway, fields)
    result = await AdmissionPathwayService.list(
        db,
        page=page,
        per_page=per_page,
        applicant_type=applicant_type,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/pathways/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_admission_pathway(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionPathway, fields)
    item = await AdmissionPathwayService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission pathway not found")
    return success(data=selector.apply(item))


@router.post("/pathways", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_pathway(data: AdmissionPathwayCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionPathwayService.create(db, **data.model_dump())
    return success(data=item, message="Admission pathway created")


@router.patch("/pathways/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_pathway(item_id: uuid.UUID, data: AdmissionPathwayUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionPathwayService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission pathway not found")
    item = await AdmissionPathwayService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission pathway updated")


@router.delete("/pathways/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_pathway(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionPathwayService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission pathway not found")
    await AdmissionPathwayService.delete(db, item)


@router.get("/requirements")
@cached_public(timeout=300, vary_on=("page", "per_page", "programme_id", "school_id", "intake_id", "pathway_id", "applicant_type", "level", "fields", "include"))
async def list_admission_requirements(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    programme_id: uuid.UUID | None = None,
    school_id: uuid.UUID | None = None,
    intake_id: uuid.UUID | None = None,
    pathway_id: uuid.UUID | None = None,
    applicant_type: str | None = None,
    level: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionRequirement, fields)
    result = await AdmissionRequirementService.list(
        db,
        page=page,
        per_page=per_page,
        programme_id=programme_id,
        school_id=school_id,
        intake_id=intake_id,
        pathway_id=pathway_id,
        applicant_type=applicant_type,
        level=level,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/requirements/{item_id}")
async def get_admission_requirement(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionRequirement, fields)
    item = await AdmissionRequirementService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission requirement not found")
    return success(data=selector.apply(item))


@router.post("/requirements", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_requirement(data: AdmissionRequirementCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionRequirementService.create(db, **data.model_dump())
    return success(data=item, message="Admission requirement created")


@router.patch("/requirements/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_requirement(item_id: uuid.UUID, data: AdmissionRequirementUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionRequirementService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission requirement not found")
    item = await AdmissionRequirementService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission requirement updated")


@router.delete("/requirements/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_requirement(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionRequirementService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission requirement not found")
    await AdmissionRequirementService.delete(db, item)


@router.get("/fee-structures")
@cached_public(timeout=300, vary_on=("page", "per_page", "programme_id", "intake_id", "applicant_type", "fee_category", "fields", "include"))
async def list_programme_fee_structures(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    programme_id: uuid.UUID | None = None,
    intake_id: uuid.UUID | None = None,
    applicant_type: str | None = None,
    fee_category: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ProgrammeFeeStructure, fields)
    result = await ProgrammeFeeStructureService.list(
        db,
        page=page,
        per_page=per_page,
        programme_id=programme_id,
        intake_id=intake_id,
        applicant_type=applicant_type,
        fee_category=fee_category,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/fee-structures/{item_id}")
async def get_programme_fee_structure(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(ProgrammeFeeStructure, fields)
    item = await ProgrammeFeeStructureService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Programme fee structure not found")
    return success(data=selector.apply(item))


@router.post("/fee-structures", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_programme_fee_structure(data: ProgrammeFeeStructureCreate, db: DbSession, _: CurrentUser):
    item = await ProgrammeFeeStructureService.create(db, **data.model_dump())
    return success(data=item, message="Programme fee structure created")


@router.patch("/fee-structures/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_programme_fee_structure(item_id: uuid.UUID, data: ProgrammeFeeStructureUpdate, db: DbSession, _: CurrentUser):
    item = await ProgrammeFeeStructureService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Programme fee structure not found")
    item = await ProgrammeFeeStructureService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Programme fee structure updated")


@router.delete("/fee-structures/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_programme_fee_structure(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await ProgrammeFeeStructureService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Programme fee structure not found")
    await ProgrammeFeeStructureService.delete(db, item)


@router.get("/documents")
@cached_public(timeout=300, vary_on=("page", "per_page", "document_type", "applicant_type", "pathway_id", "programme_id", "intake_id", "fields", "include"))
async def list_admission_documents(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    document_type: str | None = None,
    applicant_type: str | None = None,
    pathway_id: uuid.UUID | None = None,
    programme_id: uuid.UUID | None = None,
    intake_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionDocument, fields)
    result = await AdmissionDocumentService.list(
        db,
        page=page,
        per_page=per_page,
        document_type=document_type,
        applicant_type=applicant_type,
        pathway_id=pathway_id,
        programme_id=programme_id,
        intake_id=intake_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/documents/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_admission_document(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionDocument, fields)
    item = await AdmissionDocumentService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission document not found")
    return success(data=selector.apply(item))


@router.post("/documents", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_document(data: AdmissionDocumentCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionDocumentService.create(db, **data.model_dump())
    return success(data=item, message="Admission document created")


@router.patch("/documents/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_document(item_id: uuid.UUID, data: AdmissionDocumentUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionDocumentService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission document not found")
    item = await AdmissionDocumentService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission document updated")


@router.delete("/documents/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_document(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionDocumentService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission document not found")
    await AdmissionDocumentService.delete(db, item)


@router.get("/faqs")
@cached_public(timeout=300, vary_on=("page", "per_page", "category", "applicant_type", "pathway_id", "fields", "include"))
async def list_admission_faqs(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str | None = None,
    applicant_type: str | None = None,
    pathway_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionFaq, fields)
    result = await AdmissionFaqService.list(
        db,
        page=page,
        per_page=per_page,
        category=category,
        applicant_type=applicant_type,
        pathway_id=pathway_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/faqs/{item_id}")
async def get_admission_faq(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionFaq, fields)
    item = await AdmissionFaqService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission FAQ not found")
    return success(data=selector.apply(item))


@router.post("/faqs", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_faq(data: AdmissionFaqCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionFaqService.create(db, **data.model_dump())
    return success(data=item, message="Admission FAQ created")


@router.patch("/faqs/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_faq(item_id: uuid.UUID, data: AdmissionFaqUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionFaqService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission FAQ not found")
    item = await AdmissionFaqService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission FAQ updated")


@router.delete("/faqs/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_faq(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionFaqService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission FAQ not found")
    await AdmissionFaqService.delete(db, item)


@router.get("/page-sections")
@cached_public(timeout=300, vary_on=("page", "per_page", "page_key", "fields", "include"))
async def list_admission_page_sections(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    page_key: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionPageSection, fields)
    result = await AdmissionPageSectionService.list(
        db,
        page=page,
        per_page=per_page,
        page_key=page_key,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/page-sections/{item_id}")
async def get_admission_page_section(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionPageSection, fields)
    item = await AdmissionPageSectionService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission page section not found")
    return success(data=selector.apply(item))


@router.post("/page-sections", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_page_section(data: AdmissionPageSectionCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionPageSectionService.create(db, **data.model_dump())
    return success(data=item, message="Admission page section created")


@router.patch("/page-sections/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_page_section(item_id: uuid.UUID, data: AdmissionPageSectionUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionPageSectionService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission page section not found")
    item = await AdmissionPageSectionService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission page section updated")


@router.delete("/page-sections/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_page_section(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionPageSectionService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission page section not found")
    await AdmissionPageSectionService.delete(db, item)


@router.get("/id/{item_id}")
async def get_admission_info_by_id(item_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionInfo, fields)
    item = await AdmissionInfoService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_admission_info(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionInfo, fields)
    item = await AdmissionInfoService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_info(data: AdmissionInfoCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionInfoService.create(db, **data.model_dump())
    return success(data=item, message="Admission information created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_info(item_id: uuid.UUID, data: AdmissionInfoUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionInfoService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    item = await AdmissionInfoService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission information updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_info(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionInfoService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    await AdmissionInfoService.delete(db, item)
