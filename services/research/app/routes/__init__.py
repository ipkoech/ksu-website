from fastapi import FastAPI
from ksu_common import install_request_body_limit_middleware

from .v1 import router as v1_router


def register_routers(app: FastAPI) -> None:
    app.include_router(v1_router, prefix="/api/v1")
    install_request_body_limit_middleware(app)
