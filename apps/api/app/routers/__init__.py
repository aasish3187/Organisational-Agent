from app.routers.events import router as events_router
from app.routers.health import router as health_router
from app.routers.projects import router as projects_router
from app.routers.runs import router as runs_router

__all__ = [
    "health_router",
    "projects_router",
    "runs_router",
    "events_router",
]
