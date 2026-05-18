"""Register all routers on the FastAPI app."""

from fastapi import FastAPI
from .v1 import router as v1_router


def register_routers(app: FastAPI) -> None:
    app.include_router(v1_router, prefix="/api/v1")
