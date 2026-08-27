import asyncio
import logging
import signal
from typing import Any

from app.core.config import settings
from app.core.database import async_session_factory
from app.runtime.orchestrator import Orchestrator
from app.runtime.queue import DistributedLock, dequeue_run_task

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("nexus.worker")

_should_stop = False


def handle_signals(sig, frame):
    global _should_stop
    logger.info("Received termination signal %s. Shutting down worker gracefully...", sig)
    _should_stop = True


async def process_task(task_payload: dict[str, Any]) -> None:
    run_id = task_payload.get("run_id")
    if not run_id:
        return

    lock = DistributedLock(run_id, ttl_sec=settings.TASK_TIMEOUT_SEC)
    acquired = await lock.acquire()
    if not acquired:
        logger.warning(
            "Could not acquire lock for run %s. Skipping (another worker is processing).", run_id
        )
        return

    logger.info("Processing run %s...", run_id)
    try:
        async with async_session_factory() as session:
            orchestrator = Orchestrator(session=session)
            # Execute tasks with timeout guard
            await asyncio.wait_for(
                orchestrator.run_to_completion(run_id),
                timeout=float(settings.TASK_TIMEOUT_SEC),
            )
            logger.info("Run %s processing finished.", run_id)
    except asyncio.TimeoutError:
        logger.error("Run %s timed out after %ds.", run_id, settings.TASK_TIMEOUT_SEC)
    except Exception as exc:
        logger.error("Error executing run %s: %s", run_id, exc, exc_info=True)
    finally:
        await lock.release()


async def run_worker(concurrency: int = 2) -> None:
    global _should_stop
    logger.info("ORGagent Background Task Worker starting with concurrency=%d...", concurrency)

    active_tasks: set[asyncio.Task] = set()

    while not _should_stop:
        # Clean up completed tasks
        done = {t for t in active_tasks if t.done()}
        active_tasks.difference_update(done)

        # Check concurrency slots
        if len(active_tasks) < concurrency:
            task_payload = await dequeue_run_task(timeout=1.0)
            if task_payload:
                t = asyncio.create_task(process_task(task_payload))
                active_tasks.add(t)
        else:
            await asyncio.sleep(0.2)

    # Wait for in-flight tasks to wrap up
    if active_tasks:
        logger.info("Waiting for %d in-flight tasks to complete...", len(active_tasks))
        await asyncio.gather(*active_tasks, return_exceptions=True)

    logger.info("ORGagent Worker stopped cleanly.")


def main():
    signal.signal(signal.SIGINT, handle_signals)
    signal.signal(signal.SIGTERM, handle_signals)
    asyncio.run(run_worker(concurrency=settings.WORKER_CONCURRENCY))


if __name__ == "__main__":
    main()
