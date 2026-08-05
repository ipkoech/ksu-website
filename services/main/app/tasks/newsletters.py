"""Celery tasks for scheduled newsletter delivery."""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from html import escape
from typing import Protocol

from sqlalchemy import select
from ksu_common.task_queue import run_worker_async

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..helpers.email import send_email
from ..models import Newsletter, NewsletterSubscriber
from .celery_app import celery_app

settings = get_settings()
_TAG_RE = re.compile(r"<[^>]+>")
_WHITESPACE_RE = re.compile(r"\s+")


class NewsletterLike(Protocol):
    title: str
    slug: str
    summary: str | None
    content: str | None


@dataclass(frozen=True)
class NewsletterEmailMessage:
    subject: str
    text_body: str
    html_body: str


def _strip_html(value: str | None) -> str:
    if not value:
        return ""
    text = _TAG_RE.sub(" ", value)
    return _WHITESPACE_RE.sub(" ", text).strip()


def _newsletter_url(item: NewsletterLike) -> str:
    return f"{settings.frontend_url_for('web').rstrip('/')}/media/newsletters/{item.slug}"


def unsubscribe_url_for_token(token: str) -> str:
    """Absolute one-click unsubscribe URL for a subscriber's verification token."""
    return f"{settings.PUBLIC_API_BASE_URL.rstrip('/')}/api/v1/newsletters/unsubscribe/{token}"


def render_newsletter_email(
    item: NewsletterLike,
    *,
    unsubscribe_url: str | None = None,
) -> NewsletterEmailMessage:
    """Render a public newsletter into SMTP-ready text and HTML bodies."""
    subject = item.title
    summary = _strip_html(item.summary)
    content_text = _strip_html(item.content)
    public_url = _newsletter_url(item)

    text_parts = [
        subject,
        "",
        summary,
        "",
        content_text,
        "",
        f"Read online: {public_url}",
        "",
        "You are receiving this email because you subscribed to Kisii University updates.",
    ]
    if unsubscribe_url:
        text_parts.append(f"Unsubscribe: {unsubscribe_url}")
    text_body = "\n".join(part for part in text_parts if part is not None)

    unsubscribe_html = (
        (
            ' <a href="'
            + escape(unsubscribe_url, quote=True)
            + '" style="color:#637169;text-decoration:underline;">Unsubscribe</a>'
        )
        if unsubscribe_url
        else ""
    )

    html_body = (
        "<!doctype html>"
        '<html lang="en">'
        "<body style=\"margin:0;background:#f6f4ee;font-family:Arial,sans-serif;color:#10231c;\">"
        '<div style="display:none;max-height:0;overflow:hidden;">'
        f"{escape(summary or subject)}"
        "</div>"
        '<main style="max-width:720px;margin:0 auto;background:#ffffff;">'
        '<header style="padding:28px 32px;background:#003525;color:#ffffff;">'
        '<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#f0b429;">'
        "Kisii University Updates"
        "</p>"
        f'<h1 style="margin:0;font-size:30px;line-height:1.12;">{escape(subject)}</h1>'
        "</header>"
        '<section style="padding:28px 32px;">'
        f'<p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#405047;">{escape(summary)}</p>'
        f'<div style="font-size:15px;line-height:1.7;color:#1f3029;">{item.content or ""}</div>'
        '<p style="margin:28px 0 0;">'
        f'<a href="{escape(public_url, quote=True)}" '
        'style="display:inline-block;background:#d28a00;color:#ffffff;padding:12px 18px;'
        'border-radius:6px;text-decoration:none;font-weight:700;">Read online</a>'
        "</p>"
        "</section>"
        '<footer style="padding:20px 32px;border-top:1px solid #e4e0d6;color:#637169;font-size:12px;line-height:1.6;">'
        "You are receiving this email because you subscribed to Kisii University updates."
        f"{unsubscribe_html}"
        "</footer>"
        "</main>"
        "</body></html>"
    )
    return NewsletterEmailMessage(subject=subject, text_body=text_body, html_body=html_body)


