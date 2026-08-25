from pydantic import BaseModel, ConfigDict, Field


class FeatureSpec(BaseModel):
    name: str
    description: str
    priority: str  # P0 | P1 | P2
    evidence_basis: list[str] = Field(default_factory=list)

class ProductSpec(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_name: str
    target_persona: str
    core_value_prop: str
    features: list[FeatureSpec] = Field(default_factory=list)
    mvp_release_criteria: list[str] = Field(default_factory=list)
    non_goals: list[str] = Field(default_factory=list)
