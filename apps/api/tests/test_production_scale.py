import asyncio

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import BaseModel

from app.core.llm_gateway import CircuitBreaker, LLMGateway
from app.main import app
from app.runtime.queue import DistributedLock, dequeue_run_task, enqueue_run_task


class SampleTestSchema(BaseModel):
    name: str
    score: int
    tags: list[str]


@pytest.mark.asyncio
async def test_circuit_breaker_state_transitions():
    """Verify circuit breaker trips on consecutive failures and recovers on timeout."""
    cb = CircuitBreaker(failure_threshold=2, reset_timeout=1)
    assert cb.state == "CLOSED"
    assert cb.can_attempt() is True

    # 1st failure
    cb.record_failure()
    assert cb.state == "CLOSED"
    assert cb.can_attempt() is True

    # 2nd failure -> Trips to OPEN
    cb.record_failure()
    assert cb.state == "OPEN"
    assert cb.can_attempt() is False

    # Wait for reset timeout
    await asyncio.sleep(1.1)
    assert cb.can_attempt() is True
    assert cb.state == "HALF_OPEN"

    # Success restores to CLOSED
    cb.record_success()
    assert cb.state == "CLOSED"
    assert cb.failure_count == 0


@pytest.mark.asyncio
async def test_llm_gateway_json_repair_and_validation():
    """Verify LLMGateway extracts JSON from markdown fences and repairs syntax."""
    gateway = LLMGateway()

    raw_markdown_json = """
    Here is the requested specification:
    ```json
    {
      "name": "NEXUS Core",
      "score": 98,
      "tags": ["governance", "security",],
    }
    ```
    """
    parsed = gateway.parse_schema(raw_markdown_json, SampleTestSchema)
    assert parsed["name"] == "NEXUS Core"
    assert parsed["score"] == 98
    assert parsed["tags"] == ["governance", "security"]


@pytest.mark.asyncio
async def test_llm_gateway_demo_fallback():
    """Verify LLMGateway falls back to validated demo data when live providers are unconfigured."""
    gateway = LLMGateway()
    demo_data = {"name": "Deterministic Blueprint", "score": 100, "tags": ["verified"]}

    content, tokens, model, cost = await gateway.generate_structured(
        system_prompt="System prompt",
        user_prompt="User prompt",
        schema=SampleTestSchema,
        demo_fallback_data=demo_data,
    )
    assert content["name"] == "Deterministic Blueprint"
    assert tokens > 0
    assert "demo" in model.lower()


@pytest.mark.asyncio
async def test_distributed_queue_and_lock():
    """Verify task enqueuing, dequeuing, and lock acquisition."""
    run_id = "run_test_queue_123"

    # 1. Lock acquisition
    lock = DistributedLock(run_id, ttl_sec=10)
    assert await lock.acquire() is True
    await lock.release()

    # 2. Enqueue & Dequeue
    await enqueue_run_task(run_id, priority=1, metadata={"source": "pytest"})
    task = await dequeue_run_task(timeout=2.0)
    assert task is not None
    assert task["run_id"] == run_id
    assert task["metadata"]["source"] == "pytest"


@pytest.mark.asyncio
async def test_production_health_probes_and_metrics():
    """Verify /health/live, /health/ready, and /metrics endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Liveness probe
        res_live = await client.get("/health/live")
        assert res_live.status_code == 200
        assert res_live.json()["status"] == "alive"

        # Readiness probe
        res_ready = await client.get("/health/ready")
        assert res_ready.status_code == 200
        assert res_ready.json()["status"] == "ready"
        assert res_ready.json()["database"] == "UP"

        # Telemetry metrics probe
        res_metrics = await client.get("/metrics")
        assert res_metrics.status_code == 200
        assert "nexus_uptime_seconds" in res_metrics.text
        assert "nexus_database_up 1" in res_metrics.text


@pytest.mark.asyncio
async def test_security_headers_middleware():
    """Verify production security headers are attached to API responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.headers.get("X-Content-Type-Options") == "nosniff"
        assert res.headers.get("X-Frame-Options") == "DENY"
        assert "X-Correlation-ID" in res.headers
        assert "X-Response-Time-Ms" in res.headers
