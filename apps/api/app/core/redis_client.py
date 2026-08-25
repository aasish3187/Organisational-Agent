import asyncio
import json
import logging
import time
from collections.abc import AsyncGenerator
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

logger = logging.getLogger("nexus.redis")

_pool: redis.ConnectionPool | None = None
_redis_client: redis.Redis | None = None
_last_connect_attempt: float = 0.0
_CONNECT_RETRY_INTERVAL: float = 10.0  # Retry Redis connect at most once every 10s

# In-memory pubsub fallback for offline / development standalone modes
_memory_channels: dict[str, list[asyncio.Queue]] = {}


async def get_redis() -> redis.Redis | None:
    """Retrieve or initialize shared async Redis client with connection pooling and fast fallback."""
    global _pool, _redis_client, _last_connect_attempt
    if _redis_client is not None:
        return _redis_client

    now = time.time()
    if now - _last_connect_attempt < _CONNECT_RETRY_INTERVAL:
        return None

    _last_connect_attempt = now
    try:
        _pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            max_connections=settings.REDIS_POOL_SIZE,
            decode_responses=True,
            retry_on_timeout=False,
            socket_connect_timeout=0.2,
            socket_timeout=0.5,
        )
        client = redis.Redis(connection_pool=_pool)
        await client.ping()
        _redis_client = client
        logger.info("Connected to Redis successfully at %s", settings.REDIS_URL)
        return _redis_client
    except Exception as exc:
        logger.info("Redis unavailable (%s). Operating on in-memory event & queue fallback.", exc)
        _redis_client = None
        if _pool is not None:
            try:
                await _pool.disconnect()
            except Exception:
                pass
            _pool = None
        return None


async def close_redis() -> None:
    """Gracefully close Redis pool and connection."""
    global _pool, _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.close()
        except Exception:
            pass
        _redis_client = None
    if _pool is not None:
        try:
            await _pool.disconnect()
        except Exception:
            pass
        _pool = None


async def publish_run_event(run_id: str, event_data: dict[str, Any]) -> None:
    """Publish a run event to Redis channel nexus:run:<run_id>:events (with memory fallback)."""
    channel = f"nexus:run:{run_id}:events"
    payload_str = json.dumps(event_data, default=str)

    client = await get_redis()
    if client is not None:
        try:
            await client.publish(channel, payload_str)
            return
        except Exception as exc:
            logger.warning("Redis publish failed: %s. Emitting to memory channel.", exc)

    # In-memory delivery
    if channel in _memory_channels:
        for q in list(_memory_channels[channel]):
            try:
                await q.put(event_data)
            except Exception:
                pass


async def subscribe_run_events(run_id: str) -> AsyncGenerator[dict[str, Any], None]:
    """Async generator yielding run events from Redis Pub/Sub channel (or memory queue)."""
    channel = f"nexus:run:{run_id}:events"
    client = await get_redis()

    if client is not None:
        pubsub = client.pubsub()
        try:
            await pubsub.subscribe(channel)
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.5)
                if message is not None and message.get("type") == "message":
                    raw_data = message.get("data")
                    if isinstance(raw_data, str):
                        try:
                            yield json.loads(raw_data)
                        except Exception:
                            yield {"raw": raw_data}
                    elif isinstance(raw_data, dict):
                        yield raw_data
                await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            pass
        finally:
            try:
                await pubsub.unsubscribe(channel)
                await pubsub.close()
            except Exception:
                pass
        return

    # In-memory queue fallback
    queue: asyncio.Queue = asyncio.Queue()
    if channel not in _memory_channels:
        _memory_channels[channel] = []
    _memory_channels[channel].append(queue)

    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=1.0)
                yield event
            except asyncio.TimeoutError:
                yield {"heartbeat": True, "time": asyncio.get_event_loop().time()}
    except asyncio.CancelledError:
        pass
    finally:
        if channel in _memory_channels and queue in _memory_channels[channel]:
            _memory_channels[channel].remove(queue)
