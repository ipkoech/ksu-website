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

TRANSITION_PERMISSIONS: dict[str, dict[str, str]] = {
    "draft": {"in_review": "heri.content.submit", "archived": "heri.content.publish"},
    "in_review": {
        "draft": "heri.content.review",
        "approved": "heri.content.review",
        "archived": "heri.content.publish",
    },
    "approved": {
        "scheduled": "heri.content.publish",
        "published": "heri.content.publish",
        "draft": "heri.content.review",
        "archived": "heri.content.publish",
    },
    "scheduled": {
        "published": "heri.content.publish",
        "approved": "heri.content.review",
        "archived": "heri.content.publish",
    },
    "published": {"archived": "heri.content.publish"},
    "archived": {
        "draft": "heri.content.review",
        "published": "heri.content.publish",
    },
}


class WorkflowService:
    def transition(self, current: str, target: str) -> str:
        if target not in TRANSITIONS.get(current, set()):
            raise WorkflowError(f"Cannot transition {current} to {target}")
        return target

    def transition_permission(self, current: str, target: str) -> str:
        self.transition(current, target)
        return TRANSITION_PERMISSIONS[current][target]
