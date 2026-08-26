import asyncio
import json
from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.event import Event
from app.models.run import Run

router = APIRouter(prefix="/runs", tags=["Streaming"])


async def event_generator(run_id: str, request: Request) -> AsyncGenerator[str, None]:
    yield "event: connected\ndata: " + json.dumps({"run_id": run_id, "status": "connected"}) + "\n\n"

    last_sequence = -1
    consecutive_idle = 0

    while True:
        if await request.is_disconnected():
            break

        async with async_session_factory() as session:
            stmt = (
                select(Event)
                .where(Event.run_id == run_id, Event.sequence > last_sequence)
                .order_by(Event.sequence.asc())
            )
            result = await session.execute(stmt)
            new_events = result.scalars().all()

            if new_events:
                consecutive_idle = 0
                for evt in new_events:
                    last_sequence = evt.sequence
                    payload = {
                        "id": evt.id,
                        "sequence": evt.sequence,
                        "type": evt.type,
                        "actor": evt.actor,
                        "hash": evt.hash,
                        "prev_hash": evt.prev_hash,
                        "payload_canonical": evt.payload_canonical,
                        "timestamp": str(evt.timestamp),
                    }
                    yield "event: veritas_event\ndata: " + json.dumps(payload) + "\n\n"
            else:
                consecutive_idle += 1
                yield "event: ping\ndata: " + json.dumps({"heartbeat": True, "last_seq": last_sequence}) + "\n\n"

            stmt_run = select(Run.status).where(Run.id == run_id)
            run_res = await session.execute(stmt_run)
            status_val = run_res.scalar_one_or_none()
            if status_val in ["COMPLETED", "FAILED"] and consecutive_idle >= 2:
                yield "event: run_completed\ndata: " + json.dumps({"run_id": run_id, "status": status_val}) + "\n\n"
                break

        await asyncio.sleep(1.0)


@router.get("/{run_id}/stream")
async def stream_run_events(run_id: str, request: Request):
    return StreamingResponse(
        event_generator(run_id, request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
