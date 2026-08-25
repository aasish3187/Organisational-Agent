import time

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import check_db_readiness
from app.core.redis_client import get_redis

router = APIRouter(tags=["Health & Telemetry"])

_START_TIME = time.time()


class HealthDetailResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str
    demo_mode: bool
    database: str
    redis: str
    uptime_seconds: float


@router.get("/health")
async def get_health():
    """General health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_REPLAY,
    }


@router.get("/health/live")
async def liveness_probe():
    """Kubernetes liveness probe: returns 200 if process is up."""
    return {"status": "alive", "timestamp": time.time()}


@router.get("/health/ready")
async def readiness_probe():
    """Kubernetes readiness probe: checks DB & Redis responsiveness."""
    db_ok = await check_db_readiness()

    redis_client = await get_redis()
    redis_ok = True
    if redis_client is not None:
        try:
            await redis_client.ping()
        except Exception:
            redis_ok = False

    if not db_ok:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "database": "DOWN",
                "redis": "UP" if redis_ok else "DOWN",
            },
        )

    return {
        "status": "ready",
        "database": "UP" if db_ok else "DOWN",
        "redis": "UP" if redis_ok else "DEGRADED_FALLBACK",
        "uptime_seconds": round(time.time() - _START_TIME, 2),
    }


@router.get("/metrics")
async def metrics():
    """Prometheus-compatible plain text metrics."""
    uptime = time.time() - _START_TIME
    db_ok = 1 if await check_db_readiness() else 0

    metrics_text = (
        f"# HELP nexus_uptime_seconds Total application uptime in seconds\n"
        f"# TYPE nexus_uptime_seconds gauge\n"
        f"nexus_uptime_seconds {uptime:.2f}\n\n"
        f"# HELP nexus_database_up Database connection status (1 = up, 0 = down)\n"
        f"# TYPE nexus_database_up gauge\n"
        f"nexus_database_up {db_ok}\n\n"
        f"# HELP nexus_demo_mode Demo replay mode indicator\n"
        f"# TYPE nexus_demo_mode gauge\n"
        f"nexus_demo_mode {1 if settings.DEMO_REPLAY else 0}\n"
    )
    return Response(content=metrics_text, media_type="text/plain; version=0.0.4")
