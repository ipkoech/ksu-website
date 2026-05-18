"""Uvicorn entry point for the Main Site service."""

from app.main import create_app

app = create_app()
