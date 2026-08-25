from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.agent_instance import AgentInstance
from app.models.artifact import Artifact
from app.models.run import Run
from app.models.task import Task
from app.runtime.orchestrator import execute_run_step_by_step
from app.runtime.replay import replay_full_run
from app.schemas.run import RunResponse
from app.services.veritas import emit_event, verify_chain

router = APIRouter(prefix="/runs", tags=["Runs"])

SessionDep = Annotated[AsyncSession, Depends(get_db)]


class GateDecisionRequest(BaseModel):
    decision: str = Field(..., pattern="^(APPROVE|REJECT)$")
    reason: str = "Authorized by human operator"


@router.get("/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: str,
    session: SessionDep,
) -> RunResponse:
    stmt = select(Run).where(Run.id == run_id)
    result = await session.execute(stmt)
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunResponse.model_validate(run)


@router.get("/{run_id}/organization")
async def get_run_organization(
    run_id: str,
    session: SessionDep,
) -> dict[str, Any]:
    stmt_run = select(Run).where(Run.id == run_id)
    run_res = await session.execute(stmt_run)
    run = run_res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    stmt_agents = select(AgentInstance).where(AgentInstance.run_id == run_id)
    agents_res = await session.execute(stmt_agents)
    agents = agents_res.scalars().all()

    stmt_tasks = select(Task).where(Task.run_id == run_id)
    tasks_res = await session.execute(stmt_tasks)
    tasks = tasks_res.scalars().all()

    return {
        "run_id": run.id,
        "project_id": run.project_id,
        "mode": run.mode,
        "status": run.status,
        "tokens_used": run.tokens_used,
        "cost_usd": float(run.cost_usd or 0.0),
        "agents": [
            {
                "id": a.id,
                "role": a.role,
                "status": a.status,
                "token_budget": a.token_budget,
                "tokens_used": a.tokens_used,
                "permitted_tools": a.permitted_tools,
            }
            for a in agents
        ],
        "tasks": [
            {
                "id": t.id,
                "role": t.role,
                "status": t.status,
                "depends_on": t.depends_on,
                "output_schema": t.output_schema,
                "risk_level": t.risk_level,
                "token_budget": t.token_budget,
                "tokens_used": t.tokens_used,
            }
            for t in tasks
        ],
    }


@router.post("/{run_id}/step")
async def step_run(
    run_id: str,
    session: SessionDep,
) -> dict[str, Any]:
    """Execute next task in the run DAG."""
    return await execute_run_step_by_step(session, run_id)


@router.post("/{run_id}/replay")
async def replay_run(
    run_id: str,
    session: SessionDep,
) -> dict[str, Any]:
    """Execute complete replay pipeline for demo execution."""
    return await replay_full_run(session, run_id, step_delay=0.05)


@router.post("/{run_id}/gate-decision")
async def handle_gate_decision(
    run_id: str,
    payload: GateDecisionRequest,
    session: SessionDep,
) -> dict[str, Any]:
    """Handles Human Approval Gate decisions (APPROVE or REJECT)."""
    stmt_run = select(Run).where(Run.id == run_id)
    result = await session.execute(stmt_run)
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    if payload.decision == "APPROVE":
        run.status = "RUNNING"
        # Find paused task
        stmt_t = select(Task).where(Task.run_id == run_id, Task.status == "WAITING_FOR_HUMAN")
        t_res = await session.execute(stmt_t)
        task = t_res.scalar_one_or_none()
        if task:
            task.status = "APPROVED"

        await emit_event(
            session=session,
            run_id=run_id,
            event_type="gate_approved",
            actor="human",
            payload={"reason": payload.reason, "status": "APPROVED"},
        )
        await session.commit()
        # Resume next step
        return await execute_run_step_by_step(session, run_id, bypass_gates=True)
    else:
        run.status = "CANCELLED"
        await emit_event(
            session=session,
            run_id=run_id,
            event_type="gate_rejected",
            actor="human",
            payload={"reason": payload.reason, "status": "CANCELLED"},
        )
        await session.commit()
        return {"status": "CANCELLED", "reason": payload.reason}


@router.get("/{run_id}/blueprint")
async def get_run_blueprint(
    run_id: str,
    session: SessionDep,
) -> dict[str, Any]:
    """Fetches the FinalBlueprint artifact generated by Solutions Officer."""
    stmt_run = select(Run).where(Run.id == run_id)
    run_res = await session.execute(stmt_run)
    run = run_res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    stmt = (
        select(Artifact)
        .where(Artifact.project_id == run.project_id, Artifact.type == "FinalBlueprint")
        .order_by(Artifact.created_at.desc())
        .limit(1)
    )
    result = await session.execute(stmt)
    art = result.scalar_one_or_none()
    if not art:
        raise HTTPException(status_code=404, detail="Final Blueprint not found for this run.")

    return {
        "artifact_id": art.id,
        "type": art.type,
        "content": art.content,
        "confidence": art.confidence,
        "content_hash": art.content_hash,
        "created_at": art.created_at.isoformat() if art.created_at else None,
    }


@router.get("/{run_id}/verify")
async def verify_run_veritas(
    run_id: str,
    session: SessionDep,
) -> dict[str, Any]:
    """Cryptographically verifies the entire VERITAS SHA-256 hash chain for this run."""
    return await verify_chain(session, run_id)
