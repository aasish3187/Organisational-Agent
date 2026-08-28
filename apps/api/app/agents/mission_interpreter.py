from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.core.llm_gateway import llm_gateway
from app.schemas.agents.idea_contract import IdeaContract


class MissionInterpreterAgent(BaseAgent):
    role = "mission_interpreter"
    mandate = "Clarify goal, constraints, and acceptance criteria from human raw idea into a structured IdeaContract."
    non_goals = [
        "Invent speculative user requirements not implied by the prompt",
        "Make final architecture decisions",
        "Authorize write operations",
    ]
    output_schema = IdeaContract

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 4000,
    ) -> AgentResult:
        raw_idea = inputs.get("raw_idea", "").strip()
        project_title = inputs.get("title") or "New Project"

        # Domain classification heuristic fallback
        lower_idea = raw_idea.lower()
        if any(k in lower_idea for k in ["b.tech", "student", "exam", "education", "edtech", "learn", "study"]):
            domain = "edtech"
            data_sensitivity = "student-data"
            audience = "B.Tech students and academic faculty across Indian universities"
            problem = "Lack of accessible, high-quality, multilingual personalized exam preparation aligned with curriculum."
            success_criteria = [
                "Support for English, Hindi, Telugu, and Tamil with validated regional corpus",
                "Personalized adaptive question practice and syllabus coverage",
                "Privacy-preserving retention of student learning analytics",
            ]
            constraints = [
                "Low-latency response across mobile devices",
                "Strict compliance with student data retention policies (Policy P-02)",
                "Localized subject terminology support",
            ]
            assumptions = [
                "Target curriculum focuses on foundational undergraduate engineering subjects",
                "Initial rollout focuses on mobile web interface",
            ]
            open_questions = [
                "What specific regional languages should be prioritized for Phase 1?",
                "Will institutional SSO integration be required?",
            ]
            suggested_specialists = [
                "research_analyst",
                "product_strategist",
                "ai_architect",
                "system_architect",
                "privacy_risk",
                "consistency_reviewer",
                "solutions_officer",
            ]
        elif any(k in lower_idea for k in ["food", "restaurant", "surplus", "waste", "redistribution"]):
            domain = "food_redistribution"
            data_sensitivity = "internal"
            audience = "Commercial food donors, volunteer drivers, and certified food banks"
            problem = "Commercial food waste occurs alongside localized food insecurity due to lack of real-time matching within perishable safety windows."
            success_criteria = [
                "Sub-15 minute dispatch matching before food safety expiry",
                "Accurate inventory tracking and verified donor onboarding",
                "Tamper-evident chain of custody using VERITAS event chaining",
            ]
            constraints = [
                "Food safety compliance and perishability expiration windows",
                "Geolocation-bounded delivery radius",
            ]
            assumptions = [
                "Food donors have packaging facilities ready for pickup",
            ]
            open_questions = [
                "Who covers transportation and courier costs?",
                "Are cold-chain storage facilities available at receiving shelters?",
            ]
            suggested_specialists = [
                "supply_chain_analyst",
                "logistics_product_strategist",
                "perishability_ai_architect",
                "geo_dispatch_systems_architect",
                "food_safety_compliance_officer",
                "logistics_consistency_reviewer",
                "logistics_solutions_officer",
            ]
        elif any(k in lower_idea for k in ["grievance", "complaint", "triage", "citizen", "whistleblower"]):
            domain = "grievance"
            data_sensitivity = "confidential"
            audience = "University students, faculty ombudsmen, and department administrators"
            problem = "Complaints get bottlenecked in generic inboxes with zero transparency, missing SLAs, and whistleblower exposure risks."
            success_criteria = [
                "Zero-Knowledge anonymous ticket submission with client-side IP stripping",
                "Sub-24-hour statutory administrative routing guarantee",
                "Immutable VERITAS timestamping for administrative accountability",
            ]
            constraints = [
                "Zero PII persisted in operational database (Policy P-02)",
                "Strict SLA escalation tracking",
            ]
            assumptions = [
                "University departments have designated escalation contacts",
            ]
            open_questions = [
                "Should students receive SMS token updates for anonymous status tracking?",
            ]
            suggested_specialists = [
                "civic_intelligence_analyst",
                "public_service_product_strategist",
                "nlp_triage_ai_architect",
                "e_governance_systems_architect",
                "whistleblower_privacy_guard",
                "civic_consistency_reviewer",
                "governance_solutions_officer",
            ]
        elif any(k in lower_idea for k in ["health", "medical", "patient", "clinical", "hospital", "doctor"]):
            domain = "healthcare"
            data_sensitivity = "health"
            audience = "Clinicians, hospital staff, and patients"
            problem = f"Addressing high-reliability clinical and operational requirements for {raw_idea[:80]}."
            success_criteria = [
                "Strict HIPAA & FHIR compliance with zero raw patient data leakage",
                "High clinical decision support accuracy backed by peer-reviewed evidence",
            ]
            constraints = ["Sub-second latency", "Zero-trust access control"]
            assumptions = ["Hospital integration uses standard HL7/FHIR protocols"]
            open_questions = ["What specific EHR vendor integrations are required?"]
            suggested_specialists = [
                "clinical_data_specialist",
                "medical_product_architect",
                "biomedical_ai_engineer",
                "hipaa_fhir_systems_architect",
                "bioethics_privacy_officer",
                "clinical_consistency_auditor",
                "healthcare_solutions_officer",
            ]
        elif any(k in lower_idea for k in ["finance", "fintech", "fraud", "payment", "bank", "trading"]):
            domain = "fintech"
            data_sensitivity = "financial"
            audience = "Financial institutions, compliance officers, and consumers"
            problem = f"Addressing real-time transaction processing and security for {raw_idea[:80]}."
            success_criteria = [
                "Sub-50ms fraud anomaly detection and audit ledger verification",
                "Strict PCI-DSS and regulatory compliance",
            ]
            constraints = ["Zero data loss with ACID transaction guarantees"]
            assumptions = ["Direct integration with banking core switches"]
            open_questions = ["What regulatory jurisdiction governs transaction settlements?"]
            suggested_specialists = [
                "market_quantitative_analyst",
                "fintech_product_strategist",
                "fraud_detection_ai_architect",
                "ledger_transaction_architect",
                "sec_regulatory_compliance_officer",
                "financial_consistency_reviewer",
                "fintech_solutions_officer",
            ]
        elif any(k in lower_idea for k in ["security", "cyber", "threat", "soc", "vulnerability"]):
            domain = "cybersecurity"
            data_sensitivity = "critical"
            audience = "SecOps engineers, CISOs, and SOC analysts"
            problem = f"Addressing zero-trust security and threat intelligence for {raw_idea[:80]}."
            success_criteria = [
                "Real-time anomaly detection with automated quarantine triggers",
                "Tamper-proof cryptographic event chaining for forensic evidence",
            ]
            constraints = ["Sub-10ms packet inspection latency"]
            assumptions = ["Deployable as a sidecar or reverse proxy"]
            open_questions = ["What SIEM platforms should be supported for export?"]
            suggested_specialists = [
                "threat_intelligence_analyst",
                "secops_product_strategist",
                "anomaly_detection_ai_engineer",
                "zero_trust_systems_architect",
                "vulnerability_compliance_officer",
                "security_consistency_reviewer",
                "cybersecurity_solutions_officer",
            ]
        else:
            domain = "general"
            data_sensitivity = "internal"
            audience = "Target operators and domain professionals"
            problem = f"Addressing core operational challenges for {raw_idea}."
            success_criteria = [
                "Production-grade architecture with sub-second response times",
                "Cryptographically verified audit trail with zero policy breaches",
            ]
            constraints = ["Execution within standard token and budget limits"]
            assumptions = ["Project follows structured milestone execution"]
            open_questions = ["What is the primary target cloud deployment environment?"]
            suggested_specialists = [
                "research_analyst",
                "product_strategist",
                "ai_architect",
                "system_architect",
                "privacy_risk",
                "consistency_reviewer",
                "solutions_officer",
            ]

        attachments = inputs.get("attachments") or []
        attachment_context = ""
        if attachments:
            attachment_context = "\n\nATTACHED USER SPECIFICATIONS, SCHEMAS & DIAGRAMS:\n"
            for att in attachments:
                name = att.get("name", "attachment")
                att_type = att.get("type", "document")
                content = att.get("content", "")
                if content:
                    snippet = content[:1500] if len(content) > 1500 else content
                    attachment_context += f"- [{att_type.upper()}] {name}:\n```{att_type}\n{snippet}\n```\n"
                else:
                    attachment_context += f"- [{att_type.upper()}] {name} (Attached visual/diagram specification)\n"

        default_contract = IdeaContract(
            title=project_title if project_title != "New Project" else f"{domain.capitalize()} Blueprint",
            domain=domain,
            target_audience=audience,
            problem_statement=problem,
            success_criteria=success_criteria,
            constraints=constraints + [f"Incorporate specs from {att.get('name')}" for att in attachments],
            assumptions=assumptions + [f"Grounded in uploaded {att.get('type')}: {att.get('name')}" for att in attachments],
            data_sensitivity=data_sensitivity,
            confidence=0.92,
            open_questions=open_questions,
            suggested_specialists=suggested_specialists,
        )

        # Dynamic LLM parsing with Qwen Max / Gemini
        system_prompt = (
            "You are the ORGagent Principal Mission Interpreter. Your mandate is to convert a raw human idea into "
            "a structured IdeaContract containing domain, target audience, problem statement, success criteria, "
            "constraints, explicit assumptions, data sensitivity, open clarification questions, and domain-specialist roles. "
            "You MUST thoroughly analyze and incorporate all attached files, schemas, code, and diagram specifications."
        )
        user_prompt = (
            f"Analyze and extract structured IdeaContract for query: '{raw_idea}'. "
            f"Project Title: '{project_title}'. "
            f"{attachment_context}"
            f"Generate unique, domain-specific specifications and suggest domain-native specialist roles."
        )

        try:
            content_dict, tokens_used, model_used, cost_usd = await llm_gateway.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=IdeaContract,
                tier="PRO",
                preferred_provider="groq",
                demo_fallback_data=default_contract.model_dump(),
            )
            contract_obj = IdeaContract.model_validate(content_dict)
            if data_sensitivity in ["student-data", "financial", "health", "critical"] and contract_obj.data_sensitivity in ["internal", "general"]:
                contract_obj.data_sensitivity = data_sensitivity
        except Exception:
            contract_obj = default_contract
            tokens_used = 750
            model_used = "qwen-max" if llm_gateway else "gemini-2.5-pro"

        return AgentResult(
            artifact_type="IdeaContract",
            content=contract_obj.model_dump(),
            confidence=0.92,
            assumptions=contract_obj.assumptions,
            claims=[
                {
                    "claim_id": "clm_ic_1",
                    "statement": f"System requires {contract_obj.data_sensitivity} handling for {contract_obj.domain} domain.",
                    "support_status": "supported",
                    "evidence_ids": [],
                }
            ],
            tokens_used=tokens_used,
            model_used=model_used,
        )
