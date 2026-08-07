"""Routes for library guides, specialists, workflows, and policy pages."""

from __future__ import annotations

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.audit import audit_action
from ksu_common.auth import TokenPayload
from ksu_common.cache import invalidate_prefix
from ksu_common.field_selection import FieldSelection, FieldSelector, FieldsQuery
from ksu_contracts.rbac import has_scope
from ksu_common.schemas.responses import success

from ...core.auth import get_optional_user, requires_scope
from ...core.database import get_db
from ...models import (
    LibraryGuide,
    LibraryGuideSection,
    LibraryPolicyPage,
    LibrarySpecialist,
    LibraryWorkflow,
    LibraryWorkflowStep,
)
from ...schemas import (
    LibraryGuideCreate,
    LibraryGuideOut,
    LibraryGuideSectionCreate,
    LibraryGuideSectionOut,
    LibraryGuideSectionUpdate,
    LibraryGuideUpdate,
    LibraryPolicyPageCreate,
    LibraryPolicyPageOut,
    LibraryPolicyPageUpdate,
    LibrarySpecialistCreate,
    LibrarySpecialistOut,
    LibrarySpecialistUpdate,
    LibraryWorkflowCreate,
    LibraryWorkflowOut,
    LibraryWorkflowStepCreate,
    LibraryWorkflowStepOut,
    LibraryWorkflowStepUpdate,
    LibraryWorkflowUpdate,
)
from ...services import guides as svc


async def invalidate_public_library_cache() -> None:
    await invalidate_prefix("public")


guides_router = APIRouter(prefix="/library/guides", tags=["Library Guides"])
guide_sections_router = APIRouter(
    prefix="/library/guide-sections", tags=["Library Guide Sections"]
)


