from pydantic import BaseModel, ConfigDict, Field


class Finding(BaseModel):
    statement: str
    source_ids: list[str] = Field(default_factory=list)
    limitations: str = ""

class SourceQuality(BaseModel):
    source_id: str
    tier: str  # primary | official | secondary
    checked_at: str

class EvidenceBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question: str
    findings: list[Finding] = Field(default_factory=list)
    source_quality: list[SourceQuality] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)
    recommended_implications: list[str] = Field(default_factory=list)
