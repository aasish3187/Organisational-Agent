import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_create_project_flow(client: AsyncClient):
    res = await client.post(
        "/api/projects",
        json={
            "title": "EdTech Exam Prep",
            "objective": "Build a multilingual AI platform",
            "classification": "internal",
            "owner_session": "session_demo",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["id"].startswith("prj_")
    assert data["title"] == "EdTech Exam Prep"


@pytest.mark.asyncio
async def test_intake_generates_idea_contract(client: AsyncClient, test_session: AsyncSession):
    # 1. Create project
    p_res = await client.post(
        "/api/projects",
        json={
            "title": "Multilingual B.Tech Prep",
            "objective": "Design an exam-prep platform",
            "classification": "internal",
            "owner_session": "session_demo",
        },
    )
    project_id = p_res.json()["id"]

    # 2. Run Intake
    intake_res = await client.post(
        f"/api/projects/{project_id}/intake",
        json={
            "raw_idea": "Design a multilingual AI exam-prep platform for B.Tech students in India",
            "domain": "edtech",
        },
    )
    assert intake_res.status_code == 200
    contract = intake_res.json()
    assert contract["domain"] == "edtech"
    assert contract["data_sensitivity"] == "student-data"
    assert len(contract["success_criteria"]) > 0
    assert len(contract["constraints"]) > 0
    assert contract["confidence"] >= 0.8


@pytest.mark.asyncio
async def test_organization_compiler_activates_risk_for_student_data(
    client: AsyncClient, test_session: AsyncSession
):
    # 1. Create project
    p_res = await client.post(
        "/api/projects",
        json={
            "title": "EdTech Platform",
            "objective": "Exam prep with student tracking",
            "classification": "internal",
            "owner_session": "session_demo",
        },
    )
    project_id = p_res.json()["id"]

    # 2. Run Intake
    await client.post(
        f"/api/projects/{project_id}/intake",
        json={
            "raw_idea": "Design a multilingual AI exam-prep platform for B.Tech students in India",
        },
    )

    # 3. Run Organization Compiler
    compile_res = await client.post(
        f"/api/projects/{project_id}/compile-organization",
        json={"mode": "BALANCED", "model_policy": "AUTO"},
    )
    assert compile_res.status_code == 200
    plan = compile_res.json()
    run_id = plan["run_id"]

    # Verify minimal governed team & Policy P-02 enforcement
    roles = [t["role"] for t in plan["tasks"]]
    assert "research_analyst" in roles
    assert "product_strategist" in roles
    assert "ai_architect" in roles  # activated due to multilingual
    assert "privacy_risk" in roles  # activated due to student-data (Policy P-02)
    assert "consistency_reviewer" in roles
    assert "solutions_officer" in roles

    # Verify human approval gates
    assert "sensitive-data-retention" in plan["human_gates"]

    # Verify MNEMOS process atom retrieval
    assert len(plan["retrieved_atoms"]) > 0

    # 4. Verify VERITAS hash chain integrity on the run
    verify_res = await client.get(f"/api/runs/{run_id}/verify")
    assert verify_res.status_code == 200
    verdict = verify_res.json()
    assert verdict["valid"] is True
    assert verdict["broken_at_index"] is None
    assert verdict["event_count"] >= 3
