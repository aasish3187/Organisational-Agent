import hashlib
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm_gateway import llm_gateway

router = APIRouter(prefix="/query", tags=["Direct Single-Agent Query"])


class DirectQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Single question or direct task prompt")
    context: Optional[str] = None
    model_policy: Optional[str] = "AUTO"


class DirectQueryResponse(BaseModel):
    query: str
    answer: str
    model_used: str
    latency_ms: int
    tokens_used: int
    cost_usd: float
    timestamp: str
    veritas_checksum: str
    suggested_action: str = "direct_answer"


@router.post("/direct", response_model=DirectQueryResponse)
async def handle_direct_query(payload: DirectQueryRequest) -> DirectQueryResponse:
    start_time = time.time()
    system_prompt = (
        "You are ORGagent Single-Agent Engine, a world-class AI system architect and engineer. "
        "Provide a direct, authoritative, crystal-clear, structured response to the user's question or task. "
        "Include clean markdown formatting, concise explanations, and production-grade code examples where applicable. "
        "Be direct and helpful without fluff."
    )
    user_prompt = payload.query
    if payload.context:
        user_prompt = f"Context: {payload.context}\n\nQuestion: {payload.query}"

    tier = "PRO" if payload.model_policy in ["AUTO", "NOCAP"] else "FLASH"
    answer_text, tokens, model_used, cost = await llm_gateway.generate_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        tier=tier,
    )

    latency_ms = max(int((time.time() - start_time) * 1000), 45)
    now_iso = datetime.now(timezone.utc).isoformat()
    raw_for_hash = f"{payload.query}:{answer_text}:{now_iso}"
    checksum = hashlib.sha256(raw_for_hash.encode("utf-8")).hexdigest()

    return DirectQueryResponse(
        query=payload.query,
        answer=answer_text,
        model_used=model_used,
        latency_ms=latency_ms,
        tokens_used=tokens,
        cost_usd=cost,
        timestamp=now_iso,
        veritas_checksum=checksum,
        suggested_action="direct_answer",
    )
