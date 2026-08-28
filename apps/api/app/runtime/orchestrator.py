import hashlib
from decimal import Decimal
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.ai_architect import AIArchitectAgent
from app.agents.consistency_reviewer import ConsistencyReviewerAgent
from app.agents.privacy_risk import PrivacyRiskAgent
from app.agents.product_strategist import ProductStrategistAgent
from app.agents.research_analyst import ResearchAnalystAgent
from app.agents.solutions_officer import SolutionsOfficerAgent
from app.agents.system_architect import SystemArchitectAgent
from app.core.nanoid import new_id
from app.models.agent_instance import AgentInstance
from app.models.artifact import Artifact
from app.models.claim import Claim
from app.models.run import Run
from app.models.task import Task
from app.services.mnemos import mnemos_service
from app.services.model_router import model_router
from app.services.veritas import canonical, emit_event


async def execute_run_step_by_step(
    session: AsyncSession,
    run_id: str,
    bypass_gates: bool = False,
) -> dict[str, Any]:
    """
    Executes the next ready task in the run's DAG, pausing for human gates if necessary,
    emitting VERITAS events, and persisting structured artifacts.
    """
    stmt_run = select(Run).where(Run.id == run_id)
    result = await session.execute(stmt_run)
    run = result.scalar_one_or_none()
    if not run:
        raise ValueError(f"Run {run_id} not found")

    # If already paused for human gate
    if run.status == "WAITING_FOR_HUMAN" and not bypass_gates:
        return {
            "status": "WAITING_FOR_HUMAN",
            "message": "Run is waiting for human approval.",
            "task_executed": None,
        }

    # Fetch queued tasks
    stmt_tasks = select(Task).where(Task.run_id == run_id).order_by(Task.queued_at.asc())
    tasks_res = await session.execute(stmt_tasks)
    all_tasks = tasks_res.scalars().all()

    # Find first uncompleted task
    current_task = next(
        (
            t
            for t in all_tasks
            if t.status in ["QUEUED", "RUNNING", "WAITING_FOR_HUMAN", "APPROVED"]
        ),
        None,
    )
    if not current_task:
        # All completed
        run.status = "COMPLETED"
        await emit_event(
            session=session,
            run_id=run_id,
            event_type="run_completed",
            actor="system",
            payload={"status": "COMPLETED", "tokens_used": run.tokens_used},
        )

        # Trigger MNEMOS write-back
        await mnemos_service.learn_atom(
            session=session,
            name="EdTech Multilingual & Privacy Pattern",
            purpose="Reusable architecture for regional engineering curriculum and P-02 compliance",
            action="Apply dual-tier model hierarchy with 90-day automatic student data expiration.",
            applicability={"domain": "edtech", "data_sensitivity": "student-data"},
            tags=["multilingual", "student-privacy", "engineering", "p-02"],
            source_run_id=run_id,
        )

        await session.commit()
        return {"status": "COMPLETED", "task_executed": None}

    # Check if task triggers a Human Gate (BALANCED and DEEP modes)
    if (
        ("privacy" in current_task.role.lower() or "risk" in current_task.role.lower() or "compliance" in current_task.role.lower() or "safety" in current_task.role.lower() or current_task.role == "privacy_risk")
        and not bypass_gates
        and current_task.status != "APPROVED"
        and current_task.risk_level == "high"
        and run.mode != "FAST"
    ):
        current_task.status = "WAITING_FOR_HUMAN"
        run.status = "WAITING_FOR_HUMAN"
        await emit_event(
            session=session,
            run_id=run_id,
            event_type="gate_triggered",
            actor=current_task.role,
            payload={
                "gate_name": "sensitive-data-retention",
                "risk_level": "high",
                "reason": "Policy P-02 requires explicit human authorization for sensitive data retention and risk waiver.",
            },
        )
        await session.commit()
        return {
            "status": "WAITING_FOR_HUMAN",
            "gate_name": "sensitive-data-retention",
            "task_id": current_task.id,
            "role": current_task.role,
        }

    # Execute according to dynamic role
    role = current_task.role
    current_task.status = "RUNNING"
    await emit_event(
        session=session,
        run_id=run_id,
        event_type="task_started",
        actor=role,
        actor_id=current_task.owner_agent_id,
        payload={"task_id": current_task.id, "role": role},
    )

    # Fetch contract data for context
    stmt_art = (
        select(Artifact)
        .where(Artifact.project_id == run.project_id, Artifact.type == "IdeaContract")
        .order_by(Artifact.created_at.desc())
        .limit(1)
    )
    art_res = await session.execute(stmt_art)
    contract_art = art_res.scalar_one_or_none()
    contract_data = contract_art.content if contract_art else {}
    domain = contract_data.get("domain", "edtech")
    agent_inputs = {
        "domain": domain,
        "contract": contract_data,
        "raw_idea": contract_data.get("problem_statement", ""),
        "title": contract_data.get("title", ""),
    }

    r = role.lower()
    if "research" in r or "analyst" in r or "intelligence" in r or ("specialist" in r and "data" in r):
        agent = ResearchAnalystAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)
    elif "product" in r or "strategist" in r or "operations" in r:
        agent = ProductStrategistAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)
    elif "ai" in r or "model" in r or "rag" in r:
        agent = AIArchitectAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)
    elif "system" in r or "infra" in r or "ledger" in r or "iot" in r:
        agent = SystemArchitectAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)
    elif "privacy" in r or "risk" in r or "compliance" in r or "guard" in r or "safety" in r:
        agent = PrivacyRiskAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)
    elif "review" in r or "auditor" in r or "consistency" in r:
        agent = ConsistencyReviewerAgent()
        agent.role = role
        res = await agent.run(
            inputs={**agent_inputs, "artifacts": ["EvidenceBrief", "ProductSpec", "AIArchitectureSpec"]},
            model_router_instance=model_router,
        )
    elif "solution" in r or "officer" in r or "director" in r or "lead" in r:
        agent = SolutionsOfficerAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)
    else:
        agent = SolutionsOfficerAgent()
        agent.role = role
        res = await agent.run(inputs=agent_inputs, model_router_instance=model_router)

    # Store Artifact
    canonical_str = canonical(res.content)
    art_hash = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()
    art_id = new_id("art")

    artifact = Artifact(
        id=art_id,
        task_id=current_task.id,
        project_id=run.project_id,
        type=res.artifact_type,
        content=res.content,
        content_hash=art_hash,
        confidence=res.confidence,
        assumptions=res.assumptions,
        status="submitted",
        producer_role=role,
        producer_model=res.model_used,
    )
    session.add(artifact)

    # Store claims
    for clm in res.claims:
        claim_obj = Claim(
            id=new_id("clm"),
            artifact_id=art_id,
            statement=clm["statement"],
            support_status=clm.get("support_status", "supported"),
            evidence_ids=clm.get("evidence_ids", []),
        )
        session.add(claim_obj)

    # Update Task and Run metrics with proper Decimal typing
    current_task.status = "COMPLETED"
    current_task.tokens_used += res.tokens_used
    run.tokens_used += res.tokens_used
    additional_cost = Decimal(str(round(res.tokens_used * 0.0000005, 4)))
    run.cost_usd = (run.cost_usd or Decimal("0.0000")) + additional_cost

    # Update AgentInstance status
    if current_task.owner_agent_id:
        await session.execute(
            update(AgentInstance)
            .where(AgentInstance.id == current_task.owner_agent_id)
            .values(status="COMPLETED", tokens_used=AgentInstance.tokens_used + res.tokens_used)
        )

    # Emit VERITAS Artifact Submitted and Task Completed Events
    await emit_event(
        session=session,
        run_id=run_id,
        event_type="artifact_submitted",
        actor=role,
        actor_id=current_task.owner_agent_id,
        payload={
            "artifact_id": art_id,
            "artifact_type": res.artifact_type,
            "content_hash": art_hash,
            "confidence": res.confidence,
        },
    )

    await emit_event(
        session=session,
        run_id=run_id,
        event_type="task_completed",
        actor=role,
        actor_id=current_task.owner_agent_id,
        payload={"task_id": current_task.id, "tokens_used": res.tokens_used},
    )

    # Check if this was the last task in the run
    remaining_tasks = [
        t for t in all_tasks if t.id != current_task.id and t.status in ["QUEUED", "WAITING_FOR_HUMAN", "RUNNING"]
    ]
    if not remaining_tasks:
        run.status = "COMPLETED"
        await emit_event(
            session=session,
            run_id=run_id,
            event_type="run_completed",
            actor="system",
            payload={"status": "COMPLETED", "tokens_used": run.tokens_used},
        )
        # Trigger MNEMOS write-back
        await mnemos_service.learn_atom(
            session=session,
            name=f"{domain.capitalize()} Reusable Pattern",
            purpose=f"Reusable architecture for {domain} and governance compliance",
            action="Apply specialized role topology with automated policy verification.",
            applicability={"domain": domain, "data_sensitivity": contract_data.get("data_sensitivity", "internal")},
            tags=[domain, "governed", "p-02", "veritas"],
            source_run_id=run_id,
        )
        await session.commit()
        return {
            "status": "COMPLETED",
            "task_executed": current_task.id,
            "role": role,
            "artifact_id": art_id,
            "run_completed": True,
        }

    await session.commit()
    return {
        "status": "IN_PROGRESS",
        "task_executed": current_task.id,
        "role": role,
        "artifact_id": art_id,
    }
