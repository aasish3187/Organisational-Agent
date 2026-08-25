from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.schemas.agents.product_spec import FeatureSpec, ProductSpec


class ProductStrategistAgent(BaseAgent):
    role = "product_strategist"
    mandate = "Translate research evidence and user contracts into prioritized MVP feature specifications and acceptance criteria."
    non_goals = [
        "Promise unvalidated market adoption metrics",
        "Invent non-MVP enterprise scope without human approval",
    ]
    output_schema = ProductSpec

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 5000,
    ) -> AgentResult:
        features = [
            FeatureSpec(
                name="Multilingual Diagnostic Exam Simulator",
                description="Timed practice module supporting synchronized English-Hindi-Telugu concept switching.",
                priority="P0",
                evidence_basis=["src_stem_ed_2025", "src_aicte_2024"],
            ),
            FeatureSpec(
                name="Curriculum-Mapped Syllabus Explorer",
                description="Granular subject topic tree aligned with university engineering syllabus.",
                priority="P0",
                evidence_basis=["src_aicte_2024"],
            ),
            FeatureSpec(
                name="Privacy-Preserving Adaptive Weak-Spot Tracker",
                description="Locally-computed mastery score with zero unencrypted telemetry export.",
                priority="P1",
                evidence_basis=[],
            ),
        ]

        spec = ProductSpec(
            product_name="NEXUS Prep OS",
            target_persona="Undergraduate engineering students preparing for semester and competitive exams",
            core_value_prop="High-fidelity, verified multilingual engineering exam prep with verifiable privacy guarantees.",
            features=features,
            mvp_release_criteria=[
                "Zero translation hallucinations on standard AICTE physics and maths glossary terms",
                "Sub-500ms concept toggle transition speed",
            ],
            non_goals=[
                "Building custom live video tutoring marketplace in MVP",
                "Automated grade reporting to external university servers without explicit student consent",
            ],
        )

        return AgentResult(
            artifact_type="ProductSpec",
            content=spec.model_dump(),
            confidence=0.89,
            assumptions=["Initial release targets foundational engineering subjects"],
            claims=[
                {
                    "claim_id": "clm_ps_1",
                    "statement": "Multilingual simulator addresses measured 34% native language comprehension benefit.",
                    "support_status": "supported",
                    "evidence_ids": ["src_stem_ed_2025"],
                }
            ],
            tokens_used=1420,
            model_used=model_router_instance.get_tier_name("reasoning"),
        )
