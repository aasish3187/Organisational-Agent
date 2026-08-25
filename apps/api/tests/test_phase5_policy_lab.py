import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_policy_catalog_and_simulation(client: AsyncClient, test_session: AsyncSession):
    # 1. Fetch Policy Catalog
    p_res = await client.get("/api/lab/policies")
    assert p_res.status_code == 200
    policies = p_res.json()
    assert len(policies) == 9
    codes = [p["code"] for p in policies]
    assert "P-01" in codes
    assert "P-02" in codes
    assert "P-07" in codes

    # 2. Simulate standard governed scenario (P-02 active)
    sim_res_gov = await client.post(
        "/api/lab/simulate",
        json={
            "domain": "edtech",
            "data_sensitivity": "student-data",
            "active_policies": [
                "P-01",
                "P-02",
                "P-03",
                "P-04",
                "P-05",
                "P-06",
                "P-07",
                "P-08",
                "P-09",
            ],
        },
    )
    assert sim_res_gov.status_code == 200
    gov_data = sim_res_gov.json()
    assert gov_data["evaluation"]["compliant"] is True
    assert "privacy_risk" in gov_data["projected_metrics"]["roles"]
    assert gov_data["projected_metrics"]["risk_score_pct"] <= 20

    # 3. Simulate counterfactual unconstrained scenario (P-02 DISABLED)
    sim_res_unconstrained = await client.post(
        "/api/lab/simulate",
        json={
            "domain": "edtech",
            "data_sensitivity": "student-data",
            "active_policies": ["P-01", "P-03", "P-04"],  # P-02 disabled
        },
    )
    assert sim_res_unconstrained.status_code == 200
    uncon_data = sim_res_unconstrained.json()
    assert uncon_data["evaluation"]["compliant"] is False
    assert uncon_data["projected_metrics"]["risk_score_pct"] > 70
    assert "P-02 VIOLATION" in uncon_data["evaluation"]["violations"][0]


@pytest.mark.asyncio
async def test_live_veritas_tamper_demonstration(client: AsyncClient, test_session: AsyncSession):
    # 1. Create project, intake, compile
    p_res = await client.post(
        "/api/projects",
        json={
            "title": "Tamper Demo Project",
            "objective": "Cryptographic tamper validation",
            "classification": "internal",
            "owner_session": "session_tamper",
        },
    )
    project_id = p_res.json()["id"]

    await client.post(
        f"/api/projects/{project_id}/intake", json={"raw_idea": "Tamper demonstration"}
    )
    comp_res = await client.post(
        f"/api/projects/{project_id}/compile-organization", json={"mode": "BALANCED"}
    )
    run_id = comp_res.json()["run_id"]

    # 2. Run steps to generate events
    await client.post(f"/api/runs/{run_id}/step")
    await client.post(f"/api/runs/{run_id}/step")

    # 3. Verify valid chain before tampering
    v1 = await client.get(f"/api/runs/{run_id}/verify")
    assert v1.json()["valid"] is True

    # 4. Inject deliberate hash corruption via Lab Tamper API
    tamper_res = await client.post(
        "/api/lab/tamper",
        json={
            "run_id": run_id,
            "target_sequence": 1,
            "corrupt_hash": "bad0000000000000000000000000000000000000000000000000000000000000",
        },
    )
    assert tamper_res.status_code == 200
    tamper_data = tamper_res.json()
    assert tamper_data["status"] == "TAMPER_INJECTED"
    assert tamper_data["verification_result"]["valid"] is False
    assert tamper_data["verification_result"]["broken_at_index"] == 1
