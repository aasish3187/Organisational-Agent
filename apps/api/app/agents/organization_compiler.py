from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.schemas.agents.organization_plan import (
    OrganizationPlan,
    PlanBudget,
    SelectionRationale,
    TaskSpec,
)
from app.services.mnemos import retrieve_atoms


class OrganizationCompilerAgent(BaseAgent):
    role = "organization_compiler"
    mandate = "Compile minimal governed multi-agent organization and execution DAG from IdeaContract and MNEMOS memory."
    non_goals = [
        "Activate unneeded agent roles by default",
        "Grant unrestricted write permissions to any agent",
        "Bypass consistency reviewer or policy gates",
    ]
    output_schema = OrganizationPlan

    async def compile(
        self,
        session: AsyncSession,
        contract: dict[str, Any],
        run_id: str,
        project_id: str,
        mode: str = "BALANCED",
        model_router_instance: Any = None,
    ) -> OrganizationPlan:
        domain = contract.get("domain", "general")
        data_sensitivity = contract.get("data_sensitivity", "internal")
        goal = contract.get("problem_statement", "Execute project blueprint compilation")

        # Step 1: Retrieve relevant MNEMOS process atoms
        retrieved_atoms = await retrieve_atoms(
            session=session,
            domain=domain,
            deliverable_type="platform-blueprint",
            query_text=f"{contract.get('title', '')} {goal}",
            top_k=4,
        )

        rationale: list[SelectionRationale] = []
        tasks: list[TaskSpec] = []
        human_gates: list[str] = []

        # Always include Research & Product
        rationale.append(
            SelectionRationale(
                role="research_analyst",
                reason="Mandatory grounding with verified domain evidence and source evaluation.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_research",
                role="research_analyst",
                depends_on=[],
                allowed_tools=["web_search", "document_retrieval"],
                input_artifacts=["IdeaContract"],
                output_schema="EvidenceBrief",
                review_required=True,
                token_budget=5000,
                risk_level="low",
            )
        )

        rationale.append(
            SelectionRationale(
                role="product_strategist",
                reason="Defines core features, user journey, and bounded MVP scope.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_product",
                role="product_strategist",
                depends_on=["tsk_research"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["IdeaContract", "EvidenceBrief"],
                output_schema="ProductSpec",
                review_required=True,
                token_budget=5000,
                risk_level="low",
            )
        )

        # Domain-specific specialist activation & Policy P-02 check
        if domain == "edtech" or "multilingual" in goal.lower():
            # Check if reinforced by MNEMOS atom
            atom_ref = next(
                (a for a in retrieved_atoms if "multilingual" in a.get("tags", [])), None
            )
            rationale.append(
                SelectionRationale(
                    role="ai_architect",
                    reason="Designs multilingual model selection, embeddings, and regional dataset validation.",
                    source=f"mnemos_atom:{atom_ref['id']}" if atom_ref else None,
                )
            )
            tasks.append(
                TaskSpec(
                    task_id="tsk_ai_arch",
                    role="ai_architect",
                    depends_on=["tsk_product"],
                    allowed_tools=["document_retrieval"],
                    input_artifacts=["ProductSpec"],
                    output_schema="AIArchitecture",
                    review_required=True,
                    token_budget=5000,
                    risk_level="medium",
                )
            )

        # System Architecture
        rationale.append(
            SelectionRationale(
                role="system_architect",
                reason="Architects service components, API contracts, data flows, and infrastructure tier.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_sys_arch",
                role="system_architect",
                depends_on=["tsk_product"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["ProductSpec"],
                output_schema="SystemDesign",
                review_required=True,
                token_budget=5000,
                risk_level="low",
            )
        )

        # Policy P-02: Personal/Student/Health data activates Privacy/Risk Analyst
        if (
            data_sensitivity in ["student-data", "health", "financial", "high"]
            or domain == "edtech"
        ):
            atom_ref = next((a for a in retrieved_atoms if "privacy" in a.get("tags", [])), None)
            rationale.append(
                SelectionRationale(
                    role="privacy_risk",
                    reason=f"Policy P-02: {data_sensitivity} requires dedicated threat modeling and retention limits.",
                    source=f"mnemos_atom:{atom_ref['id']}" if atom_ref else None,
                )
            )
            human_gates.append("sensitive-data-retention")
            tasks.append(
                TaskSpec(
                    task_id="tsk_privacy_risk",
                    role="privacy_risk",
                    depends_on=["tsk_sys_arch"],
                    allowed_tools=["document_retrieval"],
                    input_artifacts=["SystemDesign", "ProductSpec"],
                    output_schema="RiskRegister",
                    review_required=True,
                    token_budget=5000,
                    risk_level="high",
                )
            )

        # Consistency Reviewer (Assurance layer)
        rationale.append(
            SelectionRationale(
                role="consistency_reviewer",
                reason="Cross-artifact verification checking contradictions, missing evidence, and policy adherence.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_reviewer",
                role="consistency_reviewer",
                depends_on=[t.task_id for t in tasks if t.task_id != "tsk_reviewer"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["EvidenceBrief", "ProductSpec", "SystemDesign"],
                output_schema="ReviewReport",
                review_required=False,
                token_budget=4000,
                risk_level="medium",
            )
        )

        # Solutions Officer (Final synthesis)
        rationale.append(
            SelectionRationale(
                role="solutions_officer",
                reason="Synthesizes verified inputs into a coherent, exportable Final Blueprint.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_final_blueprint",
                role="solutions_officer",
                depends_on=["tsk_reviewer"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["ProductSpec", "SystemDesign", "ReviewReport"],
                output_schema="FinalBlueprint",
                review_required=False,
                token_budget=6000,
                risk_level="low",
            )
        )

        max_tokens = 30000 if mode == "BALANCED" else 15000 if mode == "FAST" else 50000
        max_cost = 2.0 if mode == "BALANCED" else 1.0 if mode == "FAST" else 4.0
        max_minutes = 10 if mode == "BALANCED" else 5 if mode == "FAST" else 20

        return OrganizationPlan(
            run_id=run_id,
            project_id=project_id,
            mode=mode,
            goal=goal,
            selection_rationale=rationale,
            budget=PlanBudget(
                max_tokens=max_tokens,
                max_cost_usd=max_cost,
                max_minutes=max_minutes,
            ),
            tasks=tasks,
            human_gates=human_gates,
            retrieved_atoms=retrieved_atoms,
        )
