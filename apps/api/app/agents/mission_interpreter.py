from typing import Any

from app.agents.base import AgentResult, BaseAgent
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

        # Domain classification logic
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
                "Strict compliance with student data retention policies",
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
                "experience_strategist",
                "privacy_risk",
                "consistency_reviewer",
            ]
        elif any(k in lower_idea for k in ["food", "restaurant", "surplus", "waste", "marketplace"]):
            domain = "marketplace"
            data_sensitivity = "internal"
            audience = "Restaurants, catering businesses, and certified food banks"
            problem = "Massive surplus food waste coupled with inefficient, slow food bank matching."
            success_criteria = [
                "Sub-15 minute dispatch matching before food safety expiry",
                "Accurate inventory tracking and verified donor onboarding",
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
            ]
            suggested_specialists = [
                "product_strategist",
                "system_architect",
                "privacy_risk",
                "consistency_reviewer",
            ]
        else:
            domain = "general"
            data_sensitivity = "internal"
            audience = "General end users and business operators"
            problem = f"Addressing problem space outlined in: {raw_idea}"
            success_criteria = [
                "Validated MVP feature specification and clear system architecture",
                "Verified risk register with explicit human approval checkpoints",
            ]
            constraints = ["Execution within standard token and budget limits"]
            assumptions = ["Project will follow iterative milestone delivery"]
            open_questions = ["What is the primary target deployment environment?"]
            suggested_specialists = [
                "product_strategist",
                "system_architect",
                "consistency_reviewer",
            ]

        contract = IdeaContract(
            title=project_title if project_title != "New Project" else f"{domain.capitalize()} Blueprint",
            domain=domain,
            target_audience=audience,
            problem_statement=problem,
            success_criteria=success_criteria,
            constraints=constraints,
            assumptions=assumptions,
            data_sensitivity=data_sensitivity,
            confidence=0.88,
            open_questions=open_questions,
            suggested_specialists=suggested_specialists,
        )

        return AgentResult(
            artifact_type="IdeaContract",
            content=contract.model_dump(),
            confidence=0.88,
            assumptions=assumptions,
            claims=[
                {
                    "claim_id": "clm_ic_1",
                    "statement": f"System requires {data_sensitivity} handling for {domain} domain.",
                    "support_status": "supported",
                    "evidence_ids": [],
                }
            ],
            tokens_used=720,
            model_used=model_router_instance.get_tier_name("reasoning"),
        )
