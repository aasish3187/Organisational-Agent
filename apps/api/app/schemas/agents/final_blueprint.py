from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ArchitectureSummary(BaseModel):
    frontend: str
    backend: str
    database: str
    ai_models: list[str] = Field(default_factory=list)
    infrastructure: str = "Docker, NGINX Reverse Proxy, Redis 7 Event Bus"
    security_controls: list[str] = Field(default_factory=list)


class SprintMilestone(BaseModel):
    week_range: str
    phase_name: str
    deliverables: list[str]
    accountable_role: str
    kpi_metric: str


class ApiContractEndpoint(BaseModel):
    method: str
    path: str
    description: str
    request_type: str
    response_type: str


class GovernanceCertificate(BaseModel):
    policy_code: str
    policy_name: str
    severity: str
    status: str  # ENFORCED | COMPLIANT | VERIFIED
    audit_proof: str


class LearnedMemoryAtomSummary(BaseModel):
    atom_id: str
    name: str
    action_rule: str
    applicability_domain: str
    privacy_scrubbed: bool = True


class CodeScaffold(BaseModel):
    title: str
    language: str
    filename: str
    code_content: str


class FinalBlueprint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_title: str
    executive_summary: str
    problem_statement: str = ""
    target_users: str = ""
    domain: str = "general"
    
    # 1. 4-Tier Architecture
    architecture: ArchitectureSummary
    
    # 2. Core Functional Specifications
    core_features: list[str] = Field(default_factory=list)
    data_flows: list[str] = Field(default_factory=list)
    api_contracts: list[ApiContractEndpoint] = Field(default_factory=list)
    
    # 3. Roadmap & Sprint Schedule
    roadmap_schedule: list[SprintMilestone] = Field(default_factory=list)
    recommended_roadmap_weeks: int = 6
    
    # 4. Governance & Cryptographic Proof
    governance_certificates: list[GovernanceCertificate] = Field(default_factory=list)
    governance_and_privacy: list[str] = Field(default_factory=list)
    veritas_chain_hash: str = "0000000000000000000000000000000000000000000000000000000000000000"
    veritas_verified_events: int = 14
    verification_score_pct: float = 98.4
    
    # 5. MNEMOS Knowledge Atoms
    learned_atoms: list[LearnedMemoryAtomSummary] = Field(default_factory=list)
    
    # 6. Ready-to-Deploy Code Scaffolding
    code_scaffolds: list[CodeScaffold] = Field(default_factory=list)
    
    # 7. Financial & Execution Metrics
    estimated_token_cost_usd: float = 0.045
    total_tokens_consumed: int = 18420
    time_to_synthesize_sec: float = 1.82
