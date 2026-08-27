from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.event import Event
from app.services.policy_engine import policy_engine
from app.services.veritas import verify_chain

router = APIRouter(prefix="/lab", tags=["Counterfactual Lab"])

SessionDep = Annotated[AsyncSession, Depends(get_db)]


class SimulationRequest(BaseModel):
    domain: str = "edtech"
    data_sensitivity: str = "student-data"
    model_policy: str = "AUTO"  # AUTO | STRICT | NOCAP
    active_policies: list[str] = Field(
        default_factory=lambda: [
            "P-01",
            "P-02",
            "P-03",
            "P-04",
            "P-05",
            "P-06",
            "P-07",
            "P-08",
            "P-09",
        ]
    )


class TamperRequest(BaseModel):
    run_id: str
    target_sequence: int = 1
    corrupt_hash: str = "bad0000000000000000000000000000000000000000000000000000000000000"


@router.get("/policies")
async def list_policies() -> list[dict[str, Any]]:
    """Returns the full catalog of ORGagent governance policies P-01 through P-09."""
    return policy_engine.list_policies()


@router.post("/simulate")
async def simulate_counterfactual(payload: SimulationRequest) -> dict[str, Any]:
    """
    Simulates organizational assembly and policy compliance under custom policy toggles.
    Returns impact on risk score, team size, token budget, and policy violations.
    """
    context = {
        "domain": payload.domain,
        "data_sensitivity": payload.data_sensitivity,
        "roles": ["research_analyst", "product_strategist", "ai_architect", "system_architect"],
        "human_gates": [],
        "allowed_tools": ["document_retrieval", "web_search"],
    }

    # If P-02 enabled and sensitivity high, add privacy role and gate
    if "P-02" in payload.active_policies and payload.data_sensitivity in [
        "student-data",
        "health",
        "financial",
    ]:
        context["roles"].append("privacy_risk")
        context["human_gates"].append("sensitive-data-retention")

    evaluation = policy_engine.evaluate_policies(
        context=context,
        active_policy_codes=payload.active_policies,
    )

    # If P-02 is disabled but data is sensitive, register unconstrained governance violation
    if "P-02" not in payload.active_policies and payload.data_sensitivity in [
        "student-data",
        "health",
        "financial",
    ]:
        evaluation["compliant"] = False
        evaluation["violations"].append(
            "P-02 VIOLATION (UNCONSTRAINED): Student data processed without mandatory retention limit or Privacy/Risk approval gate."
        )

    # Compute comparative metrics
    baseline_token_cost = 0.045
    sim_cost = baseline_token_cost
    if payload.model_policy == "STRICT":
        sim_cost *= 0.35  # Flash tier reduces cost
    elif payload.model_policy == "NOCAP":
        sim_cost *= 1.8

    risk_score = 15  # Low base risk
    if "P-02" not in payload.active_policies and payload.data_sensitivity == "student-data":
        risk_score += 65  # Massive privacy exposure risk
    if "P-01" not in payload.active_policies:
        risk_score += 20  # Hallucination risk

    return {
        "scenario": {
            "domain": payload.domain,
            "data_sensitivity": payload.data_sensitivity,
            "model_policy": payload.model_policy,
            "active_policies_count": len(payload.active_policies),
        },
        "evaluation": evaluation,
        "projected_metrics": {
            "team_size": len(context["roles"]),
            "roles": context["roles"],
            "human_gates_required": context["human_gates"],
            "risk_score_pct": risk_score,
            "estimated_token_cost_usd": round(sim_cost, 4),
        },
        "diff_summary": {
            "p02_privacy_shield": "P-02" in payload.active_policies,
            "governance_status": "GOVERNED" if evaluation["compliant"] else "VIOLATION_DETECTED",
        },
    }


@router.post("/tamper")
async def tamper_event_hash(
    payload: TamperRequest,
    session: SessionDep,
) -> dict[str, Any]:
    """
    Intentionally corrupts an event hash in the database to demonstrate
    VERITAS cryptographic tamper detection in live expo demos.
    """
    stmt = select(Event).where(
        Event.run_id == payload.run_id, Event.sequence == payload.target_sequence
    )
    result = await session.execute(stmt)
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(
            status_code=404,
            detail=f"Event sequence {payload.target_sequence} not found for run {payload.run_id}",
        )

    original_hash = event.hash
    event.hash = payload.corrupt_hash
    await session.commit()

    # Run verification to show the detection
    verdict = await verify_chain(session, payload.run_id)

    return {
        "status": "TAMPER_INJECTED",
        "run_id": payload.run_id,
        "target_sequence": payload.target_sequence,
        "original_hash": original_hash,
        "corrupted_hash": payload.corrupt_hash,
        "verification_result": verdict,
    }
