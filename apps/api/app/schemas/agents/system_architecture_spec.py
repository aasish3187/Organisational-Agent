from pydantic import BaseModel, ConfigDict, Field


class ServiceSpec(BaseModel):
    name: str
    purpose: str
    tech_stack: str
    api_protocol: str

class DatabaseSchemaSpec(BaseModel):
    table_name: str
    primary_key: str
    indexes: list[str] = Field(default_factory=list)
    encryption_at_rest: bool = True

class SystemArchitectureSpec(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    services: list[ServiceSpec] = Field(default_factory=list)
    database_schemas: list[DatabaseSchemaSpec] = Field(default_factory=list)
    event_bus: dict[str, str] = Field(default_factory=dict)
    caching_strategy: str
    infra_tier: str
