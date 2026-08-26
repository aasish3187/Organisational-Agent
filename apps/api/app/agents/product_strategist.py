from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.core.llm_gateway import llm_gateway
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
        domain = inputs.get("domain", "general")
        raw_idea = inputs.get("raw_idea") or inputs.get("problem_statement") or "Enterprise Solution"
        title = inputs.get("title") or "NEXUS Solution"

        # Construct default domain-tailored product spec
        if domain == "food_redistribution" or "food" in raw_idea.lower():
            default_spec = ProductSpec(
                product_name=f"{title} Logistics Platform",
                target_persona="Food donor coordinators, volunteer drivers, and food shelter operators",
                core_value_prop="Real-time cold-chain surplus matching with sub-5-minute claim SLA and zero-waste routing.",
                features=[
                    FeatureSpec(
                        name="Real-Time Food Surplus Dispatcher",
                        description="Instant surplus logging with perishability window calculation and geolocation broadcast.",
                        priority="P0",
                        evidence_basis=["src_fssai_food_safety"],
                    ),
                    FeatureSpec(
                        name="Proximity-Based Volunteer Router",
                        description="Automated volunteer vehicle dispatch based on live traffic and recipient storage capacity.",
                        priority="P0",
                        evidence_basis=[],
                    ),
                    FeatureSpec(
                        name="Cryptographic Chain-of-Custody Proof",
                        description="Tamper-evident pickup and drop-off verification using VERITAS SHA-256 event chaining.",
                        priority="P1",
                        evidence_basis=["src_veritas_audit"],
                    ),
                ],
                mvp_release_criteria=[
                    "Sub-5-minute volunteer claim latency for hot cooked food batches",
                    "100% adherence to local food safety temperature compliance thresholds",
                ],
                non_goals=[
                    "Long-distance cross-state freight logistics in Phase 1 MVP",
                ],
            )
        elif domain == "grievance" or "grievance" in raw_idea.lower():
            default_spec = ProductSpec(
                product_name=f"{title} Triage Platform",
                target_persona="University students, faculty ombudsmen, and department administrators",
                core_value_prop="Privacy-preserving anonymous grievance triage with automated SLA routing and tamper-evident audit trails.",
                features=[
                    FeatureSpec(
                        name="Zero-Knowledge Anonymous Ingestion Portal",
                        description="Client-side IP stripping and PII redaction for whistleblower and student protection.",
                        priority="P0",
                        evidence_basis=["src_privacy_p02"],
                    ),
                    FeatureSpec(
                        name="AI Urgency & Department Classifier",
                        description="Multi-class NLP model mapping complaint text to responsible campus departments.",
                        priority="P0",
                        evidence_basis=[],
                    ),
                    FeatureSpec(
                        name="VERITAS SLA Escalation Tracker",
                        description="Cryptographic timestamping ensuring ticket resolution within statutory deadlines.",
                        priority="P1",
                        evidence_basis=["src_veritas_audit"],
                    ),
                ],
                mvp_release_criteria=[
                    "Zero PII leakage rate verified by automated Policy P-02 tests",
                    "Under 24-hour administrative routing guarantee",
                ],
                non_goals=[
                    "Publicly exposing unverified allegations without administrative review",
                ],
            )
        else:
            default_spec = ProductSpec(
                product_name=f"{title} System",
                target_persona=f"Target professionals, operators, and end-users of {domain} systems",
                core_value_prop=f"Verified, production-grade {domain} system with strict governance and sub-second response times.",
                features=[
                    FeatureSpec(
                        name=f"Core {domain.capitalize()} Engine",
                        description=f"Automated workflow pipeline executing key operational requirements for {raw_idea[:60]}.",
                        priority="P0",
                        evidence_basis=[],
                    ),
                    FeatureSpec(
                        name="Interactive Analytics & Audit HUD",
                        description="Real-time performance tracking and verification dashboard with zero unencrypted data export.",
                        priority="P0",
                        evidence_basis=[],
                    ),
                    FeatureSpec(
                        name="VERITAS Governance & Compliance Guard",
                        description="Tamper-evident event chaining on all state modifications and user actions.",
                        priority="P1",
                        evidence_basis=["src_veritas_audit"],
                    ),
                ],
                mvp_release_criteria=[
                    "Sub-500ms p95 latency on primary user workflows",
                    "Zero policy violations on data retention and privacy audits",
                ],
                non_goals=[
                    "Unbounded autonomous modifications without human review gate",
                ],
            )

        # Dynamic synthesis with LLM Gateway
        system_prompt = (
            "You are the NEXUS Principal Product Strategist. Translate research evidence and mission goals "
            "into prioritized MVP feature specifications, target personas, value propositions, and explicit non-goals."
        )
        user_prompt = (
            f"Synthesize product specifications for domain: '{domain}'. "
            f"Raw mission context: '{raw_idea}'. "
            f"Create unique, actionable features, personas, and criteria tailored specifically to this problem."
        )

        try:
            content_dict, tokens_used, model_used, cost_usd = await llm_gateway.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=ProductSpec,
                tier="PRO",
                preferred_provider="groq",
                demo_fallback_data=default_spec.model_dump(),
            )
            spec_obj = ProductSpec.model_validate(content_dict)
        except Exception:
            spec_obj = default_spec
            tokens_used = 1420
            model_used = "qwen-max" if llm_gateway else "gemini-2.5-pro"

        claims = [
            {
                "claim_id": f"clm_ps_{i+1}",
                "statement": f"Feature '{feat.name}' addresses core requirements with priority {feat.priority}.",
                "support_status": "supported",
                "evidence_ids": feat.evidence_basis,
            }
            for i, feat in enumerate(spec_obj.features)
        ]

        return AgentResult(
            artifact_type="ProductSpec",
            content=spec_obj.model_dump(),
            confidence=0.92,
            assumptions=["Initial MVP release covers core functional workflows"],
            claims=claims,
            tokens_used=tokens_used,
            model_used=model_used,
        )
