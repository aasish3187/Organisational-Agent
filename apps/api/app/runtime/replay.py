import asyncio
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.runtime.orchestrator import execute_run_step_by_step


async def replay_full_run(session: AsyncSession, run_id: str, step_delay: float = 0.4) -> dict[str, Any]:
    """
    Simulates / plays an entire demo run from compiled state to completion.
    Emits events step by step for real-time visualization on the living canvas.
    """
    steps_executed = 0
    while True:
        res = await execute_run_step_by_step(session, run_id)
        steps_executed += 1
        if res["status"] == "COMPLETED" or steps_executed > 15:
            break
        await asyncio.sleep(step_delay)

    return {
        "run_id": run_id,
        "status": "COMPLETED",
        "steps_executed": steps_executed,
    }
