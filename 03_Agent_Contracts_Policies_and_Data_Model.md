# NEXUS Agent Contracts, Policies, and Data Model

## 1. Design rule

Agents communicate through **versioned structured artifacts**, not unconstrained conversation. This prevents context pollution, makes work reviewable, and lets the UI render the organization truthfully.

Each agent receives only:
- its mandate and success criteria
- approved input artifacts
- permitted tools and data scope
- budget and deadline
- required output JSON schema
- escalation rules

## 2. Core agent catalog

| Agent / role | Must do | Must not do | Output artifact |
|---|---|---|---|
| Mission Interpreter | Clarify goal, constraints, acceptance criteria | Invent user requirements | `IdeaContract` |
| Organization Compiler | Select minimum team and task DAG | Activate every agent by default | `OrganizationPlan` |
| Research Analyst | Find and summarize credible evidence | Treat snippets as verified proof | `EvidenceBrief` |
| Product Strategist | Define user, problem, features, MVP scope | Promise market success | `ProductSpec` |
| AI/RAG Architect | Design model, retrieval, data/evaluation approach | Claim model accuracy without test data | `AIArchitecture` |
| System Architect | Design services, APIs, data flow, stack | Write deployment secrets | `SystemDesign` |
| Experience Strategist | Define flows, information hierarchy, accessibility | Produce visual claims without rationale | `UXBrief` |
| Privacy/Risk Analyst | Build risk register and controls | Give legal certification | `RiskRegister` |
| Finance/Scope Analyst | Estimate ranges, identify cost drivers | State fabricated exact costs | `ScopeEstimate` |
| Consistency Reviewer | Check requirements, evidence, conflicts | Rewrite all artifacts silently | `ReviewReport` |
| Red Team | Find failure modes and unsafe assumptions | Authorize risky actions | `RedTeamReport` |
| Solutions Officer | Compose final coherent blueprint | Remove uncertainty labels | `FinalBlueprint` |
| Compliance Gate | Validate schema/policies | Reason about facts outside schema | `ComplianceVerdict` |

## 3. Organization plan schema

```json
{
  "run_id": "run_01H...",
  "mode": "BALANCED",
  "goal": "Design an AI exam-preparation MVP",
  "selection_rationale": [
    {"role": "research", "reason": "Requires current evidence about student needs"},
    {"role": "privacy_risk", "reason": "System processes student learning data"}
  ],
  "budget": {"max_tokens": 30000, "max_cost_usd": 2.0, "max_minutes": 8},
  "tasks": [
    {
      "task_id": "t_research",
      "role": "research",
      "depends_on": [],
      "allowed_tools": ["web_search", "document_retrieval"],
      "input_artifacts": ["idea_contract:v1"],
      "output_schema": "EvidenceBrief:v1",
      "review_required": true,
      "token_budget": 5000,
      "risk_level": "medium"
    }
  ],
  "human_gates": ["sensitive-data-retention", "external-write"]
}
```

## 4. Standard artifact envelope

```json
{
  "artifact_id": "art_...",
  "type": "ProductSpec",
  "schema_version": "1.0",
  "project_id": "prj_...",
  "task_id": "t_product",
  "producer": {"role": "product_strategist", "model_profile": "reasoning"},
  "created_at": "ISO-8601",
  "status": "submitted",
  "confidence": 0.74,
  "assumptions": ["Initial launch supports English and Telugu"],
  "claims": [
    {"claim_id": "c1", "text": "MVP should include adaptive quizzes", "support": ["evidence:e12"], "strength": "supported"}
  ],
  "content": {},
  "content_hash": "sha256..."
}
```

`confidence` is an agent self-assessment, not a truth score. The UI must display it as “agent confidence” and pair it with evidence/review status.

## 5. Critical output schemas

### EvidenceBrief

```json
{
  "question": "What features do engineering students need?",
  "findings": [{"statement": "...", "source_ids": ["src_01"], "limitations": "..."}],
  "source_quality": [{"source_id": "src_01", "tier": "primary|official|secondary", "checked_at": "ISO-8601"}],
  "unknowns": [],
  "recommended_implications": []
}
```

### ReviewReport

```json
{
  "reviewed_artifacts": ["art_01", "art_02"],
  "verdict": "PASS|REVISE|ESCALATE",
  "coverage": {"met": [], "missing": []},
  "contradictions": [{"claim_a": "...", "claim_b": "...", "severity": "high", "resolution_owner": "system_architect"}],
  "unsupported_claims": [],
  "revision_tasks": []
}
```

