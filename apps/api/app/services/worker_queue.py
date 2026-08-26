import asyncio
import logging
import time
from typing import Any, Callable, Coroutine
from app.core.nanoid import new_id

logger = logging.getLogger("nexus.worker_queue")


class WorkerTask:
    def __init__(self, job_id: str, run_id: str, task_name: str):
        self.job_id = job_id
        self.run_id = run_id
        self.task_name = task_name
        self.status = "QUEUED"
        self.result: Any = None
        self.error: str | None = None
        self.enqueued_at = time.time()
        self.started_at: float | None = None
        self.completed_at: float | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "job_id": self.job_id,
            "run_id": self.run_id,
            "task_name": self.task_name,
            "status": self.status,
            "result": self.result,
            "error": self.error,
            "enqueued_at": self.enqueued_at,
            "duration_ms": int(((self.completed_at or time.time()) - (self.started_at or self.enqueued_at)) * 1000),
        }


class WorkerQueue:
    def __init__(self, concurrency_limit: int = 10):
        self.concurrency_limit = concurrency_limit
        self.jobs: dict[str, WorkerTask] = {}
        self._lock = asyncio.Lock()

    async def enqueue(
        self,
        run_id: str,
        task_name: str,
        coro_fn: Callable[[], Coroutine[Any, Any, Any]],
    ) -> str:
        job_id = new_id("job")
        task = WorkerTask(job_id=job_id, run_id=run_id, task_name=task_name)
        async with self._lock:
            self.jobs[job_id] = task

        asyncio.create_task(self._run_job(task, coro_fn))
        return job_id

    async def _run_job(self, task: WorkerTask, coro_fn: Callable[[], Coroutine[Any, Any, Any]]) -> None:
        task.status = "RUNNING"
        task.started_at = time.time()
        try:
            res = await coro_fn()
            task.status = "COMPLETED"
            task.result = res
        except Exception as e:
            logger.error("Worker job %s failed: %s", task.job_id, str(e), exc_info=True)
            task.status = "FAILED"
            task.error = str(e)
        finally:
            task.completed_at = time.time()

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        task = self.jobs.get(job_id)
        return task.to_dict() if task else None

    def list_run_jobs(self, run_id: str) -> list[dict[str, Any]]:
        return [j.to_dict() for j in self.jobs.values() if j.run_id == run_id]


worker_queue = WorkerQueue()
