from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1)
    objective: str = Field(..., min_length=1)
    classification: str = Field(default="internal")
    owner_session: str = Field(default="session_default")

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    objective: str
    classification: str
    owner_session: str
    created_at: datetime
