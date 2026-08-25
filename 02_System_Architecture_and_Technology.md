# NEXUS System Architecture and Technology Decisions

## 1. Architecture principle

Use a **modular monolith with an event-driven workflow core** for the expo. It is complex enough to demonstrate true orchestration but small enough for a student team to build, test, and explain. Do not begin with microservices or Kubernetes.

Use one primary agent runtime: **Google ADK with Python**. It has first-class multi-agent workflow composition; its workflow primitives support sequential, parallel, and looped work. Keep the orchestration domain model independent of ADK so it can later be ported to LangGraph or another runtime.

## 2. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Web app | Next.js (App Router), TypeScript | High-quality UI, streaming, mature ecosystem |
| UI | Tailwind CSS, shadcn/ui, Framer Motion, React Flow, Recharts | Fast accessible components, graph visualization, purposeful motion, analytics |
| API | FastAPI, Python 3.12, Pydantic v2 | Typed request schemas and direct ADK integration |
| Agent runtime | Google ADK | Multi-agent composition, sessions, parallel/sequential/loop patterns |
| Workflow state | PostgreSQL in production; SQLite locally | Durable projects, tasks, audit events and approvals |
| Semantic retrieval | pgvector in PostgreSQL | One database for metadata and embeddings; reduce moving parts |
| Queue/cache | Redis + ARQ or Celery only after basic flow works | Decouples long runs and stream delivery; avoid this in first local prototype if unnecessary |
| Object artifacts | Local filesystem for demo; S3-compatible storage later | Store uploaded files and generated reports separately |
| Live updates | Server-Sent Events (SSE) first; WebSocket only if needed | Simpler reliable one-way event stream for activity feed |
| Auth | Demo PIN / anonymous session first; Supabase Auth later | Avoid auth scope destroying the expo MVP |
| Observability | OpenTelemetry + structured JSON logs; optional Langfuse/Grafana | Trace agent, model, tool, task, cost and failures |
| Deployment | Docker Compose; frontend on Vercel / backend on Cloud Run later | Repeatable demonstration and straightforward scale path |
| Testing | pytest, Playwright, Vitest | Test orchestration logic and visible demo flows |

## 3. Top-level components

```text
Browser (Next.js)
  | REST: create project, approval, export
  | SSE: run events, task updates, token metrics
  v
FastAPI Gateway
  |-- Project Service ------------ PostgreSQL / pgvector
  |-- Policy Engine ------------- policy rules + ABAC checks
  |-- Organization Compiler ----- task graph and role selection
  |-- ADK Workflow Runner ------- agent execution + sessions
  |-- Tool Gateway -------------- web/retrieval/code/file tools
  |-- Artifact Service ---------- local/S3 files + content hashes
  |-- Telemetry Adapter --------- OpenTelemetry traces + metrics
  v
Model Router
  |-- premium reasoning model
  |-- fast low-cost model
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

The worker pool must return structured artifacts, not free-form chat messages.

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

## 6. Dynamic planning algorithm

The planner should be deterministic where possible and LLM-assisted where ambiguity matters.

```text
1. Parse task into IdeaContract (goal, domain, deliverables, risk, constraints).
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

## 7. Model router

Never attach a separate expensive model to every role by default. Use a provider abstraction:

```python
class ModelProfile:
    name: str
    tier: Literal['fast', 'reasoning', 'local']
    supports_tools: bool
    supports_structured_output: bool
    max_cost_per_task: Decimal
```

Suggested policy:
- **Fast tier:** classification, extraction, task routing, simple formatting
- **Reasoning tier:** planning, complex architecture, conflict resolution, final synthesis
- **Local tier:** demonstrations with no internet, redaction, simple structured extraction

An optional Hugging Face model must be tool/function-call capable. Test structured output and function-call reliability before presenting it. It is a fallback, not a claim of full offline parity with a frontier model.

## 8. Tool gateway

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

## 9. Why this architecture is credible

The OrgAgent paper motivates separated governance, execution, and compliance layers rather than flat coordination. Google ADK supports composable multi-agent workflows including parallel and loop patterns. Durable workflow systems such as LangGraph demonstrate why persisted state plus interrupts are appropriate when human approval or resume-after-failure is required. NEXUS adopts these concepts but uses a constrained, testable organization plan rather than pretending agents are autonomous employees.

## 10. Build order

1. Mock UI with static seeded run
2. Database schema and REST API
3. Idea Contract + rules-based Organization Compiler
4. One live worker and one reviewer, structured artifacts only
5. Parallel research/UX workers and SSE events
6. Approval gate and durable resume
7. Evidence graph, export, baseline comparison
8. Optional local model and deployment hardening

## 11. Do not overbuild

Avoid in MVP: Kubernetes, multiple orchestration frameworks, full autonomous browser agents, 20 agent roles, separate vector database, and user billing. The strongest expo system is a smaller architecture whose organization, review loop, and trace are genuinely working.
