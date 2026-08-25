import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_full_governed_organization_and_approval_gate(
    client: AsyncClient, test_session: AsyncSession
):
    # 1. Create project
    p_res = await client.post(
        "/api/projects",
        json={
            "title": "Phase 4 Full Organization Test",
            "objective": "Design a multilingual AI exam-prep platform for B.Tech students in India",
            "classification": "internal",
            "owner_session": "session_p4",
        },
    )
    project_id = p_res.json()["id"]

    # 2. Submit Intake
    await client.post(
        f"/api/projects/{project_id}/intake",
        json={
            "raw_idea": "Design a multilingual AI exam-prep platform for B.Tech students in India"
        },
    )

    # 3. Compile Organization
    compile_res = await client.post(
        f"/api/projects/{project_id}/compile-organization",
        json={"mode": "BALANCED", "model_policy": "AUTO"},
    )
    run_id = compile_res.json()["run_id"]

    # 4. Step execution until Human Gate is hit
    s1 = await client.post(f"/api/runs/{run_id}/step")
    assert s1.json()["role"] == "research_analyst"

    s2 = await client.post(f"/api/runs/{run_id}/step")
    assert s2.json()["role"] == "product_strategist"

    s3 = await client.post(f"/api/runs/{run_id}/step")
    assert s3.json()["role"] == "ai_architect"

    s4 = await client.post(f"/api/runs/{run_id}/step")
    assert s4.json()["role"] == "system_architect"

    # Step 5: Privacy Risk triggers Human Gate (Policy P-02)
    s5 = await client.post(f"/api/runs/{run_id}/step")
    assert s5.json()["status"] == "WAITING_FOR_HUMAN"
    assert s5.json()["gate_name"] == "sensitive-data-retention"

    # 5. Approve Human Gate via API (this approves and executes privacy_risk)
    appr_res = await client.post(
        f"/api/runs/{run_id}/gate-decision",
        json={"decision": "APPROVE", "reason": "Operator authorized 90-day retention schedule."},
    )
    assert appr_res.status_code == 200
    assert appr_res.json()["role"] == "privacy_risk"

    # 6. Complete remaining steps (Consistency Reviewer, Solutions Officer)
    s6 = await client.post(f"/api/runs/{run_id}/step")  # Consistency Reviewer
    assert s6.json()["role"] == "consistency_reviewer"

    s7 = await client.post(f"/api/runs/{run_id}/step")  # Solutions Officer
    assert s7.json()["role"] == "solutions_officer"

    # Final run completed
    final_step = await client.post(f"/api/runs/{run_id}/step")
    assert final_step.json()["status"] == "COMPLETED"

    # 7. Fetch Final Blueprint
    bp_res = await client.get(f"/api/runs/{run_id}/blueprint")
    assert bp_res.status_code == 200
    bp_data = bp_res.json()
    assert bp_data["type"] == "FinalBlueprint"
    assert "NEXUS" in bp_data["content"]["project_title"]

    # 8. Verify VERITAS Cryptographic Hash Chain
    ver_res = await client.get(f"/api/runs/{run_id}/verify")
    assert ver_res.status_code == 200
    assert ver_res.json()["valid"] is True
    assert ver_res.json()["event_count"] >= 10
