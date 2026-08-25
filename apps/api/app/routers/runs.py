from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.agent_instance import AgentInstance
from app.models.run import Run
from app.models.task import Task
from app.schemas.run import RunResponse
from app.services.veritas import verify_chain

router = APIRouter(prefix="/runs", tags=["Runs"])

SessionDep = Annotated[AsyncSession, Depends(get_db)]

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

@router.get("/{run_id}/verify")
async def verify_run_veritas(
    run_id: str,
    session: SessionDep,
) -> dict[str, Any]:
    """Cryptographically verifies the entire VERITAS SHA-256 hash chain for this run."""
    return await verify_chain(session, run_id)
