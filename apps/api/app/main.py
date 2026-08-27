from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.core.middleware import setup_production_middleware
from app.core.redis_client import close_redis
from app.routers.direct_query import router as direct_query_router
from app.routers.events import router as events_router
from app.routers.health import router as health_router
from app.routers.lab import router as lab_router
from app.routers.projects import router as projects_router
from app.routers.runs import router as runs_router
from app.routers.sandbox import router as sandbox_router
from app.routers.streaming import router as streaming_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all relational tables on startup (critical for SQLite & cloud deployments)
    from app.core.database import Base
    import app.models  # noqa: F401 - register all model schemas with Base.metadata

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Scale Multi-Agent Organization Operating System with VERITAS Cryptographic Chaining, MNEMOS Memory, and Policy Engine",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production security, rate limiting, and correlation middleware
setup_production_middleware(app)

# Register health check & telemetry
app.include_router(health_router)
app.include_router(health_router, prefix="/api")

# Register core routers
app.include_router(projects_router, prefix="/api")
app.include_router(runs_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(lab_router, prefix="/api")
app.include_router(streaming_router, prefix="/api")
app.include_router(sandbox_router, prefix="/api")
app.include_router(direct_query_router, prefix="/api")
