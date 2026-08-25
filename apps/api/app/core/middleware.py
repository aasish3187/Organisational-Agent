import logging
import time
import uuid
from collections.abc import Callable

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.redis_client import get_redis

logger = logging.getLogger("nexus.access")

# In-memory sliding window fallback for local testing
_in_memory_rate_limit: dict[str, list[float]] = {}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Hardened security headers for production HTTP responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


class CorrelationAndLoggingMiddleware(BaseHTTPMiddleware):
    """Tracks correlation IDs and structured access latency."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        correlation_id = request.headers.get("X-Correlation-ID") or f"req_{uuid.uuid4().hex[:12]}"

        # Attach to request state for downstream handlers
        request.state.correlation_id = correlation_id

        response = await call_next(request)

        duration_ms = round((time.time() - start_time) * 1000.0, 2)
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        # Skip spammy health / metrics logs
        if not request.url.path.startswith(("/health", "/metrics")):
            logger.info(
                "%s %s -> %d (%sms) [CID: %s]",
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
                correlation_id,
            )

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding window rate limiter backed by Redis (or in-memory store).
    Limits clients to settings.RATE_LIMIT_PER_MINUTE requests per minute.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not settings.RATE_LIMIT_ENABLED or request.url.path.startswith(
            ("/health", "/metrics", "/docs", "/openapi.json")
        ):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown_ip"
        limit = settings.RATE_LIMIT_PER_MINUTE
        window_sec = 60
        now = time.time()

        redis_client = await get_redis()
        is_limited = False
        remaining = limit

        if redis_client is not None:
            key = f"nexus:ratelimit:{client_ip}"
            try:
                pipe = redis_client.pipeline()
                pipe.zremrangebyscore(key, 0, now - window_sec)
                pipe.zadd(key, {str(now): now})
                pipe.zcard(key)
                pipe.expire(key, window_sec)
                results = await pipe.execute()
                current_count = results[2]
                remaining = max(0, limit - current_count)
                if current_count > limit:
                    is_limited = True
            except Exception:
                pass  # Fail open gracefully if Redis error
        else:
            # In-memory fallback
            timestamps = _in_memory_rate_limit.get(client_ip, [])
            timestamps = [t for t in timestamps if t > now - window_sec]
            timestamps.append(now)
            _in_memory_rate_limit[client_ip] = timestamps
            remaining = max(0, limit - len(timestamps))
            if len(timestamps) > limit:
                is_limited = True

        if is_limited:
            logger.warning("Rate limit exceeded for client %s", client_ip)
            return Response(
                content='{"detail":"Rate limit exceeded. Please try again shortly."}',
                status_code=429,
                media_type="application/json",
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response


def setup_production_middleware(app: FastAPI) -> None:
    """Register full security, rate limiting, and correlation middleware stack."""
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(CorrelationAndLoggingMiddleware)
