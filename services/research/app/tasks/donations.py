"""Donation notification and reminder tasks."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings
from .celery_app import celery_app


def _post_main_internal(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    return asyncio.run(_post_main_internal_async(path, payload))


async def _post_main_internal_async(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    response = await get_integration_pool().request_internal(
        "main-donation-notifications",
        settings.MAIN_SERVICE_URL.rstrip("/"),
        "POST",
        f"/api/v1/internal/{path.lstrip('/')}",
        api_key=settings.MAIN_SERVICE_API_KEY,
        json=payload,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def _format_money(amount: str | float | Decimal, currency: str) -> str:
    return f"{currency} {Decimal(str(amount)):,.2f}"


def _next_reminder_eta(frequency: str) -> datetime:
    days_by_frequency = {
        "monthly": 30,
        "quarterly": 90,
        "yearly": 365,
        "annual": 365,
        "annually": 365,
    }
    days = days_by_frequency.get(frequency.lower(), 30)
    return datetime.now(timezone.utc) + timedelta(days=days)


@celery_app.task(
    name="research.donations.notify_admins",
)
def notify_research_admins_of_donation(
    *,
    donation_id: str,
    donor_name: str,
    amount: str,
    currency: str,
    reference: str,
) -> dict[str, Any]:
    amount_label = _format_money(amount, currency)
    return _post_main_internal(
        "notifications/broadcast",
        {
            "role_names": ["research-admin"],
            "channels": ["in_app"],
            "title": "New research donation request",
            "subject": "New research donation request",
            "message": f"{donor_name} submitted a pending donation request for {amount_label}. Reference: {reference}.",
            "notification_type": "research_donation",
            "priority": "high",
            "action_url": f"/research/donations/records/{donation_id}",
            "payload": {
                "service": "research",
                "resource": "donations",
                "donation_id": donation_id,
                "reference": reference,
            },
        },
    )


@celery_app.task(
    name="research.donations.email_research_office",
)
def send_research_donation_request_email(
    *,
    research_email: str,
    donor_name: str,
    donor_email: str | None,
    amount: str,
    currency: str,
    reference: str,
    designation: str,
) -> dict[str, Any]:
    amount_label = _format_money(amount, currency)
    donor_contact = donor_email or "No donor email provided"
    text_body = (
        "A new research donation request has been submitted.\n\n"
        f"Donor: {donor_name}\n"
        f"Donor email: {donor_contact}\n"
        f"Amount: {amount_label}\n"
        f"Designation: {designation}\n"
        f"Reference: {reference}\n\n"
        "Review and confirm it from the research admin donation records."
    )
    return _post_main_internal(
        "email/send",
        {
            "to_email": research_email,
            "subject": "New research donation request",
            "text_body": text_body,
        },
    )


@celery_app.task(
    name="research.donations.email_submission_receipt",
)
def send_donation_submission_email(
    *,
    donor_email: str,
    donor_name: str,
    amount: str,
    currency: str,
    reference: str,
    research_email: str,
) -> dict[str, Any]:
    amount_label = _format_money(amount, currency)
    text_body = (
        f"Dear {donor_name},\n\n"
        f"Thank you for submitting a research donation request for {amount_label}.\n"
        f"Your reference is {reference}.\n\n"
        "The research office will reconcile the payment details and confirm your donation record. "
        f"For questions, contact {research_email}.\n\n"
        "Kisii University Research Office"
    )
    return _post_main_internal(
        "email/send",
        {
            "to_email": donor_email,
            "subject": "Research donation request received",
            "text_body": text_body,
        },
    )


@celery_app.task(
    name="research.donations.email_appreciation",
)
def send_donation_appreciation_email(
    *,
    donor_email: str,
    donor_name: str,
    amount: str,
    currency: str,
    reference: str,
) -> dict[str, Any]:
    amount_label = _format_money(amount, currency)
    text_body = (
        f"Dear {donor_name},\n\n"
        f"Thank you for your confirmed research donation of {amount_label}.\n"
        f"Reference: {reference}.\n\n"
        "Your gift strengthens research, student discovery, innovation, and community impact at Kisii University.\n\n"
        "Kisii University Research Office"
    )
    return _post_main_internal(
        "email/send",
        {
            "to_email": donor_email,
            "subject": "Thank you for supporting Kisii University research",
            "text_body": text_body,
        },
    )


@celery_app.task(
    name="research.donations.email_recurring_reminder",
)
def send_recurring_donation_reminder(
    *,
    donor_email: str,
    donor_name: str,
    amount: str,
    currency: str,
    reference: str,
    recurring_frequency: str,
) -> dict[str, Any]:
    amount_label = _format_money(amount, currency)
    text_body = (
        f"Dear {donor_name},\n\n"
        f"This is a reminder for your {recurring_frequency} research donation pledge of {amount_label}.\n"
        f"Reference: {reference}.\n\n"
        "Thank you for continuing to support Kisii University research.\n\n"
        "Kisii University Research Office"
    )
    result = _post_main_internal(
        "email/send",
        {
            "to_email": donor_email,
            "subject": "Research donation reminder",
            "text_body": text_body,
        },
    )
    send_recurring_donation_reminder.apply_async(
        kwargs={
            "donor_email": donor_email,
            "donor_name": donor_name,
            "amount": amount,
            "currency": currency,
            "reference": reference,
            "recurring_frequency": recurring_frequency,
        },
        eta=_next_reminder_eta(recurring_frequency),
    )
    return result
