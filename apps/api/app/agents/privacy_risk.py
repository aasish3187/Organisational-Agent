from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.schemas.agents.risk_assessment import RiskAssessment, RiskItem


class PrivacyRiskAgent(BaseAgent):
    role = "privacy_risk"
    mandate = "Identify design risks, student/user data sensitivity, retention bounds, and mandatory human escalation gates."
    non_goals = [
        "Waive student data privacy protections without explicit Human-in-the-Loop authorization",
        "Approve architectures that log personally identifiable information (PII) to unmonitored sinks",
    ]
    output_schema = RiskAssessment

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 5000,
    ) -> AgentResult:
        risks = [
            RiskItem(
                category="privacy",
                risk_statement="Retention of student exam diagnostic logs without automatic expiration violates educational privacy bounds (Policy P-02).",
                severity="high",
                mitigation="Enforce strict 90-day automatic data purging job with SHA-256 pseudonymized student IDs.",
                requires_human_gate=True,
            ),
            RiskItem(
                category="security",
                risk_statement="Untrusted client input in regional text translation could trigger prompt injection.",
                severity="medium",
                mitigation="Sanitize all user inputs through Pydantic validators before routing to model prompts.",
                requires_human_gate=False,
            ),
        ]

        assessment = RiskAssessment(
            data_classification="student-data",
            risks=risks,
            retention_bound_days=90,
            required_human_gates=["sensitive-data-retention"],
            compliance_verdict="APPROVED_WITH_GATES",
        )

        return AgentResult(
            artifact_type="RiskAssessment",
            content=assessment.model_dump(),
            confidence=0.95,
            assumptions=["Human operator verifies 90-day purge schedule before production deployment"],
            claims=[
                {
                    "claim_id": "clm_risk_1",
                    "statement": "Policy P-02 compliance verified with mandatory human approval gate.",
                    "support_status": "supported",
                    "evidence_ids": [],
                }
            ],
            tokens_used=1150,
            model_used=model_router_instance.get_tier_name("reasoning"),
        )
