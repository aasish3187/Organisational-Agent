import asyncio
import pytest
from app.services.worker_queue import WorkerQueue

@pytest.mark.asyncio
async def test_worker_queue_enqueue_and_complete():
    queue = WorkerQueue()

    async def sample_task():
        await asyncio.sleep(0.05)
        return {"result": "success", "data": 100}

    job_id = await queue.enqueue(
        run_id="run_test_123",
        task_name="unit_test_task",
        coro_fn=sample_task,
    )
    assert job_id.startswith("job_")
    
    # Wait for completion
    await asyncio.sleep(0.15)
    job = queue.get_job(job_id)
    assert job is not None
    assert job["status"] == "COMPLETED"
    assert job["result"]["data"] == 100
