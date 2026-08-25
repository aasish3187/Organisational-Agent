from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SelectionRationale(BaseModel):
    role: str
    reason: str
    source: str | None = None  # e.g., "mnemos_atom:atom_0042" or None

class PlanBudget(BaseModel):
    max_tokens: int = 30000
    max_cost_usd: float = 2.0
    max_minutes: int = 10

class TaskSpec(BaseModel):
    task_id: str
    role: str
    depends_on: list[str] = Field(default_factory=list)
    allowed_tools: list[str] = Field(default_factory=list)
    input_artifacts: list[str] = Field(default_factory=list)
    output_schema: str
    review_required: bool = True
    token_budget: int = 5000
    risk_level: str = "low"  # low | medium | high

class OrganizationPlan(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    run_id: str
    project_id: str
    mode: str = "BALANCED"
    goal: str
    selection_rationale: list[SelectionRationale]
    budget: PlanBudget
    tasks: list[TaskSpec]
    human_gates: list[str] = Field(default_factory=list)
    retrieved_atoms: list[dict[str, Any]] = Field(default_factory=list)
