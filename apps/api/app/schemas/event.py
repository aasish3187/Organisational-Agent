from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    sequence: int
    type: str
    actor: str
    actor_id: str | None = None
    payload: dict[str, Any]
    payload_canonical: str
    prev_hash: str
    hash: str
    timestamp: datetime
