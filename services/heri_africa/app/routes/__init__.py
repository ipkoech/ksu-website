from fastapi import FastAPI

from .v1 import router


def register_routers(app: FastAPI) -> None:
    app.include_router(router, prefix="/api/v1/heri")
