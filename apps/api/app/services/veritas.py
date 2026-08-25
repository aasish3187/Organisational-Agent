import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.nanoid import new_id
from app.models.event import Event

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def format_timestamp(dt: Any) -> str:
    """Format timestamp consistently as UTC ISO string across PostgreSQL and SQLite."""
    if isinstance(dt, str):
        return dt
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    return str(dt)

def canonical(payload: dict[str, Any]) -> str:
    """Deterministic JSON serialization. Store this string; never re-derive at verify time."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)

def compute_hash(prev_hash: str, payload_canonical: str, timestamp: str) -> str:
    raw = f"{prev_hash}{payload_canonical}{timestamp}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

async def emit_event(
    session: AsyncSession,
    run_id: str,
    event_type: str,
    actor: str,
    payload: dict[str, Any],
    actor_id: str | None = None,
) -> Event:
    """
    Chain-write an event atomically. NEVER call this outside a transaction.
    The event + its hash must land in the DB in a single commit.
    """
    stmt = (
        select(Event.hash, Event.sequence)
        .where(Event.run_id == run_id)
        .order_by(Event.sequence.desc())
        .limit(1)
    )
    result = await session.execute(stmt)
    last = result.first()
    
    prev_hash = last[0] if last else GENESIS_HASH
    next_seq = (last[1] + 1) if last else 0

    now_dt = datetime.now(timezone.utc)
    timestamp_str = format_timestamp(now_dt)
    payload_str = canonical(payload)
    event_hash = compute_hash(prev_hash, payload_str, timestamp_str)

    event = Event(
        id=new_id("evt"),
        run_id=run_id,
        sequence=next_seq,
        type=event_type,
        actor=actor,
        actor_id=actor_id,
        payload=payload,
        payload_canonical=payload_str,   # Stored once, read at verify time
        prev_hash=prev_hash,
        hash=event_hash,
        timestamp=now_dt,
    )
    session.add(event)
    return event

async def verify_chain(session: AsyncSession, run_id: str) -> dict[str, Any]:
    """
    Recompute the chain. Reads payload_canonical from storage (never re-serializes).
    Returns: {valid: bool, event_count: int, broken_at_index: int | None, message: str}
    """
    stmt = (
        select(Event.sequence, Event.prev_hash, Event.hash, Event.payload_canonical, Event.timestamp)
        .where(Event.run_id == run_id)
        .order_by(Event.sequence.asc())
    )
    result = await session.execute(stmt)
    events = result.all()
    if not events:
        return {
            "valid": False,
            "event_count": 0,
            "broken_at_index": None,
            "message": "No events found for this run.",
        }

    expected_prev = GENESIS_HASH
    for evt in events:
        seq, prev_h, current_h, payload_str, ts = evt
        ts_str = format_timestamp(ts)
        expected_hash = compute_hash(prev_h, payload_str, ts_str)
        if prev_h != expected_prev:
            return {
                "valid": False,
                "event_count": len(events),
                "broken_at_index": seq,
                "message": f"Chain broken at event {seq}: prev_hash mismatch.",
            }
        if current_h != expected_hash:
            return {
                "valid": False,
                "event_count": len(events),
                "broken_at_index": seq,
                "message": f"Chain broken at event {seq}: hash mismatch (payload tampered?).",
            }
        expected_prev = current_h

    return {
        "valid": True,
        "event_count": len(events),
        "broken_at_index": None,
        "message": f"All {len(events)} events verified. Chain intact.",
    }
