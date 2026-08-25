from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Returns application health status and environment flags."""
    return HealthResponse(
        status="ok",
        app="NEXUS Organization OS",
        version="0.1.0",
        environment=settings.ENVIRONMENT,
        demo_mode=settings.DEMO_REPLAY,
    )
