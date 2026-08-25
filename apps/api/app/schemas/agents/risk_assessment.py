from pydantic import BaseModel, ConfigDict, Field


class RiskItem(BaseModel):
    category: str  # privacy | security | regulatory | operational
    risk_statement: str
    severity: str  # low | medium | high | critical
    mitigation: str
    requires_human_gate: bool = False

class RiskAssessment(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    data_classification: str
    risks: list[RiskItem] = Field(default_factory=list)
    retention_bound_days: int = 90
    required_human_gates: list[str] = Field(default_factory=list)
    compliance_verdict: str  # APPROVED_WITH_GATES | BLOCKED | CLEARED
