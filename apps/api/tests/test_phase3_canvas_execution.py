import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_full_replay_pipeline(client: AsyncClient, test_session: AsyncSession):
    # 1. Create project
    p_res = await client.post(
        "/api/projects",
        json={
            "title": "Phase 3 Execution Test",
            "objective": "Build multilingual test platform",
            "classification": "internal",
            "owner_session": "session_p3",
        },
    )
    project_id = p_res.json()["id"]

    # 2. Submit Intake
    await client.post(
        f"/api/projects/{project_id}/intake",
        json={"raw_idea": "Multilingual B.Tech AI exam-prep simulator in India"},
    )

    # 3. Compile Organization
    compile_res = await client.post(
        f"/api/projects/{project_id}/compile-organization",
        json={"mode": "BALANCED", "model_policy": "AUTO"},
    )
    plan = compile_res.json()
    run_id = plan["run_id"]

    # 4. Trigger Replay Execution
    replay_res = await client.post(f"/api/runs/{run_id}/replay")
    assert replay_res.status_code == 200
    replay_data = replay_res.json()
    assert replay_data["status"] == "COMPLETED"
    assert replay_data["steps_executed"] >= 3

    # 5. Verify Organization State after Replay
    org_res = await client.get(f"/api/runs/{run_id}/organization")
    assert org_res.status_code == 200
    org_data = org_res.json()
    assert org_data["tokens_used"] > 0

    # 6. Verify VERITAS Cryptographic Chain Integrity
    verify_res = await client.get(f"/api/runs/{run_id}/verify")
    assert verify_res.status_code == 200
    verdict = verify_res.json()
    assert verdict["valid"] is True
    assert verdict["broken_at_index"] is None
    assert verdict["event_count"] >= 5
