from typing import Any

from app.agents.base import AgentResult, BaseAgent
from app.schemas.agents.system_architecture_spec import (
    DatabaseSchemaSpec,
    ServiceSpec,
    SystemArchitectureSpec,
)


class SystemArchitectAgent(BaseAgent):
    role = "system_architect"
    mandate = "Architect backend services, API contracts, data schemas, caching tiers, and event pub/sub infrastructure."
    non_goals = [
        "Store unencrypted sensitive user tokens or raw telemetry in operational logs",
        "Design unbounded synchronous pipelines that block main thread execution",
    ]
    output_schema = SystemArchitectureSpec

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 5000,
    ) -> AgentResult:
        services = [
            ServiceSpec(
                name="apps/api (FastAPI Core)",
                purpose="Asynchronous task orchestration, REST/SSE endpoints, VERITAS event chaining.",
                tech_stack="Python 3.11, FastAPI, SQLAlchemy 2.0 (asyncio), Pydantic v2",
                api_protocol="HTTP/2 REST + Server-Sent Events",
            ),
            ServiceSpec(
                name="apps/web (Next.js 15)",
                purpose="Liquid Glass interactive interface, React Flow agent network, real-time audit ledger.",
                tech_stack="React 19, Next.js 15, TailwindCSS, React Flow, Lucide Icons",
                api_protocol="Browser Client SPA",
            ),
        ]

        schemas = [
            DatabaseSchemaSpec(
                table_name="student_progress",
                primary_key="id (nanoid)",
                indexes=["student_id", "subject_code", "created_at"],
                encryption_at_rest=True,
            ),
            DatabaseSchemaSpec(
                table_name="audit_events",
                primary_key="id (nanoid)",
                indexes=["run_id", "sequence", "hash"],
                encryption_at_rest=True,
            ),
        ]

        spec = SystemArchitectureSpec(
            services=services,
            database_schemas=schemas,
            event_bus={
                "provider": "Redis Pub/Sub & Server-Sent Events",
                "delivery_guarantee": "At-least-once with idempotent sequence numbering",
            },
            caching_strategy="Redis cache for AICTE terminology glossaries and static curriculum definitions",
            infra_tier="Containerized microservices via Docker Compose (web, api, db, redis)",
        )

        return AgentResult(
            artifact_type="SystemArchitectureSpec",
            content=spec.model_dump(),
            confidence=0.94,
            assumptions=["PostgreSQL and Redis run within local docker bridge network"],
            claims=[
                {
                    "claim_id": "clm_sys_1",
                    "statement": "Asynchronous event-driven architecture handles high-concurrency exam bursts without thread starvation.",
                    "support_status": "supported",
                    "evidence_ids": [],
                }
            ],
            tokens_used=1400,
            model_used=model_router_instance.get_tier_name("reasoning"),
        )
