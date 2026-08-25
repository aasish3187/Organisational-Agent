import asyncio
import json
import logging
import time
from typing import Any

from app.core.redis_client import get_redis

logger = logging.getLogger("nexus.queue")

QUEUE_NAME = "nexus:queue:tasks"
LOCK_PREFIX = "nexus:lock:run:"

# In-memory queue for offline / test modes
_memory_task_queue: asyncio.Queue = asyncio.Queue()


async def enqueue_run_task(
    run_id: str, priority: int = 1, metadata: dict[str, Any] | None = None
) -> bool:
    """Enqueue a run execution job onto Redis Task Queue (or memory queue)."""
    task_payload = {
        "run_id": run_id,
        "enqueued_at": time.time(),
        "priority": priority,
        "metadata": metadata or {},
    }
    payload_str = json.dumps(task_payload)

    client = await get_redis()
    if client is not None:
        try:
            await client.lpush(QUEUE_NAME, payload_str)
            logger.info("Enqueued run %s to Redis queue (%s)", run_id, QUEUE_NAME)
            return True
        except Exception as exc:
            logger.warning("Redis enqueue failed: %s. Using memory queue.", exc)

    await _memory_task_queue.put(task_payload)
    logger.info("Enqueued run %s to in-memory queue", run_id)
    return True


async def dequeue_run_task(timeout: float = 2.0) -> dict[str, Any] | None:
    """Dequeue a pending run job from Redis Task Queue (or memory queue)."""
    client = await get_redis()
    if client is not None:
        try:
            res = await client.brpop(QUEUE_NAME, timeout=int(timeout))
            if res and len(res) == 2:
                raw_payload = res[1]
                return json.loads(raw_payload)
            return None
        except Exception as exc:
            logger.warning("Redis dequeue failed: %s. Falling back to memory queue.", exc)

    try:
        task = await asyncio.wait_for(_memory_task_queue.get(), timeout=timeout)
        return task
    except asyncio.TimeoutError:
        return None


class DistributedLock:
    """Distributed lock on a run to prevent duplicate concurrent execution workers."""

    def __init__(self, run_id: str, ttl_sec: int = 120):
        self.lock_key = f"{LOCK_PREFIX}{run_id}"
        self.ttl_sec = ttl_sec
        self.acquired = False

    async def acquire(self) -> bool:
        client = await get_redis()
        if client is not None:
            try:
                ok = await client.set(self.lock_key, "1", nx=True, ex=self.ttl_sec)
                self.acquired = bool(ok)
                return self.acquired
            except Exception:
                pass
        self.acquired = True
        return True

    async def release(self) -> None:
        if not self.acquired:
            return
        client = await get_redis()
        if client is not None:
            try:
                await client.delete(self.lock_key)
            except Exception:
                pass
        self.acquired = False
