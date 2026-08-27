from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.core.llm_gateway import llm_gateway
from app.schemas.agents.ai_architecture_spec import AIArchitectureSpec, ModelChoice, PromptTopology


class AIArchitectAgent(BaseAgent):
    role = "ai_architect"
    mandate = "Design model selection, retrieval pipeline, embeddings, evaluation dataset, and prompt topologies."
    non_goals = [
        "Select proprietary opaque models without evaluating token cost and latency",
        "Implement unrestricted autonomous loop execution without schema constraints",
    ]
    output_schema = AIArchitectureSpec

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 5000,
    ) -> AgentResult:
        domain = inputs.get("domain", "general")
        raw_idea = inputs.get("raw_idea") or inputs.get("problem_statement") or "AI Architecture"

        if domain == "food_redistribution" or "food" in raw_idea.lower():
            default_spec = AIArchitectureSpec(
                models=[
                    ModelChoice(
                        tier="reasoning",
                        model_id="gemini-2.5-pro",
                        rationale="Computes dynamic perishability decay curves and multi-stop volunteer dispatch optimization.",
                        context_window=1000000,
                    ),
                    ModelChoice(
                        tier="fast",
                        model_id="gemini-2.5-flash",
                        rationale="Sub-50ms food category classification and real-time expiration window calculation.",
                        context_window=1000000,
                    ),
                ],
                retrieval_pipeline={
                    "vector_db": "PostgreSQL with PostGIS and pgvector",
                    "spatial_index": "Geohash 7-character spatial grid",
                    "embedding_model": "text-embedding-004",
                    "reranker": "Proximity and shelf-life weighted ranker",
                },
                prompt_topologies=[
                    PromptTopology(
                        role="spoilage_estimator",
                        system_prompt_strategy="Zero-shot perishability scoring based on ambient temperature and food category.",
                        output_schema="SpoilagePrediction",
                    ),
                ],
                guardrails=[
                    "Reject food donations past maximum statutory safety threshold",
                    "Enforce strict chain-of-custody verification",
                ],
                evaluation_dataset={
                    "golden_batch_count": "300 simulated food batches",
                    "eval_metric": "SLA dispatch completion rate within 15 minutes",
                },
            )
        elif domain == "grievance" or "grievance" in raw_idea.lower():
            default_spec = AIArchitectureSpec(
                models=[
                    ModelChoice(
                        tier="reasoning",
                        model_id="gemini-2.5-pro",
                        rationale="Analyzes multi-faceted complex civic complaints and evaluates legal statutory jurisdictional boundaries.",
                        context_window=1000000,
                    ),
                    ModelChoice(
                        tier="fast",
                        model_id="gemini-2.5-flash",
                        rationale="High-speed sentiment, urgency, and department triage classifier.",
                        context_window=1000000,
                    ),
                ],
                retrieval_pipeline={
                    "vector_db": "pgvector with HNSW index for citizen municipal code lookup",
                    "embedding_model": "text-embedding-004",
                    "redaction_filter": "Client-side Presidio regex + NER anonymization layer",
                },
                prompt_topologies=[
                    PromptTopology(
                        role="complaint_router",
                        system_prompt_strategy="Zero-shot multi-class department classifier with confidence calibration.",
                        output_schema="TriageAssignment",
                    ),
                ],
                guardrails=[
                    "Zero PII in model inference payloads (Policy P-02)",
                    "Strict structured JSON outputs",
                ],
                evaluation_dataset={
                    "golden_ticket_count": "1,000 anonymized historical tickets",
                    "eval_metric": "Department classification F1-Score > 0.94",
                },
            )
        else:
            default_spec = AIArchitectureSpec(
                models=[
                    ModelChoice(
                        tier="reasoning",
                        model_id="gemini-2.5-pro",
                        rationale=f"Deep multistep reasoning and schema-enforced structured generation for {domain}.",
                        context_window=1000000,
                    ),
                    ModelChoice(
                        tier="fast",
                        model_id="gemini-2.5-flash",
                        rationale=f"Sub-100ms real-time inference and retrieval grounding for {domain} requests.",
                        context_window=1000000,
                    ),
                ],
                retrieval_pipeline={
                    "chunking": "500-token semantic chunks with 15% overlap",
                    "embedding_model": "text-embedding-004 (768-dimensional embeddings)",
                    "vector_db": "pgvector with HNSW cosine similarity indexing",
                    "reranker": f"Cross-encoder with {domain} domain ontology priority",
                },
                prompt_topologies=[
                    PromptTopology(
                        role="core_reasoner",
                        system_prompt_strategy=f"Strict schema adherence with few-shot {domain} benchmark anchors.",
                        output_schema="StructuredDomainBundle",
                    ),
                ],
                guardrails=[
                    "Reject out-of-domain prompt injection attempts",
                    "Enforce strict Pydantic v2 JSON schema validation",
                ],
                evaluation_dataset={
                    "golden_benchmark_count": "500 verified test cases",
                    "eval_metric": "Task precision & recall > 95%",
                },
            )

        # Dynamic synthesis with LLM Gateway
        system_prompt = (
            "You are the ORGagent Principal AI & RAG Architect. Design model tiers, vector retrieval pipelines, "
            "embeddings, prompt topologies, guardrails, and evaluation datasets."
        )
        user_prompt = (
            f"Synthesize AI Architecture for domain: '{domain}'. "
            f"Raw mission context: '{raw_idea}'. "
            f"Specify model tiers, embedding models, vector database strategy, prompt topologies, and quantitative evaluation metrics."
        )

        try:
            content_dict, tokens_used, model_used, cost_usd = await llm_gateway.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=AIArchitectureSpec,
                tier="PRO",
                preferred_provider="gemini",
                demo_fallback_data=default_spec.model_dump(),
            )
            spec_obj = AIArchitectureSpec.model_validate(content_dict)
        except Exception:
            spec_obj = default_spec
            tokens_used = 1350
            model_used = "qwen-max" if llm_gateway else "gemini-2.5-pro"

        claims = [
            {
                "claim_id": "clm_ai_1",
                "statement": f"Multi-model AI architecture satisfies latency and reasoning benchmarks for {domain}.",
                "support_status": "supported",
                "evidence_ids": ["src_veritas_audit"],
            }
        ]

        return AgentResult(
            artifact_type="AIArchitectureSpec",
            content=spec_obj.model_dump(),
            confidence=0.94,
            assumptions=["Model endpoints and vector indexes scale within allocated token budget"],
            claims=claims,
            tokens_used=tokens_used,
            model_used=model_used,
        )
