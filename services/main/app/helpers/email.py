"""SMTP email helpers backed by Google Workspace."""

from __future__ import annotations

import asyncio
import base64
import re
import smtplib
from email.message import EmailMessage
from html import escape
from pathlib import Path

from ..core.config import FrontendService, get_settings

settings = get_settings()
_PLACEHOLDER_RE = re.compile(r"{{\s*([a-zA-Z0-9_]+)\s*}}")


def _build_message(*, to_email: str, subject: str, text_body: str, html_body: str | None = None) -> EmailMessage:
    message = EmailMessage()
    from_email = settings.SMTP_FROM_EMAIL or settings.EMAIL_FROM or settings.SMTP_USERNAME or "no-reply@kisiiuniversity.ac.ke"
    from_name = settings.SMTP_FROM_NAME
    message["From"] = f"{from_name} <{from_email}>" if from_name else from_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")
    return message


def _load_template(name: str) -> str:
    return (settings.email_template_dir / name).read_text(encoding="utf-8")


def _render_template(template_name: str, context: dict[str, object], *, raw_keys: set[str] | None = None) -> str:
    template = _load_template(template_name)
    raw_keys = raw_keys or set()

    def _replace(match: re.Match[str]) -> str:
        key = match.group(1)
        value = context.get(key, "")
        if value is None:
            return ""
        value_str = str(value)
        if key in raw_keys:
            return value_str
        return escape(value_str)

    return _PLACEHOLDER_RE.sub(_replace, template)


def _logo_data_uri() -> str | None:
    logo_path = settings.email_logo_path
    if not logo_path.exists():
        return None
    encoded = base64.b64encode(logo_path.read_bytes()).decode("ascii")
    suffix = logo_path.suffix.lower().lstrip(".") or "png"
    mime = "image/png" if suffix == "png" else f"image/{suffix}"
    return f"data:{mime};base64,{encoded}"


def _build_action_button(action_url: str | None, action_label: str | None) -> str:
    if not action_url or not action_label:
        return ""
    safe_url = escape(action_url, quote=True)
    safe_label = escape(action_label)
    return (
        f'<p style="margin:24px 0;">'
        f'<a href="{safe_url}" '
        'style="display:inline-block;padding:12px 18px;background:#0057b8;color:#ffffff;'
        'text-decoration:none;border-radius:6px;font-weight:600;">'
        f"{safe_label}</a></p>"
    )


def _wrap_email(*, title: str, preheader: str, body_content: str) -> str:
    logo_src = _logo_data_uri()
    logo_block = ""
    if logo_src:
        logo_block = (
            '<div style="margin-bottom:24px;">'
            f'<img src="{logo_src}" alt="Kisii University" style="height:64px;width:auto;display:block;" />'
            "</div>"
        )
    return _render_template(
        "base.html",
        {
            "title": title,
            "preheader": preheader,
            "logo_block": logo_block,
            "body_content": body_content,
            "footer_text": "Kisii University",
        },
        raw_keys={"logo_block", "body_content"},
    )


def _render_transactional_email(
    template_name: str,
    *,
    title: str,
    preheader: str,
    lead: str,
    action_url: str | None = None,
    action_label: str | None = None,
    body: str | None = None,
    extra_body_html: str | None = None,
) -> str:
    body_content = _render_template(
        template_name,
        {
            "title": title,
            "lead": lead,
            "action_button": _build_action_button(action_url, action_label),
            "body": body or "",
            "extra_body_html": extra_body_html or "",
        },
        raw_keys={"action_button", "extra_body_html"},
    )
    return _wrap_email(title=title, preheader=preheader, body_content=body_content)


def _send_message(message: EmailMessage) -> str:
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise ValueError("SMTP credentials are not configured")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
        server.ehlo()
        if settings.SMTP_USE_TLS:
            server.starttls()
            server.ehlo()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        response = server.send_message(message)

    if response:
        raise ValueError(f"SMTP rejected recipients: {response}")
    return f"smtp:{settings.SMTP_HOST}:{message['To']}"


