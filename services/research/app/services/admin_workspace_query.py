"""SQL equivalent of research_workflow.workflow_state, before counting/paging."""
from sqlalchemy import and_, case, literal, or_, true


def editorial_state_expression(model, adapter):
    public = true()
    if adapter.boolean_field is not None:
        public = and_(public, getattr(model, adapter.boolean_field).is_(True))
    conditions = []
    if adapter.status_field is not None:
        status = getattr(model, adapter.status_field)
        conditions.extend(((status == "pending", literal("pending")),
                           (status == "rejected", literal("rejected"))))
        # Python's `None not in (...)` is true; SQL NOT IN alone is not.
        public = and_(public, or_(status.is_(None), status.not_in(
            [adapter.hidden_status, "pending", "rejected"],
        )))
    fallback = case(*conditions, (public, literal("published")), else_=literal("draft"))
    if hasattr(model, "editorial_state"):
        return case((model.editorial_state.in_(["draft", "pending", "published", "rejected"]),
                     model.editorial_state), else_=fallback)
    return fallback
