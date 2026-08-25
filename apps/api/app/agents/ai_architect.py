from typing import Any

from app.agents.base import AgentResult, BaseAgent
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
        models = [
            ModelChoice(
                tier="reasoning",
                model_id="gemini-2.5-pro",
                rationale="Handles complex multistep engineering syllabus problem generation and strict Pydantic parsing.",
                context_window=1000000,
            ),
            ModelChoice(
                tier="fast",
                model_id="gemini-2.5-flash",
                rationale="Powers sub-300ms multilingual terminology hint lookup and concept translation.",
                context_window=1000000,
            ),
        ]

        topologies = [
            PromptTopology(
                role="exam_simulator",
                system_prompt_strategy="Zero-shot structured schema output with few-shot AICTE regional terminology anchors.",
                output_schema="ExamQuestionBundle",
            ),
            PromptTopology(
                role="concept_explainer",
                system_prompt_strategy="Socratic guidance adhering to university curriculum boundaries.",
                output_schema="ConceptExplanation",
            ),
        ]

        spec = AIArchitectureSpec(
            models=models,
            retrieval_pipeline={
                "chunking": "500-token semantic chunks with 10% overlap",
                "embedding_model": "text-embedding-004",
                "vector_db": "pgvector with HNSW indexing",
                "reranker": "cross-encoder with AICTE glossary priority",
            },
            prompt_topologies=topologies,
            guardrails=[
                "Reject non-academic domain queries",
                "Strict adherence to Pydantic schemas",
            ],
            evaluation_dataset={
                "golden_q_count": "500 verified questions",
                "eval_metric": "BLEU / BERTScore for multilingual terminology accuracy",
            },
        )

        return AgentResult(
            artifact_type="AIArchitectureSpec",
            content=spec.model_dump(),
            confidence=0.92,
            assumptions=["Regional corpus embeddings fit within pgvector memory budget"],
            claims=[
                {
                    "claim_id": "clm_ai_1",
                    "statement": "Dual-tier model architecture satisfies sub-500ms latency target while preserving reasoning depth.",
                    "support_status": "supported",
                    "evidence_ids": ["src_stem_ed_2025"],
                }
            ],
            tokens_used=1350,
            model_used=model_router_instance.get_tier_name("reasoning"),
        )
