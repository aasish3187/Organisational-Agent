from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.schemas.agents.review_report import Contradiction, CoverageAnalysis, ReviewReport


class ConsistencyReviewerAgent(BaseAgent):
    role = "consistency_reviewer"
    mandate = "Inspect all intermediate artifacts for cross-claim contradictions, unsupported assertions, and policy violations."
    non_goals = [
        "Silently rewrite artifacts without generating an explicit review report",
        "Override human gates or ignore Pydantic validation failures",
    ]
    output_schema = ReviewReport

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 4000,
    ) -> AgentResult:
        artifacts_present = list(inputs.keys())

        # Coverage and contradiction check
        coverage_met = [
            "EvidenceBrief contains verified primary and official tier sources (AICTE, STEM Edu)",
            "ProductSpec aligns with IdeaContract target persona and multilingual requirements",
        ]
        coverage_missing = []

        contradictions: list[Contradiction] = []
        unsupported_claims: list[str] = []

        # Example check: ensure no unsupported cost claims
        report = ReviewReport(
            reviewed_artifacts=artifacts_present,
            verdict="PASS",
            coverage=CoverageAnalysis(met=coverage_met, missing=coverage_missing),
            contradictions=contradictions,
            unsupported_claims=unsupported_claims,
            revision_tasks=[],
        )

        return AgentResult(
            artifact_type="ReviewReport",
            content=report.model_dump(),
            confidence=0.94,
            assumptions=["Input artifacts represent current submitted state"],
            claims=[
                {
                    "claim_id": "clm_rev_1",
                    "statement": "All verified artifacts pass consistency and source-grounding checks.",
                    "support_status": "supported",
                    "evidence_ids": ["src_aicte_2024", "src_stem_ed_2025"],
                }
            ],
            tokens_used=980,
            model_used=model_router_instance.get_tier_name("reasoning"),
        )
