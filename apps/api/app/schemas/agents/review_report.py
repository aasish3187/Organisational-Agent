from pydantic import BaseModel, ConfigDict, Field


class Contradiction(BaseModel):
    claim_a: str
    claim_b: str
    severity: str  # low | medium | high
    resolution_owner: str

class CoverageAnalysis(BaseModel):
    met: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)

class ReviewReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reviewed_artifacts: list[str] = Field(default_factory=list)
    verdict: str  # PASS | REVISE | ESCALATE
    coverage: CoverageAnalysis
    contradictions: list[Contradiction] = Field(default_factory=list)
    unsupported_claims: list[str] = Field(default_factory=list)
    revision_tasks: list[str] = Field(default_factory=list)