### RiskRegister

```json
{
  "risks": [
    {"id": "R-01", "risk": "Student-data exposure", "likelihood": "medium", "impact": "high", "control": "Minimize data; consent; project-scoped access; encryption", "owner": "privacy_risk"}
  ],
  "human_approval_required": ["retention duration"],
  "disclaimer": "This is a design-risk assessment, not legal advice."
}
```

## 6. Policy engine

### Policies

| Policy ID | Rule | Enforcement |
|---|---|---|
| P-01 | Every research-backed external claim needs source IDs | compliance fail / revision |
| P-02 | Personal, health, financial, legal, or security-sensitive data activates Risk role | hard planning rule |
| P-03 | Any write-capable tool call requires human approval | runtime interrupt |
| P-04 | Agent cannot call tool outside its role allowlist | deny + audit log |
| P-05 | No task may exceed token, cost, retry, or time budget | stop/escalate |
| P-06 | Final blueprint must list assumptions and limitations | compliance fail |
| P-07 | Unresolved high-severity contradiction blocks finalization | escalation |
| P-08 | Inputs and artifacts remain project-scoped | authorization check |

### Attribute-based access control (ABAC)

Authorize with attributes, not hard-coded role names alone:

```text
allow if
  subject.agent_role in resource.allowed_roles
  AND subject.project_id == resource.project_id
  AND action in resource.allowed_actions
  AND subject.clearance >= resource.classification
  AND environment.run_state not in [CANCELLED, BUDGET_EXCEEDED]
```

Agent attributes: `role`, `project_id`, `team_id`, `tool_scopes`, `max_cost`, `risk_clearance`.

Resource attributes: `project_id`, `classification`, `owner_team`, `allowed_roles`, `retention_policy`.

## 7. State machine and retry policy

- A worker can retry a transient tool failure twice with backoff.
- A reviewer may request at most two revisions for an artifact; after that, escalate.
- The organization can add **one** targeted specialist only if the reviewer identifies a named gap and budget remains.
- A human can stop a run from any state.
- All side effects must have an idempotency key and approval event ID.

## 8. Database entities

| Entity | Key fields |
|---|---|
| Project | id, owner/session, title, objective, classification, created_at |
| Run | id, project_id, mode, status, budget, model policy, started_at |
| AgentInstance | id, run_id, role, parent_id, mandate, permitted_tools, status |
| Task | id, run_id, owner_agent_id, dependencies, state, budgets, schema |
| Artifact | id, task_id, type, version, URI, hash, review_state |
| Evidence | id, project_id, source_url/file, excerpt, tier, retrieved_at |
| Claim | id, artifact_id, statement, support_status, evidence_ids |
| Review | id, artifact_id, verdict, findings, reviewer_id |
| Approval | id, run_id, policy_id, proposal, status, human_response |
| Event | id, run_id, sequence, type, actor, payload, timestamp |
| Metric | id, run_id, agent/task, tokens, latency, cost, outcome |

## 9. API outline

```text
POST   /projects
POST   /projects/{id}/intake
POST   /projects/{id}/compile-organization
POST   /runs
GET    /runs/{id}
GET    /runs/{id}/events                # SSE
GET    /runs/{id}/organization
GET    /tasks/{id}
GET    /artifacts/{id}
POST   /approvals/{id}/decision
POST   /runs/{id}/cancel
GET    /runs/{id}/blueprint
POST   /runs/{id}/export
GET    /experiments/compare?prompt_id=
```

## 10. Prompting conventions

Every prompt should include: role mandate, available inputs, non-goals, tools, output schema, evidence standard, budget, and escalation rule. Example:

```text
You are the NEXUS Privacy/Risk Analyst. Your responsibility is to identify design risks and practical controls; you do not provide legal certification.

Use only the Idea Contract and approved artifacts listed below. If required information is absent, add an explicit unknown rather than guessing. Return JSON matching RiskRegister:v1. Each risk must contain likelihood, impact, control, owner, and whether human approval is required.

You may use: document_retrieval. You may not use external write tools. Stop after 2,000 tokens.
```

## 11. Security minimums

- Keep all API keys in environment variables; never expose them in Next.js client code.
- Validate uploads by type and size; scan/parse them in a sandboxed worker.
- Encrypt data in transit; do not log raw secrets or full private documents.
- Implement per-project authorization before vector retrieval.
- Redact prompts/outputs before exporting telemetry where necessary.
- Use schema validation before storing any agent artifact.
- Treat every model output and tool parameter as untrusted input.
