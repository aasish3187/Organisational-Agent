from typing import Any

from pydantic import BaseModel


class AgentResult(BaseModel):
    artifact_type: str
    content: dict[str, Any]
    confidence: float
    assumptions: list[str]
    claims: list[dict[str, Any]]  # [{claim_id, statement, support_status, evidence_ids}]
    tokens_used: int
    model_used: str


class BaseAgent:
    role: str
    mandate: str
    non_goals: list[str]
    output_schema: type[BaseModel]

    def system_prompt(self) -> str:
        non_goals_str = "\n".join(f"- {g}" for g in self.non_goals)
        return (
            f"You are the ORGagent {self.role}.\n\n"
            f"MANDATE: {self.mandate}\n\n"
            f"NON-GOALS (never do these):\n"
            f"{non_goals_str}\n\n"
            f"OUTPUT: Respond ONLY with valid JSON matching the schema provided. No preamble, no markdown fences.\n"
            f"EVIDENCE: Every factual claim requires a source ID. If you cannot find credible support, add it to unknowns.\n"
            f"BUDGET: Stop after the token limit. Partial output is better than an overrun.\n"
            f"ESCALATION: If a high-severity conflict is unresolvable or a required input is absent, set escalate=true.\n"
        )

    async def run(
        self,
        inputs: dict[str, Any],
        model_router_instance: Any,
        token_budget: int = 5000,
    ) -> AgentResult:
        raise NotImplementedError
