import hashlib
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.mission_interpreter import MissionInterpreterAgent
from app.agents.organization_compiler import OrganizationCompilerAgent
from app.core.database import get_db
from app.core.nanoid import new_id
from app.models.agent_instance import AgentInstance
from app.models.artifact import Artifact
from app.models.claim import Claim
from app.models.project import Project
from app.models.run import Run
from app.models.task import Task
from app.schemas.agents.idea_contract import IdeaContract
from app.schemas.agents.organization_plan import OrganizationPlan
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services.model_router import model_router
from app.services.veritas import canonical, emit_event

router = APIRouter(prefix="/projects", tags=["Projects"])

SessionDep = Annotated[AsyncSession, Depends(get_db)]

class IntakeRequest(BaseModel):
    raw_idea: str = Field(..., min_length=3)
    domain: str | None = None

class CompileRequest(BaseModel):
    mode: str = Field(default="BALANCED", pattern="^(FAST|BALANCED|DEEP)$")
    model_policy: str = Field(default="AUTO", pattern="^(STRICT|BALANCE|NOCAP|AUTO)$")

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    session: SessionDep,
) -> ProjectResponse:
    project = Project(
        id=new_id("prj"),
        title=payload.title,
        objective=payload.objective,
        classification=payload.classification,
        owner_session=payload.owner_session,
    )
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return ProjectResponse.model_validate(project)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    session: SessionDep,
) -> ProjectResponse:
    stmt = select(Project).where(Project.id == project_id)
    result = await session.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)

@router.post("/{project_id}/intake", response_model=IdeaContract)
async def submit_intake(
    project_id: str,
    payload: IntakeRequest,
    session: SessionDep,
) -> IdeaContract:
    # 1. Fetch project
    stmt = select(Project).where(Project.id == project_id)
    result = await session.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Run MissionInterpreter Agent
    interpreter = MissionInterpreterAgent()
    agent_res = await interpreter.run(
        inputs={"raw_idea": payload.raw_idea, "title": project.title},
        model_router_instance=model_router,
    )

    contract_data = agent_res.content
    canonical_content = canonical(contract_data)
    content_hash = hashlib.sha256(canonical_content.encode("utf-8")).hexdigest()

    # 3. Create or attach Run & Task for intake
    run_id = new_id("run")
    run = Run(
        id=run_id,
        project_id=project_id,
        mode="BALANCED",
        status="RUNNING",
        is_demo_replay=model_router.demo_mode,
    )
    session.add(run)

    task_id = new_id("tsk")
    task = Task(
        id=task_id,
        run_id=run_id,
        role="mission_interpreter",
        status="COMPLETED",
        output_schema="IdeaContract",
        token_budget=4000,
        tokens_used=agent_res.tokens_used,
    )
    session.add(task)

    # 4. Store Artifact & Claims
    artifact_id = new_id("art")
    artifact = Artifact(
        id=artifact_id,
        task_id=task_id,
        project_id=project_id,
        type="IdeaContract",
        content=contract_data,
        content_hash=content_hash,
        confidence=agent_res.confidence,
        assumptions=agent_res.assumptions,
        status="submitted",
        producer_role="mission_interpreter",
        producer_model=agent_res.model_used,
    )
    session.add(artifact)

    for clm in agent_res.claims:
        claim_obj = Claim(
            id=new_id("clm"),
            artifact_id=artifact_id,
            statement=clm["statement"],
            support_status=clm.get("support_status", "supported"),
            evidence_ids=clm.get("evidence_ids", []),
        )
        session.add(claim_obj)

    # 5. Emit VERITAS Events atomically in the same transaction
    await emit_event(
        session=session,
        run_id=run_id,
        event_type="intake_submitted",
        actor="human",
        payload={"raw_idea": payload.raw_idea, "project_id": project_id},
    )

    await emit_event(
        session=session,
        run_id=run_id,
        event_type="artifact_submitted",
        actor="mission_interpreter",
        payload={
            "artifact_id": artifact_id,
            "type": "IdeaContract",
            "confidence": agent_res.confidence,
            "content_hash": content_hash,
        },
    )

    await session.commit()
    return IdeaContract.model_validate(contract_data)

@router.post("/{project_id}/compile-organization", response_model=OrganizationPlan)
async def compile_organization(
    project_id: str,
    payload: CompileRequest,
    session: SessionDep,
) -> OrganizationPlan:
    # 1. Fetch project and latest IdeaContract artifact
    stmt = (
        select(Artifact)
        .where(Artifact.project_id == project_id, Artifact.type == "IdeaContract")
        .order_by(Artifact.created_at.desc())
        .limit(1)
    )
    result = await session.execute(stmt)
    contract_art = result.scalar_one_or_none()
    if not contract_art:
        raise HTTPException(
            status_code=400,
            detail="IdeaContract not found. Please complete mission intake first.",
        )

    # 2. Initialize Run
    run_id = new_id("run")
    run = Run(
        id=run_id,
        project_id=project_id,
        mode=payload.mode,
        model_policy=payload.model_policy,
        status="RUNNING",
        is_demo_replay=model_router.demo_mode,
    )
    session.add(run)

    # 3. Execute OrganizationCompiler
    compiler = OrganizationCompilerAgent()
    plan = await compiler.compile(
        session=session,
        contract=contract_art.content,
        run_id=run_id,
        project_id=project_id,
        mode=payload.mode,
        model_router_instance=model_router,
    )

    # 4. Create AgentInstances and Tasks
    agent_map: dict[str, str] = {}
    for task_spec in plan.tasks:
        if task_spec.role not in agent_map:
            agt_id = new_id("agt")
            agent_map[task_spec.role] = agt_id
            agent_inst = AgentInstance(
                id=agt_id,
                run_id=run_id,
                role=task_spec.role,
                status="PENDING",
                permitted_tools=task_spec.allowed_tools,
                token_budget=task_spec.token_budget,
            )
            session.add(agent_inst)

        task_obj = Task(
            id=task_spec.task_id,
            run_id=run_id,
            owner_agent_id=agent_map[task_spec.role],
            role=task_spec.role,
            depends_on=task_spec.depends_on,
            output_schema=task_spec.output_schema,
            review_required=task_spec.review_required,
            token_budget=task_spec.token_budget,
            risk_level=task_spec.risk_level,
            status="QUEUED",
        )
        session.add(task_obj)

    # 5. Emit VERITAS Events
    await emit_event(
        session=session,
        run_id=run_id,
        event_type="run_initialized",
        actor="system",
        payload={"mode": payload.mode, "project_id": project_id},
    )

    if plan.retrieved_atoms:
        await emit_event(
            session=session,
            run_id=run_id,
            event_type="mnemos_retrieved",
            actor="mnemos",
            payload={
                "retrieved_count": len(plan.retrieved_atoms),
                "atom_ids": [a.get("id") or a.get("atom_id") for a in plan.retrieved_atoms],
            },
        )

    await emit_event(
        session=session,
        run_id=run_id,
        event_type="organization_compiled",
        actor="organization_compiler",
        payload={
            "agent_count": len(agent_map),
            "task_count": len(plan.tasks),
            "human_gates": plan.human_gates,
        },
    )

    await session.commit()
    return plan