@guides_router.get("/")
async def list_guides(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    guide_type: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    course_code: Optional[str] = Query(None),
    audience: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryGuide, fields, always_include={"id"})
    result = await svc.list_guides(
        db,
        library_id=library_id,
        guide_type=guide_type,
        subject=subject,
        course_code=course_code,
        audience=audience,
        page=page,
        per_page=per_page,
        include_total=include_total,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@guides_router.get("/{slug}")
async def get_guide(
    request: Request,
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryGuide, fields, always_include={"id"})
    guide = await svc.get_guide_by_slug(
        db,
        slug,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(guide))


@guides_router.get("/records/{guide_id}")
async def get_guide_record(
    request: Request,
    guide_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    selector = FieldSelector(LibraryGuide, fields, always_include={"id"})
    guide = await svc.get_guide_entity(db, guide_id)
    return success(data=selector.apply(guide))


@guides_router.post("/", status_code=201)
@audit_action("guide.create", target_type="LibraryGuide", include_body=True)
async def create_guide(
    request: Request,
    body: LibraryGuideCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    guide = await svc.create_guide(db, body)
    await invalidate_public_library_cache()
    return success(
        data=LibraryGuideOut.model_validate(guide).model_dump(),
        message="Guide created",
    )


@guides_router.patch("/{guide_id}")
@audit_action("guide.update", target_type="LibraryGuide", target_id_param="guide_id")
async def update_guide(
    request: Request,
    guide_id: uuid.UUID,
    body: LibraryGuideUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    guide = await svc.update_guide(db, guide_id, body)
    await invalidate_public_library_cache()
    return success(data=LibraryGuideOut.model_validate(guide).model_dump())


@guides_router.delete("/{guide_id}", status_code=204)
@audit_action("guide.delete", target_type="LibraryGuide", target_id_param="guide_id")
async def delete_guide(
    request: Request,
    guide_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_guide(db, guide_id)
    await invalidate_public_library_cache()


@guide_sections_router.get("/")
async def list_guide_sections(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    guide_id: Optional[uuid.UUID] = Query(None),
    section_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
):
    selector = FieldSelector(LibraryGuideSection, fields, always_include={"id"})
    sections = await svc.list_guide_sections(
        db,
        guide_id=guide_id,
        section_type=section_type,
        is_active=is_active,
    )
    return success(data=selector.apply(sections))


@guide_sections_router.post("/", status_code=201)
@audit_action(
    "guide_section.create", target_type="LibraryGuideSection", include_body=True
)
async def create_guide_section(
    request: Request,
    body: LibraryGuideSectionCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    section = await svc.create_guide_section(db, body)
    await invalidate_public_library_cache()
    return success(
        data=LibraryGuideSectionOut.model_validate(section).model_dump(),
        message="Guide section created",
    )


@guide_sections_router.patch("/{section_id}")
@audit_action(
    "guide_section.update",
    target_type="LibraryGuideSection",
    target_id_param="section_id",
)
async def update_guide_section(
    request: Request,
    section_id: uuid.UUID,
    body: LibraryGuideSectionUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    section = await svc.update_guide_section(db, section_id, body)
    await invalidate_public_library_cache()
    return success(data=LibraryGuideSectionOut.model_validate(section).model_dump())


@guide_sections_router.delete("/{section_id}", status_code=204)
@audit_action(
    "guide_section.delete",
    target_type="LibraryGuideSection",
    target_id_param="section_id",
)
async def delete_guide_section(
    request: Request,
    section_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_guide_section(db, section_id)
    await invalidate_public_library_cache()


specialists_router = APIRouter(
    prefix="/library/specialists", tags=["Library Specialists"]
)


@specialists_router.get("/")
async def list_specialists(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    subject: Optional[str] = Query(None),
    school: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibrarySpecialist, fields, always_include={"id"})
    specialists = await svc.list_specialists(
        db,
        library_id=library_id,
        subject=subject,
        school=school,
        department=department,
        public_only=not is_writer,
    )
    return success(data=selector.apply(specialists))


@specialists_router.post("/", status_code=201)
@audit_action("specialist.create", target_type="LibrarySpecialist", include_body=True)
async def create_specialist(
    request: Request,
    body: LibrarySpecialistCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    specialist = await svc.create_specialist(db, body)
    await invalidate_public_library_cache()
    return success(
        data=LibrarySpecialistOut.model_validate(specialist).model_dump(),
        message="Specialist created",
    )


@specialists_router.patch("/{specialist_id}")
@audit_action(
    "specialist.update",
    target_type="LibrarySpecialist",
    target_id_param="specialist_id",
)
async def update_specialist(
    request: Request,
    specialist_id: uuid.UUID,
    body: LibrarySpecialistUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    specialist = await svc.update_specialist(db, specialist_id, body)
    await invalidate_public_library_cache()
    return success(data=LibrarySpecialistOut.model_validate(specialist).model_dump())


@specialists_router.delete("/{specialist_id}", status_code=204)
@audit_action(
    "specialist.delete",
    target_type="LibrarySpecialist",
    target_id_param="specialist_id",
)
async def delete_specialist(
    request: Request,
    specialist_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_specialist(db, specialist_id)
    await invalidate_public_library_cache()


workflows_router = APIRouter(prefix="/library/workflows", tags=["Library Workflows"])
workflow_steps_router = APIRouter(
    prefix="/library/workflow-steps", tags=["Library Workflow Steps"]
)


@workflows_router.get("/")
async def list_workflows(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    workflow_type: Optional[str] = Query(None),
    audience: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryWorkflow, fields, always_include={"id"})
    result = await svc.list_workflows(
        db,
        library_id=library_id,
        workflow_type=workflow_type,
        audience=audience,
        page=page,
        per_page=per_page,
        include_total=include_total,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@workflows_router.get("/{slug}")
async def get_workflow(
    request: Request,
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryWorkflow, fields, always_include={"id"})
    workflow = await svc.get_workflow_by_slug(
        db,
        slug,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(workflow))


@workflows_router.get("/records/{workflow_id}")
async def get_workflow_record(
    request: Request,
    workflow_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    selector = FieldSelector(LibraryWorkflow, fields, always_include={"id"})
    workflow = await svc.get_workflow_entity(db, workflow_id)
    return success(data=selector.apply(workflow))


@workflows_router.post("/", status_code=201)
@audit_action("workflow.create", target_type="LibraryWorkflow", include_body=True)
async def create_workflow(
    request: Request,
    body: LibraryWorkflowCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    workflow = await svc.create_workflow(db, body)
    await invalidate_public_library_cache()
    return success(
        data=LibraryWorkflowOut.model_validate(workflow).model_dump(),
        message="Workflow created",
    )


@workflows_router.patch("/{workflow_id}")
@audit_action(
    "workflow.update", target_type="LibraryWorkflow", target_id_param="workflow_id"
)
async def update_workflow(
    request: Request,
    workflow_id: uuid.UUID,
    body: LibraryWorkflowUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    workflow = await svc.update_workflow(db, workflow_id, body)
    await invalidate_public_library_cache()
    return success(data=LibraryWorkflowOut.model_validate(workflow).model_dump())


@workflows_router.delete("/{workflow_id}", status_code=204)
@audit_action(
    "workflow.delete", target_type="LibraryWorkflow", target_id_param="workflow_id"
)
async def delete_workflow(
    request: Request,
    workflow_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_workflow(db, workflow_id)
    await invalidate_public_library_cache()


@workflow_steps_router.get("/")
async def list_workflow_steps(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    workflow_id: Optional[uuid.UUID] = Query(None),
    is_active: Optional[bool] = Query(None),
):
    selector = FieldSelector(LibraryWorkflowStep, fields, always_include={"id"})
    steps = await svc.list_workflow_steps(
        db,
        workflow_id=workflow_id,
        is_active=is_active,
    )
    return success(data=selector.apply(steps))


@workflow_steps_router.post("/", status_code=201)
@audit_action(
    "workflow_step.create", target_type="LibraryWorkflowStep", include_body=True
)
async def create_workflow_step(
    request: Request,
    body: LibraryWorkflowStepCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    step = await svc.create_workflow_step(db, body)
    await invalidate_public_library_cache()
    return success(
        data=LibraryWorkflowStepOut.model_validate(step).model_dump(),
        message="Workflow step created",
    )


@workflow_steps_router.patch("/{step_id}")
@audit_action(
    "workflow_step.update",
    target_type="LibraryWorkflowStep",
    target_id_param="step_id",
)
async def update_workflow_step(
    request: Request,
    step_id: uuid.UUID,
    body: LibraryWorkflowStepUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    step = await svc.update_workflow_step(db, step_id, body)
    await invalidate_public_library_cache()
    return success(data=LibraryWorkflowStepOut.model_validate(step).model_dump())


@workflow_steps_router.delete("/{step_id}", status_code=204)
@audit_action(
    "workflow_step.delete",
    target_type="LibraryWorkflowStep",
    target_id_param="step_id",
)
async def delete_workflow_step(
    request: Request,
    step_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_workflow_step(db, step_id)
    await invalidate_public_library_cache()


policies_router = APIRouter(prefix="/library/policies", tags=["Library Policies"])


@policies_router.get("/")
async def list_policy_pages(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    policy_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryPolicyPage, fields, always_include={"id"})
    result = await svc.list_policy_pages(
        db,
        library_id=library_id,
        policy_type=policy_type,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@policies_router.get("/{slug}")
async def get_policy_page(
    request: Request,
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    selector = FieldSelector(LibraryPolicyPage, fields, always_include={"id"})
    policy_page = await svc.get_policy_page_by_slug(
        db,
        slug,
        load_options=selector.load_options,
        public_only=not is_writer,
    )
    return success(data=selector.apply(policy_page))


@policies_router.post("/", status_code=201)
@audit_action("policy.create", target_type="LibraryPolicyPage", include_body=True)
async def create_policy_page(
    request: Request,
    body: LibraryPolicyPageCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    policy_page = await svc.create_policy_page(db, body)
    await invalidate_public_library_cache()
    return success(
        data=LibraryPolicyPageOut.model_validate(policy_page).model_dump(),
        message="Policy page created",
    )


@policies_router.patch("/{policy_page_id}")
@audit_action(
    "policy.update",
    target_type="LibraryPolicyPage",
    target_id_param="policy_page_id",
)
async def update_policy_page(
    request: Request,
    policy_page_id: uuid.UUID,
    body: LibraryPolicyPageUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    policy_page = await svc.update_policy_page(db, policy_page_id, body)
    await invalidate_public_library_cache()
    return success(data=LibraryPolicyPageOut.model_validate(policy_page).model_dump())


@policies_router.delete("/{policy_page_id}", status_code=204)
@audit_action(
    "policy.delete",
    target_type="LibraryPolicyPage",
    target_id_param="policy_page_id",
)
async def delete_policy_page(
    request: Request,
    policy_page_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_policy_page(db, policy_page_id)
    await invalidate_public_library_cache()


router = APIRouter()
router.include_router(guides_router)
router.include_router(guide_sections_router)
router.include_router(specialists_router)
router.include_router(workflows_router)
router.include_router(workflow_steps_router)
router.include_router(policies_router)
