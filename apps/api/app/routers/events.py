import asyncio
import json
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, get_db
from app.core.redis_client import subscribe_run_events
from app.models.event import Event

router = APIRouter(tags=["Events"])

SessionDep = Annotated[AsyncSession, Depends(get_db)]


@router.get("/runs/{run_id}/events")
async def stream_events(
    run_id: str,
    after_sequence: int = Query(default=-1),
    last_event_id: str | None = Header(default=None),
):
    """
    Enterprise SSE Streaming Endpoint with Redis Pub/Sub backend
    and Last-Event-ID catchup recovery.
    """
    # Parse starting sequence
    start_seq = after_sequence
    if last_event_id and last_event_id.isdigit():
        start_seq = max(start_seq, int(last_event_id))

    async def event_generator():
        last_seq = start_seq

        # 1. Backfill existing events from DB
        async with async_session_factory() as session:
            stmt = (
                select(Event)
                .where(Event.run_id == run_id, Event.sequence > last_seq)
                .order_by(Event.sequence.asc())
            )
            result = await session.execute(stmt)
            for evt in result.scalars().all():
                payload_dict = evt.to_sse_dict()
                last_seq = max(last_seq, evt.sequence)
                yield f"id: {evt.sequence}\nevent: message\ndata: {json.dumps(payload_dict)}\n\n"

        # 2. Subscribe to live Redis Pub/Sub events
        try:
            async for event_data in subscribe_run_events(run_id):
                if event_data.get("heartbeat"):
                    yield ": heartbeat\n\n"
                    continue

                seq = event_data.get("sequence", last_seq + 1)
                if seq > last_seq:
                    last_seq = seq
                    yield f"id: {seq}\nevent: message\ndata: {json.dumps(event_data)}\n\n"

                # Check if terminal
                if event_data.get("type") in ("run_completed", "run_failed", "stream_end"):
                    yield f"data: {json.dumps({'type': 'stream_end', 'status': event_data.get('type')})}\n\n"
                    break
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",  # NGINX SSE buffer bypass
            "Access-Control-Allow-Origin": "*",
        },
    )
