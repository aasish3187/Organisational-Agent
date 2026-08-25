from pydantic import BaseModel, ConfigDict, Field


class ArchitectureSummary(BaseModel):
    frontend: str
    backend: str
    database: str
    ai_models: list[str] = Field(default_factory=list)

class FinalBlueprint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_title: str
    executive_summary: str
    architecture: ArchitectureSummary
    core_features: list[str] = Field(default_factory=list)
    governance_and_privacy: list[str] = Field(default_factory=list)
    veritas_verified_events: int = 0
    estimated_token_cost_usd: float = 0.0
    recommended_roadmap_weeks: int = 6