async def send_email(*, to_email: str, subject: str, text_body: str, html_body: str | None = None) -> str:
    """Send an email asynchronously via Google Workspace SMTP."""
    message = _build_message(to_email=to_email, subject=subject, text_body=text_body, html_body=html_body)
    return await asyncio.to_thread(_send_message, message)


async def send_verification_email(email: str, token: str) -> str:
    """Send email verification instructions."""
    verify_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/verify-email?token={token}"
    subject = "Verify your Kisii University account"
    lead = "Verify your email address to activate your Kisii University account."
    note = "If you did not request this account, you can ignore this email."
    text_body = (
        "Welcome to Kisii University.\n\n"
        f"Verify your email address by visiting:\n{verify_url}\n\n"
        f"{note}"
    )
    html_body = _render_transactional_email(
        "verification.html",
        title=subject,
        preheader=lead,
        lead=lead,
        action_url=verify_url,
        action_label="Verify Email",
        body=note,
    )
    return await send_email(to_email=email, subject=subject, text_body=text_body, html_body=html_body)


async def send_password_reset(
    email: str,
    token: str,
    *,
    frontend_service: FrontendService | str | None = None,
) -> str:
    """Send password-reset instructions."""
    base_url = settings.frontend_url_for(frontend_service if frontend_service in {"web", "admin", "research", "library"} else None)
    reset_url = f"{base_url.rstrip('/')}/reset-password?token={token}"
    subject = "Reset your Kisii University password"
    lead = "We received a request to reset your Kisii University password."
    note = "If you did not request a password reset, you can ignore this email."
    text_body = (
        "We received a request to reset your Kisii University password.\n\n"
        f"Use this link to continue:\n{reset_url}\n\n"
        f"{note}"
    )
    html_body = _render_transactional_email(
        "password_reset.html",
        title=subject,
        preheader=lead,
        lead=lead,
        action_url=reset_url,
        action_label="Reset Password",
        body=note,
    )
    return await send_email(to_email=email, subject=subject, text_body=text_body, html_body=html_body)


async def send_account_created_email(email: str, full_name: str, temporary_password: str | None = None) -> str:
    """Send account-created instructions."""
    login_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/login"
    subject = "Your Kisii University account has been created"
    lead = f"Hello {full_name}, your Kisii University account is ready."
    note = "Please sign in and change your password as soon as possible."
    password_line = ""
    text_password_line = ""
    if temporary_password:
        password_line = (
            "<p style=\"margin:0 0 8px;\"><strong>Temporary password:</strong> "
            f"{escape(temporary_password)}</p>"
        )
        text_password_line = f"Temporary password: {temporary_password}\n"
    text_body = (
        f"Hello {full_name},\n\n"
        "Your Kisii University account has been created.\n"
        f"Email: {email}\n"
        f"{text_password_line}"
        f"Login here: {login_url}\n\n"
        f"{note}"
    )
    html_body = _render_transactional_email(
        "account_created.html",
        title=subject,
        preheader=lead,
        lead=lead,
        action_url=login_url,
        action_label="Sign In",
        body=note,
        extra_body_html=(
            f"<p style=\"margin:0 0 8px;\"><strong>Email:</strong> {escape(email)}</p>"
            f"{password_line}"
        ),
    )
    return await send_email(to_email=email, subject=subject, text_body=text_body, html_body=html_body)


async def send_notification_email(email: str, subject: str, message: str) -> str:
    """Send a notification email and return provider reference."""
    html_body = _render_transactional_email(
        "notification.html",
        title=subject,
        preheader=message,
        lead=message,
    )
    return await send_email(to_email=email, subject=subject, text_body=message, html_body=html_body)


__all__ = [
    "send_account_created_email",
    "send_email",
    "send_notification_email",
    "send_password_reset",
    "send_verification_email",
]
