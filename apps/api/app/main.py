from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine
from app.core.redis_client import close_redis
from app.routers.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables or connectivity
    yield
    # Shutdown: cleanup resources
    await close_redis()
    await engine.dispose()

app = FastAPI(
    title="NEXUS Organization OS API",
    description="Multi-agent organization operating system with VERITAS event chaining and MNEMOS memory",
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

# Register routers
app.include_router(health_router)
app.include_router(health_router, prefix="/api")
