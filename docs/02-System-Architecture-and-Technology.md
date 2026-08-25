# NEXUS — System Architecture and Technology (v3, self-contained)

## 1. Architecture principle

Use a **modular monolith with an event-driven workflow core** for the expo. It is complex enough to demonstrate true orchestration but small enough for a student team to build, test, and explain. Do not begin with microservices or Kubernetes.

Use one primary agent runtime: **Google ADK with Python**. It has first-class multi-agent workflow composition; its workflow primitives support sequential, parallel, and looped work, plus native pause/resume for approval gates. Keep the orchestration domain model independent of ADK so it can later be ported to LangGraph or another runtime.

## 2. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Web app | Next.js (App Router), TypeScript | High-quality UI, streaming, mature ecosystem |
| UI | Tailwind CSS, shadcn/ui, Framer Motion, React Flow, Recharts | Fast accessible components, graph visualization, purposeful motion, analytics. Visual language is iOS 26-style **Liquid Glass** (doc 04 §2): backdrop-filter glass tiers over an aurora background — implement exactly per the doc 04 §2 recipes and §9 performance budget |
| API | FastAPI, Python 3.12, Pydantic v2 | Typed request schemas and direct ADK integration |
| Agent runtime | Google ADK | Multi-agent composition, sessions, parallel/sequential/loop patterns, pause/resume |
| Workflow state | PostgreSQL in production; SQLite locally | Durable projects, tasks, audit events and approvals |
| Semantic retrieval | pgvector in PostgreSQL; in-Python cosine over stored embedding vectors for SQLite dev | One database serves both project-scoped Evidence retrieval and MNEMOS's ProcessAtom store — two logically separate tables, no second vector DB. With a handful of atoms, numpy cosine is simpler and fast enough; pgvector is the scale path |
| Queue/cache | Redis + ARQ or Celery only after basic flow works | Decouples long runs and stream delivery; avoid in first local prototype |
| Object artifacts | Local filesystem for demo; S3-compatible storage later | Store uploaded files and generated reports separately |
| Live updates | Server-Sent Events (SSE) first; WebSocket only if needed | Simpler reliable one-way event stream for activity feed |
| Auth | Demo PIN / anonymous session first; Supabase Auth later | Avoid auth scope destroying the expo MVP |
| Observability | OpenTelemetry + structured JSON logs, plus VERITAS hash-chain layer riding on the same event stream | Trace + tamper-evidence share one event pipeline |
| Deployment | Docker Compose; frontend on Vercel / backend on Cloud Run later | Repeatable demonstration and straightforward scale path |
| Testing | pytest, Playwright, Vitest | Test orchestration logic and visible demo flows |
| Dev tooling | Antigravity + Claude Code for scaffolding/orchestration logic; Cursor for fast in-editor iteration | See doc 07 for the full division of labor |

## 3. Top-level components

```text
Browser (Next.js)
  | REST: create project, approval, export, verify
  | SSE: run events, task updates, token metrics
  v
FastAPI Gateway
  |-- Project Service ------------ PostgreSQL / pgvector
  |-- Policy Engine ------------- policy rules + ABAC checks
  |-- Organization Compiler ----- task graph and role selection
  |                                  ↕ queries MNEMOS for prior atoms
  |-- ADK Workflow Runner ------- agent execution + sessions
  |-- Tool Gateway -------------- web/retrieval/code/file tools
  |-- Artifact Service ---------- local/S3 files + content hashes
  |-- Telemetry Adapter --------- OpenTelemetry traces + metrics
  |     `-- VERITAS chain ------- hash-chains every emitted event
  |-- MNEMOS Service ------------ atom retrieval (tag-filter -> semantic rerank)
  |                                atom write (post-run decomposition)
  v
Model Router
  |-- premium reasoning model
  |-- fast low-cost model
  |-- optional secondary reasoning model (e.g., Qwen 3.8-Max, see doc 08 §2)
  `-- optional local Hugging Face tool-call model
```

## 4. Organizational runtime

### Governance layer

| Component | Responsibility | Produces |
|---|---|---|
| Mission Interpreter (CEO) | Convert user input to objective, constraints, acceptance tests, risk class | `IdeaContract` |
| Technical Governor (CTO) | Decide technical specialists, architecture depth, model/tool eligibility | `TechnicalPlan` |
| Operations Governor (COO) | Decide time/token budgets, parallelism, retry and escalation policy | `RunPolicy` |
| Organization Compiler | Convert skills and policy to roles, tasks, dependencies, permissions | `OrganizationPlan` |

### Execution layer

A **role** is a bounded job with a mandate and permissions. A **skill** is a reusable capability. Do not confuse them.

- Research skill -> Research Analyst role
- Systems skill -> Software Architect role
- UX skill -> Experience Strategist role
- Risk skill -> Privacy/Security Analyst role
- Synthesis skill -> Solutions Writer role

