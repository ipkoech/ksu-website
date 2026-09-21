"""Canonical editorial commands shared by HTTP adapters and workers."""

from fastapi import HTTPException
from ksu_common.assurance import require_recent_mfa
from sqlalchemy import select

from ..models.workflow import ResearchWorkflowEvent
from .research_actions import can_domain_action, require_domain_action
from .research_domains import assert_record_in_domain
from .research_workflow import PENDING, PUBLISHED, REJECTED, VISIBILITY_ADAPTERS, apply_workflow_state, workflow_state


async def create_editorial_record(db, actor, resource_key, service, data):
    """Create with separately authorized editorial state and atomic provenance.

    The caller validates creation and ownership authority. Edit permission alone
    creates a draft; automatic submission requires submit authority.
    """
    adapter = VISIBILITY_ADAPTERS.get(resource_key)
    if adapter is None:
        return await service.create(db, data, actor_id=actor.sub)
    if can_domain_action(actor, resource_key, "publish", data):
        target = PUBLISHED if adapter.is_public(data) else "draft"
    else:
        target = PENDING if can_domain_action(actor, resource_key, "submit", data) else "draft"
    if target == PUBLISHED:
        require_recent_mfa(actor)
    # Persist hidden fields from the first INSERT, even if schema defaults
    # would otherwise make the record publicly visible.
    apply_workflow_state(resource_key, data, target)
    record = await service.create(db, data, actor_id=actor.sub)
    apply_workflow_state(resource_key, record, target)
    db.add(ResearchWorkflowEvent(resource_key=resource_key, resource_id=record.id,
                                actor_id=actor.sub, session_jti=actor.jti,
                                previous_state="absent", target_state=target))
    await db.flush()
    return record


async def transition_record(db, actor, resource_key, model, item_id, target_state, *, note=None):
    if resource_key not in VISIBILITY_ADAPTERS:
        raise HTTPException(400, "Resource has no editorial workflow")
    if note is not None and (not isinstance(note, str) or len(note) > 2000):
        raise HTTPException(422, "Workflow note must be at most 2000 characters")
    result = await db.execute(select(model).where(
        model.id == item_id, model.deleted_at.is_(None),
    ).with_for_update().execution_options(populate_existing=True))
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(404, "Record not found")
    assert_record_in_domain(actor, resource_key, record)
    current = workflow_state(resource_key, record)
    if target_state == PENDING:
        require_domain_action(actor, resource_key, "submit", record)
        if current not in {"draft", REJECTED}:
            raise HTTPException(409, "Only an editable draft can be submitted")
    elif target_state == PUBLISHED:
        require_domain_action(actor, resource_key, "review", record)
        require_domain_action(actor, resource_key, "publish", record)
        if current != PENDING:
            raise HTTPException(409, "Only a pending record can be approved and published")
    elif target_state == REJECTED:
        require_domain_action(actor, resource_key, "publish" if current == PUBLISHED else "review", record)
        if current not in {PENDING, PUBLISHED}:
            raise HTTPException(409, "Only pending or published records can be withdrawn")
    else:
        raise HTTPException(422, "Unsupported editorial transition")
    if target_state == PUBLISHED or current == PUBLISHED:
        require_recent_mfa(actor)
    apply_workflow_state(resource_key, record, target_state)
    db.add(ResearchWorkflowEvent(resource_key=resource_key, resource_id=record.id,
                                actor_id=actor.sub, session_jti=actor.jti,
                                previous_state=current, target_state=target_state, note=note))
    await db.flush()
    await db.refresh(record)
    return record
