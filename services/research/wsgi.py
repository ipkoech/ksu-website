"""Uvicorn entry point for the Research service."""

from app.main import create_app

app = create_app()
