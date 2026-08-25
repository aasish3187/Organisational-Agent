from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class RunCreate(BaseModel):
    project_id: str
    mode: str = Field(default="BALANCED", pattern="^(FAST|BALANCED|DEEP)$")
    model_policy: str = Field(default="AUTO", pattern="^(STRICT|BALANCE|NOCAP|AUTO)$")
    budget_max_tokens: int = Field(default=30000, ge=1000)
    budget_max_cost_usd: Decimal = Field(default=Decimal("2.0000"))
    budget_max_minutes: int = Field(default=10, ge=1)


class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    mode: str
    status: str
    model_policy: str
    budget_max_tokens: int
    budget_max_cost_usd: Decimal
    budget_max_minutes: int
    tokens_used: int
    cost_usd: Decimal
    is_demo_replay: bool
    started_at: datetime
    completed_at: datetime | None = None
