"""Seed baseline system settings."""

from __future__ import annotations

from uuid import uuid4
import asyncio
import json

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


SETTINGS = [
    # Site settings
    ("site_name", "site", "Kisii University", "The name of the university displayed on the site"),
    ("site_tagline", "site", "An inclusive and borderless University", "Short tagline displayed in the header"),
    ("site_email", "site", "info@kisiiuniversity.ac.ke", "Primary contact email"),
    ("site_phone", "site", "+254720875082", "Primary contact phone"),
    ("site_address", "site", "P.O. Box 408-40200, Kisii, Kenya", "Physical address"),
    ("maintenance_mode", "site", False, "Enable maintenance mode"),
    
    # Email settings
    ("email_from_name", "email", "Kisii University", "Name displayed in email from field"),
    ("email_from_address", "email", "noreply@kisiiuniversity.ac.ke", "Email address for sending emails"),
    ("email_smtp_host", "email", "", "SMTP server hostname"),
    ("email_smtp_port", "email", "587", "SMTP server port"),
    ("email_verification_required", "email", True, "Require email verification"),
    
    # Security settings
    ("require_2fa", "security", False, "Require two-factor authentication"),
    ("session_timeout_minutes", "security", 60, "Session timeout in minutes"),
    ("password_min_length", "security", 8, "Minimum password length"),
    ("max_login_attempts", "security", 5, "Max failed login attempts"),
    ("lockout_duration_minutes", "security", 15, "Account lockout duration"),
    
    # Integrations settings
    ("google_analytics_id", "integrations", "", "Google Analytics tracking ID"),
    ("google_recaptcha_site_key", "integrations", "", "Google reCAPTCHA site key"),
]


def get_value_type(value):
    """Determine the value_type based on Python type."""
    if isinstance(value, bool):
        return "bool"
    elif isinstance(value, int):
        return "int"
    elif isinstance(value, float):
        return "float"
    elif isinstance(value, str):
        return "str"
    elif isinstance(value, (list, dict)):
        return "json"
    return "str"


async def seed_system_settings(db: AsyncSession) -> None:
    for key, category, value, description in SETTINGS:
        value_type = get_value_type(value)
        value_json = json.dumps(value)
        
        result = await db.execute(
            text("SELECT id, value_type FROM settings WHERE key = :key"),
            {"key": key}
        )
        existing = result.fetchone()
        
        if existing:
            await db.execute(
                text("""
                    UPDATE settings 
                    SET value = CAST(:value AS jsonb), value_type = :value_type, category = :category, description = :description, updated_at = NOW()
                    WHERE key = :key
                """),
                {"key": key, "value": value_json, "value_type": value_type, "category": category, "description": description}
            )
        else:
            await db.execute(
                text("""
                    INSERT INTO settings (id, key, value, value_type, category, description, is_public, updated_at)
                    VALUES (:id, :key, CAST(:value AS jsonb), :value_type, :category, :description, false, NOW())
                """),
                {"id": str(uuid4()), "key": key, "value": value_json, "value_type": value_type, "category": category, "description": description}
            )


async def run() -> None:
    from app.core.database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        try:
            await seed_system_settings(db)
            await db.commit()
            print("System settings seeded successfully!")
        except Exception as e:
            await db.rollback()
            print(f"Error seeding system settings: {e}")


if __name__ == "__main__":
    asyncio.run(run())
