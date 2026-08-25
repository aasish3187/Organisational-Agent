from pydantic import BaseModel, ConfigDict, Field


class ModelChoice(BaseModel):
    tier: str
    model_id: str
    rationale: str
    context_window: int

class PromptTopology(BaseModel):
    role: str
    system_prompt_strategy: str
    output_schema: str

class AIArchitectureSpec(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    models: list[ModelChoice] = Field(default_factory=list)
    retrieval_pipeline: dict[str, str] = Field(default_factory=dict)
    prompt_topologies: list[PromptTopology] = Field(default_factory=list)
    guardrails: list[str] = Field(default_factory=list)
    evaluation_dataset: dict[str, str] = Field(default_factory=dict)
