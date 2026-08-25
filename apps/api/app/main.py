from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine
from app.core.redis_client import close_redis
from app.routers.events import router as events_router
from app.routers.health import router as health_router
from app.routers.lab import router as lab_router
from app.routers.projects import router as projects_router
from app.routers.runs import router as runs_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()
    await engine.dispose()

app = FastAPI(
    title="NEXUS Organization OS API",
    description="Multi-agent organization operating system with VERITAS event chaining, MNEMOS memory, and Policy Engine",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register health check
app.include_router(health_router)
app.include_router(health_router, prefix="/api")

# Register core routers
app.include_router(projects_router, prefix="/api")
app.include_router(runs_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(lab_router, prefix="/api")
app.include_router(projects_router)
app.include_router(runs_router)
app.include_router(events_router)
app.include_router(lab_router)