The worker pool must return structured artifacts, not free-form chat messages. (This is also the design answer to Liu 2026's "lossy handoffs" failure mode — see doc 06 §5.)

### Assurance layer

- Evidence Auditor: checks whether citations/artifacts actually support claims
- Consistency Reviewer: detects requirement gaps and contradictions between artifacts
- Red Team: searches for overscope, privacy, security, and hallucination risks
- Compliance Gate: validates the final output schema and policy constraints
- Human Gate: required for external side effects, sensitive-data decisions, or unresolved high-risk conflict

## 5. Task lifecycle

```text
DRAFT -> PLANNED -> QUEUED -> RUNNING -> SUBMITTED
                                             |
                       +---------------------+---------------------+
                       v                                           v
                 NEEDS_REVISION                             UNDER_REVIEW
                       |                                           |
                       +------------> RUNNING <-------------------+
                                                                   |
                                            APPROVED / REJECTED / ESCALATED
                                                                   |
                                                                ARCHIVED
```

Every transition is an append-only event. State is derived from the event log or maintained transactionally alongside it.

## 6. VERITAS module detail

```python
# telemetry/veritas.py
GENESIS_HASH = "0" * 64

def canonical(payload: dict) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)

def chain_event(prev_hash: str, payload_canonical: str, timestamp: str) -> str:
    return hashlib.sha256(f"{prev_hash}{payload_canonical}{timestamp}".encode()).hexdigest()

def verify_chain(run_id: str) -> VerifyResult:
    events = get_events_ordered(run_id)
    prev = GENESIS_HASH
    for i, e in enumerate(events):
        expected = chain_event(prev, e.payload_canonical, e.timestamp)
        if expected != e.hash:
            return VerifyResult(valid=False, broken_at_index=i)
        prev = e.hash
    return VerifyResult(valid=True, broken_at_index=None)
```

**Two implementation rules that must not be skipped:**

1. **Store the canonical payload string.** Verification must re-read the exact string that was hashed at emission time (`Event.payload_canonical`, TEXT). Never re-serialize the payload from parsed data at verify time — JSON round-trips are not byte-stable (float formatting, unicode escaping), and a silent mismatch would make an untampered chain verify as broken.
2. **Chain in the same transaction.** The event row, its `prev_hash`, and its `hash` are written in one database transaction. A partially written event would corrupt the chain. `prev_hash` is read under the same transaction/lock that serializes event emission per run (single writer per run, or `SELECT ... FOR UPDATE` on the run's chain head).

Attach `chain_event` as a wrapper around the existing telemetry emitter (`telemetry/emit_event`) rather than a separate write path — every event that's already being logged gets chained for free, no duplicate instrumentation.

## 7. MNEMOS module detail

```python
# services/mnemos.py
def retrieve_atoms(idea_contract: IdeaContract, k: int = 5) -> list[ProcessAtom]:
    tags = extract_tags(idea_contract)  # deterministic keyword rules first, LLM assist optional
    candidates = db.query(ProcessAtom).filter(ProcessAtom.tags.overlap(tags)).all()
    if not candidates:
        return []
    return semantic_rerank(candidates, embed(idea_contract.summary), top_k=k)

def write_atoms(run: Run, blueprint: FinalBlueprint) -> list[ProcessAtom]:
    # LLM call: decompose the finished run into 3-6 reusable atoms
    atoms = extract_atoms_llm(run, blueprint)
    db.bulk_save(atoms)
    return atoms
```

Called at two points only: `organization_compiler.compile()` (retrieval, before role selection) and `run_manager.finalize()` (write, after blueprint approval). Not called mid-run — this keeps MNEMOS's cost and latency bounded and predictable.

**Embedding decision (must be fixed in Phase 2, not discovered in Phase 4):**
- Default: the same provider family as the live models (e.g., Gemini `text-embedding-004` if Gemini is the reasoning provider), called server-side only.
- Offline/dev fallback: local `sentence-transformers` (all-MiniLM-L6-v2) so mock mode needs no API key.
- Storage: embedding vector stored on the `ProcessAtom` row (BLOB/JSON in SQLite, `vector` column in PostgreSQL). Rerank is plain cosine similarity in Python — with 5-50 atoms this is microseconds and avoids depending on pgvector during local development.
- `extract_tags` is deterministic keyword rules over the Idea Contract (domain dictionary, deliverable-type patterns, data-sensitivity keywords), optionally confirmed by a fast-tier LLM call. Deterministic first so demo behavior is reproducible.

## 8. Dynamic planning algorithm

The planner should be deterministic where possible and LLM-assisted where ambiguity matters.

```text
1. Parse task into IdeaContract (goal, domain, deliverables, risk, constraints).
   1a. Query MNEMOS (retrieve_atoms); matched atoms' applicability/action fields
       become additional context for capability scoring — a prior atom tagged
       privacy_risk for a similar domain is itself a signal to activate that role.
2. Score capability needs: research, product, technical, data/AI, design, financial, legal-risk.
3. Compute complexity = scope x ambiguity x cross-domain dependencies x risk.
4. Select a minimum team subject to budget and required safety skills.
5. Build task DAG from artifact dependencies.
6. Set execution mode:
   simple -> DIRECT (writer + final schema check)
   medium -> LIGHT (workers + reviewer)
   complex/high-risk -> FULL (workers + reviewer + targeted specialist + human gate)
7. Attach permissions, budgets, expected JSON schemas and review criteria to every task.
8. Explain the plan to the user before expensive execution begins.
```

Start with a rules-plus-LLM hybrid. Example hard rules:
- If input includes personal/student data -> always add Privacy/Risk role.
- If user asks for an app/system -> add Product and Architecture roles.
- If the goal needs external facts -> add Research role and evidence audit.
- If budget is `Fast` -> maximum 3 workers and one review pass.
- If risk is high -> never permit autonomous external actions.

## 9. Model router

Never attach a separate expensive model to every role by default. Use a provider abstraction:

```python
class ModelProfile:
    name: str
    tier: Literal['fast', 'reasoning', 'local', 'qwen']
    supports_tools: bool
    supports_structured_output: bool
    max_cost_per_task: Decimal
```

Suggested policy:
- **Fast tier:** classification, extraction, task routing, simple formatting
- **Reasoning tier:** planning, complex architecture, conflict resolution, final synthesis
- **Qwen tier (optional secondary reasoning):** see doc 08 §2 — a cost-efficient long-context alternative the router can route governance calls to; exposed as a Settings toggle, never the only model
- **Local tier:** demonstrations with no internet, redaction, simple structured extraction

An optional Hugging Face model must be tool/function-call capable. Test structured output and function-call reliability before presenting it. It is a fallback, not a claim of full offline parity with a frontier model.

## 10. Tool gateway

All tools are registered in a catalog; agents never receive arbitrary shell or network access.

| Tool | Allowed roles | Safety rule |
|---|---|---|
| Document retrieval | research, architecture, reviewer | read-only, source URL/file required |
| Web search | research | domain allowlist and rate limit |
| Vector retrieval | any approved role | project-scoped namespace only |
| Calculator | finance, architecture | deterministic function |
| Code sandbox | architecture, test role | no secrets, no network, time limit |
| Diagram generator | architecture, UX | artifact only, no external action |
| Export report | Solutions Officer | user-requested download only |

Use MCP adapters only for tool/context interoperability. Keep credentials on the server, apply least privilege, and make write-capable MCP tools require a human approval policy.

## 11. Why this architecture is credible

The OrgAgent paper motivates separated governance, execution, and compliance layers rather than flat coordination. Liu (2026) motivates the two design choices that keep that hierarchy from becoming a cost: task-contingent organization (the Compiler picks structure per mission) and shared durable state (versioned artifacts instead of chat handoffs). Google ADK supports composable multi-agent workflows including parallel and loop patterns. Durable workflow systems such as LangGraph demonstrate why persisted state plus interrupts are appropriate when human approval or resume-after-failure is required. NEXUS adopts these concepts but uses a constrained, testable organization plan rather than pretending agents are autonomous employees. See doc 06 for full citations.

## 12. Build order

1. Mock UI with static seeded run
2. Database schema and REST API — **includes `ProcessAtom` table and `Event.prev_hash`/`hash`/`payload_canonical` columns from the start**, not bolted on later
3. Idea Contract + rules-based Organization Compiler
4. One live worker and one reviewer, structured artifacts only
5. Parallel research/UX workers and SSE events
6. Approval gate and durable resume
7. VERITAS verify endpoint + UI action
8. MNEMOS retrieval + write, seeded with pre-run atoms
9. Evidence graph, export, baseline comparison
10. Optional local model and deployment hardening

Putting VERITAS's schema fields in at step 2 (rather than retrofitting a hash chain onto an existing event table later) avoids a painful migration.

**Demo replay pipeline (v3 addition):** the `DEMO REPLAY` mode must replay a recorded run's events through the *same* SSE pipeline and UI code paths as a live run (events stored with their real chain, served back at 1x/4x). Build this in week 3 alongside the event stream, not in week 6 — it is the expo safety net and it doubles as the Time Travel Replay feature.

## 13. Do not overbuild

Avoid in MVP: Kubernetes, multiple orchestration frameworks, full autonomous browser agents, 20 agent roles, separate vector database, and user billing. VERITAS and MNEMOS are each small, bounded additions (roughly one service file and one table each) — resist the temptation to over-engineer either into its own subsystem with its own UI section beyond what is specified. The strongest expo system is a smaller architecture whose organization, review loop, and trace are genuinely working.
