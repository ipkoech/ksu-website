"""Celery tasks for scheduled newsletter delivery."""

from __future__ import annotations

import asyncio
import re
import smtplib
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from html import escape
from typing import Protocol

from sqlalchemy import select

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


def render_newsletter_email(item: NewsletterLike) -> NewsletterEmailMessage:
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
    text_body = "\n".join(part for part in text_parts if part is not None)

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
        "</footer>"
        "</main>"
        "</body></html>"
    )
    return NewsletterEmailMessage(subject=subject, text_body=text_body, html_body=html_body)


async def _active_subscriber_emails(db) -> list[str]:
    result = await db.execute(
        select(NewsletterSubscriber.email)
        .where(
            NewsletterSubscriber.status == "active",
            NewsletterSubscriber.unsubscribed_at.is_(None),
        )
        .order_by(NewsletterSubscriber.subscribed_at.asc())
    )
    return list(dict.fromkeys(result.scalars().all()))


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

    message = render_newsletter_email(item)

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
        recipients = await _active_subscriber_emails(db)

    sent_count = 0
    try:
        for email in recipients:
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
        await db.commit()

    return sent_count


@celery_app.task(
    bind=True,
    name="main.newsletters.send",
    autoretry_for=(smtplib.SMTPException, TimeoutError, OSError, ConnectionError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=3,
)
def queue_newsletter_send(self, newsletter_id: str) -> int:
    return asyncio.run(_send_newsletter(newsletter_id))


@celery_app.task(name="main.newsletters.send_due")
def send_due_newsletters() -> int:
    async def _send_due() -> int:
        async with AsyncSessionLocal() as db:
            return await enqueue_due_newsletters(db)

    return asyncio.run(_send_due())


__all__ = [
    "NewsletterEmailMessage",
    "enqueue_due_newsletters",
    "queue_newsletter_send",
    "render_newsletter_email",
    "send_due_newsletters",
]
