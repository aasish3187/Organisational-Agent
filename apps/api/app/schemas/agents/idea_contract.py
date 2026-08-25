from pydantic import BaseModel, ConfigDict, Field


class IdeaContract(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str = Field(..., description="Clear, concise title for the project")
    domain: str = Field(
        ...,
        description="Target domain: edtech | marketplace | campus-admin | healthcare | fintech | general",
    )
    target_audience: str = Field(..., description="Primary users and stakeholders")
    problem_statement: str = Field(..., description="Core problem being addressed")
    success_criteria: list[str] = Field(
        default_factory=list, description="Measurable definition of success"
    )
    constraints: list[str] = Field(
        default_factory=list, description="Technical, financial, regulatory constraints"
    )
    assumptions: list[str] = Field(
        default_factory=list, description="Explicit assumptions made by the interpreter"
    )
    data_sensitivity: str = Field(
        default="internal",
        description="Data sensitivity level: public | internal | student-data | health | financial",
    )
    confidence: float = Field(
        default=0.85, ge=0.0, le=1.0, description="Agent self-assessed confidence"
    )
    open_questions: list[str] = Field(
        default_factory=list, description="Key unanswered questions for human clarification"
    )
    suggested_specialists: list[str] = Field(
        default_factory=list, description="Recommended specialist roles"
    )
