# NEXUS — Agent Contracts, Policies, and Data Model (v3, self-contained)

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
    {"role": "privacy_risk", "reason": "System processes student learning data",
     "source": "mnemos_atom:atom_0042"}
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

`selection_rationale` entries may include `"source": "mnemos_atom:<atom_id>"` when a role was selected or reinforced by a matched process atom, alongside the plain-language reason. The field is omitted for rule-only selections.

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

`confidence` is an agent self-assessment, not a truth score. The UI must display it as "agent confidence" and pair it with evidence/review status.

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

## 6. Event chain schema (VERITAS)

```json
{
  "event_id": "evt_0142",
  "run_id": "run_01H...",
  "sequence": 142,
  "type": "review_verdict",
  "actor": "consistency_reviewer",
  "payload": { "verdict": "REVISE", "artifact_id": "art_09" },
  "payload_canonical": "{\"artifact_id\":\"art_09\",\"verdict\":\"REVISE\"}",
  "timestamp": "2026-08-22T10:04:31Z",
  "prev_hash": "e3b0c44298fc1c14...",
  "hash": "9f86d081884c7d65..."
}
```

Every `Event` row carries `prev_hash`, `hash`, and `payload_canonical` (the exact JSON string hashed — deterministic serialization: sorted keys, compact separators, ASCII escapes). The genesis event of each run chains from a fixed `GENESIS_HASH` constant. Verification re-reads `payload_canonical` from storage; it never re-serializes. Rationale and reference implementation: doc 02 §6.

## 7. Process atom schema (MNEMOS)

```json
{
  "atom_id": "atom_0042",
  "source_run_id": "run_01H...",
  "name": "Privacy/Risk role required when platform stores student learning history",
  "applicability": {
    "domain": "edtech",
    "deliverable_type": "platform-blueprint",
    "data_sensitivity": "student-data"
  },
  "action": "Activate Privacy/Risk Analyst role; require explicit approval gate on retention duration",
  "purpose": "Prevents silent decisions about sensitive data retention reaching the final blueprint unreviewed",
  "tags": ["edtech", "privacy", "student-data", "approval-gate"],
  "embedding": [0.013, -0.221, "..."],
  "created_at": "ISO-8601"
}
```

Faithful adaptation of the SAP paper's atom attributes (Name, Source, Content = Applicability + Action + Purpose, Tags — see doc 06 §4): `source` is specialized to `source_run_id`, and `embedding` is added for the semantic-rerank step. Distinct from `Evidence` (which is within-run, source-linked factual support) — a `ProcessAtom` is a distilled, reusable *organizational* lesson that outlives the run it came from.

## 8. Policy engine

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
| P-09 | Every finalized run must complete a VERITAS chain verification before its blueprint is marked exportable | compliance fail if verification fails — blocks export, does not silently pass |

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

MNEMOS atoms are **not** project-scoped the way Evidence is — they are intentionally cross-project (that is the point of the memory layer). For the expo build, a single shared atom store is fine; if multi-tenancy is ever added, atoms gain a `visibility` attribute checked at retrieval.

## 9. State machine and retry policy

- A worker can retry a transient tool failure twice with backoff.
- A reviewer may request at most two revisions for an artifact; after that, escalate.
- The organization can add **one** targeted specialist only if the reviewer identifies a named gap and budget remains.
- A human can stop a run from any state.
- All side effects must have an idempotency key and approval event ID.

## 10. Database entities

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
| Event | id, run_id, sequence, type, actor, payload, **payload_canonical, prev_hash, hash**, timestamp |
| Metric | id, run_id, agent/task, tokens, latency, cost, outcome |
| ProcessAtom | id, source_run_id, name, applicability JSON, action, purpose, tags[], embedding, created_at |

## 11. API outline

```text
POST   /projects
POST   /projects/{id}/intake
POST   /projects/{id}/compile-organization
POST   /runs
GET    /runs/{id}
GET    /runs/{id}/events                # SSE
GET    /runs/{id}/organization
GET    /runs/{id}/verify                # VERITAS chain verification
GET    /tasks/{id}
GET    /artifacts/{id}
POST   /approvals/{id}/decision
POST   /runs/{id}/cancel
GET    /runs/{id}/blueprint
POST   /runs/{id}/export                # gated on successful verify (P-09)
GET    /memory/atoms?tags=&domain=      # MNEMOS tag-filtered browse (debug/inspection)
GET    /experiments/compare?prompt_id=
```

`GET /runs/{id}/organization` returns matched-atom references inline where applicable — no separate retrieval endpoint is needed on the critical path since MNEMOS retrieval happens server-side at compile time.

## 12. Prompting conventions

Every prompt should include: role mandate, available inputs, non-goals, tools, output schema, evidence standard, budget, and escalation rule. Example:

```text
You are the NEXUS Privacy/Risk Analyst. Your responsibility is to identify design risks and practical controls; you do not provide legal certification.

Use only the Idea Contract and approved artifacts listed below. If required information is absent, add an explicit unknown rather than guessing. Return JSON matching RiskRegister:v1. Each risk must contain likelihood, impact, control, owner, and whether human approval is required.

You may use: document_retrieval. You may not use external write tools. Stop after 2,000 tokens.
```

## 13. Security minimums

- Keep all API keys in environment variables; never expose them in Next.js client code.
- Validate uploads by type and size; scan/parse them in a sandboxed worker.
- Encrypt data in transit; do not log raw secrets or full private documents.
- Implement per-project authorization before vector retrieval.
- Redact prompts/outputs before exporting telemetry where necessary.
- Use schema validation before storing any agent artifact.
- Treat every model output and tool parameter as untrusted input.
- **MNEMOS atom extraction must not leak private uploaded-document content into stored atoms.** The atom-write prompt extracts generalizable patterns, never verbatim excerpts of user-uploaded material. Add a post-extraction check: reject any atom whose name/action/purpose contains a verbatim span longer than 12 words from an uploaded document. Review this specifically during the reliability pass (doc 07 §5).
