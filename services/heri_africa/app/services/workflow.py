from __future__ import annotations


class WorkflowError(ValueError):
    pass


TRANSITIONS: dict[str, set[str]] = {
    "draft": {"in_review", "archived"},
    "in_review": {"draft", "approved", "archived"},
    "approved": {"scheduled", "published", "draft", "archived"},
    "scheduled": {"published", "approved", "archived"},
    "published": {"archived"},
    "archived": {"draft", "published"},
}

ROLE_TARGETS: dict[str, set[str]] = {
    "editor": {"in_review", "draft"},
    "publisher": {"draft", "in_review", "approved", "scheduled", "published", "archived"},
    "administrator": {"draft", "in_review", "approved", "scheduled", "published", "archived"},
}


class WorkflowService:
    def transition(self, current: str, target: str, role: str) -> str:
        normalized_role = role.lower()
        if target not in TRANSITIONS.get(current, set()):
            raise WorkflowError(f"Cannot transition {current} to {target}")
        if target not in ROLE_TARGETS.get(normalized_role, set()):
            raise WorkflowError(f"Role {role} cannot transition content to {target}")
        return target
