"""Uvicorn entry point for the Library service."""

from app.main import create_app

app = create_app()
