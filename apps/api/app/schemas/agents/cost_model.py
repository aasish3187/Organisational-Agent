from pydantic import BaseModel, ConfigDict, Field


class CostModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    estimated_monthly_infra_usd: float = 45.0
    estimated_inference_cost_per_user_usd: float = 0.015
    token_budget_recommendation: dict[str, int] = Field(default_factory=dict)
    unit_economics_verdict: str = "SUSTAINABLE"