async def _active_subscribers(db) -> list[tuple[str, str | None]]:
    """Return (email, verification_token) pairs for active subscribers, deduped by email."""
    result = await db.execute(
        select(NewsletterSubscriber.email, NewsletterSubscriber.verification_token)
        .where(
            NewsletterSubscriber.status == "active",
            NewsletterSubscriber.unsubscribed_at.is_(None),
        )
        .order_by(NewsletterSubscriber.subscribed_at.asc())
    )
    seen: dict[str, str | None] = {}
    for email, token in result.all():
        seen.setdefault(email, token)
    return list(seen.items())


async def enqueue_due_newsletters(db, *, now: datetime | None = None) -> int:
    """Queue due scheduled newsletters and return how many were queued."""
    now = now or datetime.now(timezone.utc)
    result = await db.execute(
        select(Newsletter.id)
        .where(
            Newsletter.deleted_at.is_(None),
            Newsletter.send_status == "scheduled",
            Newsletter.scheduled_send_at.is_not(None),
            Newsletter.scheduled_send_at <= now,
        )
        .order_by(Newsletter.scheduled_send_at.asc(), Newsletter.created_at.asc())
    )
    newsletter_ids = [str(item) for item in result.scalars().all()]
    for newsletter_id in newsletter_ids:
        queue_newsletter_send.delay(newsletter_id)
    return len(newsletter_ids)


async def _send_newsletter(newsletter_id: str) -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Newsletter).where(
                Newsletter.id == uuid.UUID(newsletter_id),
                Newsletter.deleted_at.is_(None),
            )
        )
        item = result.scalar_one_or_none()
        if item is None:
            return 0

        now = datetime.now(timezone.utc)
        if item.send_status not in {"scheduled", "sending"}:
            return 0
        if item.scheduled_send_at and item.scheduled_send_at > now:
            return 0

        item.send_status = "sending"
        item.send_error = None
        await db.commit()

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Newsletter).where(
                Newsletter.id == uuid.UUID(newsletter_id),
                Newsletter.deleted_at.is_(None),
            )
        )
        item = result.scalar_one_or_none()
        if item is None:
            return 0
        recipients = await _active_subscribers(db)
        item.recipients_count = len(recipients)
        await db.commit()

    sent_count = 0
    try:
        for email, token in recipients:
            message = render_newsletter_email(
                item,
                unsubscribe_url=unsubscribe_url_for_token(token) if token else None,
            )
            await send_email(
                to_email=email,
                subject=message.subject,
                text_body=message.text_body,
                html_body=message.html_body,
            )
            sent_count += 1
    except Exception as exc:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Newsletter).where(Newsletter.id == uuid.UUID(newsletter_id))
            )
            item = result.scalar_one_or_none()
            if item is not None:
                item.send_status = "failed"
                item.send_error = str(exc)
                item.sent_count = sent_count
            await db.commit()
        raise

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Newsletter).where(Newsletter.id == uuid.UUID(newsletter_id))
        )
        item = result.scalar_one_or_none()
        if item is not None:
            item.send_status = "sent"
            item.sent_at = datetime.now(timezone.utc)
            item.send_error = None
            item.sent_count = sent_count
            item.recipients_count = len(recipients)
        await db.commit()

    return sent_count


@celery_app.task(
    name="main.newsletters.send",
)
def queue_newsletter_send(newsletter_id: str) -> int:
    return run_worker_async(_send_newsletter(newsletter_id))


@celery_app.task(name="main.newsletters.send_due")
def send_due_newsletters() -> int:
    async def _send_due() -> int:
        async with AsyncSessionLocal() as db:
            return await enqueue_due_newsletters(db)

    return run_worker_async(_send_due())


__all__ = [
    "NewsletterEmailMessage",
    "enqueue_due_newsletters",
    "queue_newsletter_send",
    "render_newsletter_email",
    "send_due_newsletters",
    "unsubscribe_url_for_token",
]
