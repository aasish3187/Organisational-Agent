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
    mandate = "Compile minimal governed multi-agent organization and execution DAG dynamically tailored to IdeaContract and MNEMOS memory."
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

        # Determine dynamic domain-native role names
        g_lower = goal.lower()
        if domain == "food_redistribution" or "food" in g_lower or "redistribution" in g_lower:
            r_research = "supply_chain_analyst"
            r_product = "logistics_product_strategist"
            r_ai = "perishability_ai_architect"
            r_system = "geo_dispatch_systems_architect"
            r_privacy = "food_safety_compliance_officer"
            r_reviewer = "logistics_consistency_reviewer"
            r_solutions = "logistics_solutions_officer"
            gate_name = "food-safety-compliance-check"
            gate_reason = "Food safety guidelines require verification of cold-chain and perishability time limits."
        elif domain == "grievance" or "grievance" in g_lower or "complaint" in g_lower:
            r_research = "civic_intelligence_analyst"
            r_product = "public_service_product_strategist"
            r_ai = "nlp_triage_ai_architect"
            r_system = "e_governance_systems_architect"
            r_privacy = "whistleblower_privacy_guard"
            r_reviewer = "civic_consistency_reviewer"
            r_solutions = "governance_solutions_officer"
            gate_name = "sensitive-data-retention"
            gate_reason = "Policy P-02 requires zero-knowledge citizen anonymization and retention authorization."
        elif domain == "healthcare" or "health" in g_lower or "medical" in g_lower or "clinical" in g_lower:
            r_research = "clinical_data_specialist"
            r_product = "medical_product_architect"
            r_ai = "biomedical_ai_engineer"
            r_system = "hipaa_fhir_systems_architect"
            r_privacy = "bioethics_privacy_officer"
            r_reviewer = "clinical_consistency_auditor"
            r_solutions = "healthcare_solutions_officer"
            gate_name = "sensitive-data-retention"
            gate_reason = "HIPAA and Policy P-02 require explicit human authorization for patient health telemetry."
        elif domain == "fintech" or "finance" in g_lower or "trading" in g_lower or "banking" in g_lower:
            r_research = "market_quantitative_analyst"
            r_product = "fintech_product_strategist"
            r_ai = "fraud_detection_ai_architect"
            r_system = "ledger_transaction_architect"
            r_privacy = "sec_regulatory_compliance_officer"
            r_reviewer = "financial_consistency_reviewer"
            r_solutions = "fintech_solutions_officer"
            gate_name = "sensitive-data-retention"
            gate_reason = "Financial compliance requires human audit approval for transaction logging policies."
        elif domain == "cybersecurity" or "security" in g_lower or "threat" in g_lower:
            r_research = "threat_intelligence_analyst"
            r_product = "secops_product_strategist"
            r_ai = "anomaly_detection_ai_engineer"
            r_system = "zero_trust_systems_architect"
            r_privacy = "vulnerability_compliance_officer"
            r_reviewer = "security_consistency_reviewer"
            r_solutions = "cybersecurity_solutions_officer"
            gate_name = "sensitive-data-retention"
            gate_reason = "Zero-trust protocol requires authorization for security audit retention waiver."
        else:
            # EdTech / Default standard specialization
            r_research = "research_analyst"
            r_product = "product_strategist"
            r_ai = "ai_architect"
            r_system = "system_architect"
            r_privacy = "privacy_risk"
            r_reviewer = "consistency_reviewer"
            r_solutions = "solutions_officer"
            gate_name = "sensitive-data-retention"
            gate_reason = "Policy P-02 requires explicit human authorization for student diagnostic data retention."

        # 1. Research Analyst Role
        rationale.append(
            SelectionRationale(
                role=r_research,
                reason=f"Mandatory grounding with verified {domain} domain evidence and empirical source evaluation.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_research",
                role=r_research,
                depends_on=[],
                allowed_tools=["web_search", "document_retrieval"],
                input_artifacts=["IdeaContract"],
                output_schema="EvidenceBrief",
                review_required=True,
                token_budget=5000,
                risk_level="low",
            )
        )

        # 2. Product Strategist Role
        rationale.append(
            SelectionRationale(
                role=r_product,
                reason=f"Defines core {domain} feature specifications, user personas, and bounded MVP release criteria.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_product",
                role=r_product,
                depends_on=["tsk_research"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["IdeaContract", "EvidenceBrief"],
                output_schema="ProductSpec",
                review_required=True,
                token_budget=5000,
                risk_level="low",
            )
        )

        # 3. AI Architect Role
        atom_ref = next((a for a in retrieved_atoms if "multilingual" in a.get("tags", []) or "ai" in a.get("tags", [])), None)
        atom_ref_id = (atom_ref.get("atom_id") or atom_ref.get("id")) if atom_ref else None
        rationale.append(
            SelectionRationale(
                role=r_ai,
                reason=f"Designs foundation model tiers, embeddings, vector indexing, and RAG prompt topologies for {domain}.",
                source=f"mnemos_atom:{atom_ref_id}" if atom_ref_id else None,
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_ai_arch",
                role=r_ai,
                depends_on=["tsk_product"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["ProductSpec"],
                output_schema="AIArchitectureSpec",
                review_required=True,
                token_budget=5000,
                risk_level="medium",
            )
        )

        # 4. System Architect Role
        rationale.append(
            SelectionRationale(
                role=r_system,
                reason=f"Architects microservice APIs, database schemas, Redis event queues, and Docker infrastructure for {domain}.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_sys_arch",
                role=r_system,
                depends_on=["tsk_product"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["ProductSpec"],
                output_schema="SystemArchitectureSpec",
                review_required=True,
                token_budget=5000,
                risk_level="low",
            )
        )

        # 5. Privacy & Risk Governance Role (Policy P-02)
        atom_ref_priv = next((a for a in retrieved_atoms if "privacy" in a.get("tags", [])), None)
        atom_ref_priv_id = (atom_ref_priv.get("atom_id") or atom_ref_priv.get("id")) if atom_ref_priv else None
        rationale.append(
            SelectionRationale(
                role=r_privacy,
                reason=f"Policy P-02: {data_sensitivity} requires dedicated threat modeling and retention limits. {gate_reason}",
                source=f"mnemos_atom:{atom_ref_priv_id}" if atom_ref_priv_id else None,
            )
        )
        human_gates.append(gate_name)
        tasks.append(
            TaskSpec(
                task_id="tsk_privacy_risk",
                role=r_privacy,
                depends_on=["tsk_sys_arch"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["SystemArchitectureSpec", "ProductSpec"],
                output_schema="RiskAssessment",
                review_required=True,
                token_budget=5000,
                risk_level="high",
            )
        )

        # 6. Consistency Reviewer Assurance Role
        rationale.append(
            SelectionRationale(
                role=r_reviewer,
                reason="Cross-artifact verification checking contradictions, missing evidence, and policy compliance.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_reviewer",
                role=r_reviewer,
                depends_on=["tsk_ai_arch", "tsk_privacy_risk"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["EvidenceBrief", "ProductSpec", "SystemArchitectureSpec", "RiskAssessment"],
                output_schema="ReviewReport",
                review_required=False,
                token_budget=4000,
                risk_level="medium",
            )
        )

        # 7. Solutions Officer Synthesis Role
        rationale.append(
            SelectionRationale(
                role=r_solutions,
                reason=f"Synthesizes all verified {domain} inputs into an exportable Master Blueprint with code scaffolds and VERITAS seal.",
            )
        )
        tasks.append(
            TaskSpec(
                task_id="tsk_final_blueprint",
                role=r_solutions,
                depends_on=["tsk_reviewer"],
                allowed_tools=["document_retrieval"],
                input_artifacts=["ProductSpec", "SystemArchitectureSpec", "ReviewReport"],
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
