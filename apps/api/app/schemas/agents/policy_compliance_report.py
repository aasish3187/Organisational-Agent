from pydantic import BaseModel, ConfigDict, Field


class PolicyCheckItem(BaseModel):
    policy_code: str
    policy_name: str
    status: str  # PASSED | FAILED | WAIVER_GRANTED
    notes: str


class PolicyComplianceReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    policies_evaluated: list[PolicyCheckItem] = Field(default_factory=list)
    overall_verdict: str  # COMPLIANT | NON_COMPLIANT
    blockers: list[str] = Field(default_factory=list)
