from fastapi import FastAPI
from ksu_common import install_request_body_limit_middleware

from .v1 import router


def register_routers(app: FastAPI) -> None:
    app.include_router(router, prefix="/api/v1/heri")
    install_request_body_limit_middleware(app)
