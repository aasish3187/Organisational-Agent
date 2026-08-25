import asyncio
import json
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, get_db
from app.models.event import Event
from app.models.run import Run

router = APIRouter(tags=["Events"])

SessionDep = Annotated[AsyncSession, Depends(get_db)]

@router.get("/runs/{run_id}/events")
async def stream_events(
    run_id: str,
    after_sequence: int = Query(default=-1),
):
    """
    SSE endpoint streaming VERITAS events as they are emitted for a run.
    """
    async def generator():
        last_seq = after_sequence
        # Poll new events with short interval
        for _ in range(120):  # Cap max poll duration per connection
            async with async_session_factory() as session:
                # 1. Fetch new events
                stmt = (
                    select(Event)
                    .where(Event.run_id == run_id, Event.sequence > last_seq)
                    .order_by(Event.sequence.asc())
                )
                result = await session.execute(stmt)
                new_events = result.scalars().all()

                for evt in new_events:
                    payload_dict = evt.to_sse_dict()
                    yield f"data: {json.dumps(payload_dict)}\n\n"
                    last_seq = evt.sequence

                # 2. Check run status
                stmt_run = select(Run.status).where(Run.id == run_id)
                run_res = await session.execute(stmt_run)
                status_row = run_res.first()
                run_status = status_row[0] if status_row else "INITIALIZING"

                if run_status in ("COMPLETED", "FAILED", "CANCELLED"):
                    yield f"data: {json.dumps({'type': 'stream_end', 'status': run_status})}\n\n"
                    break

            await asyncio.sleep(0.5)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
