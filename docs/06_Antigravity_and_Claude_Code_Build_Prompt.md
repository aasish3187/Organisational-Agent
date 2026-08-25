# NEXUS — Master Build Prompt for Google Antigravity and Claude Code

## How to use

1. Create an empty repository named `nexus-organization-os` in Antigravity.
2. Add the project documents in this package to `/docs`.
3. Open Claude Code in Antigravity and paste the master prompt below.
4. Ask it to complete **Phase 0 only**, review the plan, then proceed phase by phase. Do not ask an autonomous coding agent to build the entire system in one unreviewed step.
5. After each phase, run tests, inspect the UI, commit with a meaningful message, and only then start the next phase.

## Master prompt

```text
You are the principal engineer and technical product partner for a university expo project called NEXUS Organization OS.

Read every Markdown file in /docs before writing code. Treat these documents as the product source of truth. If instructions conflict, prioritize this order:
1. /docs/03_Agent_Contracts_Policies_and_Data_Model.md
2. /docs/02_System_Architecture_and_Technology.md
3. /docs/01_Product_Requirements_and_User_Flows.md
4. /docs/04_UI_UX_Figma_and_Stitch_Design_System.md
5. /docs/05_Implementation_Roadmap_Quality_and_Expo_Demo.md
6. /docs/00_NEXUS_Organization_OS_Overview.md

PROJECT OUTCOME
Build a working, visually exceptional web application where a user gives a raw project idea and NEXUS:
- creates an editable Idea Contract;
- dynamically compiles a governed AI organization and dependency graph;
- selects only the necessary roles with an explanation for every selection;
- executes structured worker tasks, including a real review/revision loop;
- records evidence, artifacts, task events, budget, and review verdicts;
- pauses for a real human approval gate;
- produces a final project blueprint;
- visualizes the full organization and replayable decision ledger.

This is not a generic chatbot, static dashboard, fake agent animation, or an unrestricted autonomous system. The organization graph and task states must be backed by real API/state data. If a feature is mocked for demo mode, label it clearly as DEMO REPLAY.

TECHNICAL CONSTRAINTS
- Monorepo with /apps/web and /apps/api.
- Frontend: Next.js latest stable, TypeScript strict mode, Tailwind CSS, shadcn/ui, React Flow, Framer Motion, Recharts, Zod.
- Backend: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, Alembic. Use Google ADK only as the primary agent runtime abstraction; keep provider calls behind interfaces.
- Local persistence: SQLite by default, designed to switch to PostgreSQL. Use local filesystem artifact storage in development.
- Streaming: Server-Sent Events for run events.
- Testing: pytest for backend, Vitest plus Playwright smoke test for frontend.
- Docker Compose must start web, api, and optional database consistently.
- Never place API keys in browser code. Use `.env.example` with placeholder names only.
- Do not implement unrestricted shell, browser, payment, email, deployment, or write-capable tools.
- Start with deterministic mock agents and seeded artifacts. Enable real model provider behind `USE_LIVE_MODELS=false` only after the full workflow and tests work.

ARCHITECTURE REQUIREMENTS
Implement these backend modules:
- domain/: typed entities, artifact schemas, state machine, policy rules
- services/: project, organization compiler, run manager, artifact, review, approval, export
- agents/: role manifests, mock agents, ADK adapter, model router
- tools/: safe read-only mock/retrieval tools and registry
- api/: REST routers and SSE event endpoint
- telemetry/: structured event emitter and OpenTelemetry-compatible adapter

Implement core roles: mission_interpreter, organization_compiler, research_analyst, product_strategist, system_architect, ux_strategist, privacy_risk_analyst, reviewer, red_team, solutions_officer, compliance_gate. The organization compiler chooses 3–6 roles based on hard rules plus a clear selection rationale. It must NOT activate all roles by default.

Implement these rules as real code and test them:
- personal/student data triggers privacy_risk_analyst;
- app/system requests trigger product_strategist and system_architect;
- research-required tasks trigger research_analyst and evidence check;
- Fast mode limits active workers to 3 and one review pass;
- external writes are disallowed in this product;
- researched factual claims need evidence IDs or must be labelled assumption;
- unresolved high-severity conflicts prevent finalization;
- per-run token/time/cost budgets can stop work and yield a labelled partial result.

IMPLEMENTATION PHASES

Phase 0 — Plan only. Inspect the repository and docs. Output:
1. concise implementation plan;
2. final directory tree;
3. dependency choices and versions;
4. risks/questions;
5. exact files to create in Phase 1.
Do not write application code until I approve the plan.

Phase 1 — App shell and static experience.
- Scaffold monorepo and Docker configuration.
- Create a high-fidelity responsive dark mission-control UI following the design document.
- Pages: landing, intake, live organization, work/artifact detail, approval, blueprint, lab.
- Use a realistic seeded run JSON, not lorem ipsum.
- React Flow graph must have governance, specialist, assurance, and blueprint nodes.
- Add reduced-motion accessibility support.
- Add frontend lint/typecheck and component tests.

Phase 2 — Domain and API.
- Create SQLAlchemy tables/entities: Project, Run, AgentInstance, Task, Artifact, Evidence, Claim, Review, Approval, Event, Metric.
- Add Pydantic schemas defined in the docs.
- Add Alembic migration and seeded demo data.
- Implement REST endpoints and SSE events.
- Add backend tests for schema validation and state transitions.

Phase 3 — Genuine orchestration.
- Build a rules-based Organization Compiler that returns OrganizationPlan JSON.
- Implement mock worker agents that produce valid structured artifacts.
- Execute a dependency DAG; allow independent tasks to run in parallel.
- Persist event log and update UI via SSE.
- Implement reviewer-driven revision: one artifact must move from SUBMITTED -> NEEDS_REVISION -> RUNNING -> APPROVED.

Phase 4 — Governance and assurance.
- Implement policy engine, budget meter, compliance validation, red-team findings, and an approval interrupt/resume flow.
- The approval screen must pause the run; approving resumes the same stored run without duplicating prior work.
- Add evidence/claim lineage shown in task detail and blueprint.
- Implement Markdown and JSON export.

Phase 5 — Live provider adapter and evaluation.
- Retain mock mode as default.
- Add a provider interface with a Google ADK/Gemini adapter only when environment keys are available. All outputs must be validated against Pydantic schemas.
- Add comparison data model for Single Agent / Flat Swarm / NEXUS runs. Do not invent results; show “not measured” until runs exist.
- Add an admin-free demo selector and clear DEMO REPLAY badge.

CODE QUALITY REQUIREMENTS
- Strict types. No `any` in frontend except a justified isolated adapter.
- No giant files; domain behavior belongs in services, not routers or React pages.
- Use idempotency keys and event sequence numbers for run actions.
- Validate all API input and agent output.
- Add friendly error messages and loading/empty states.
- Commit at end of each approved phase with conventional commit messages.
- Before claiming a phase is complete, run relevant tests, typechecks, and build; report exact command outputs and failures honestly.

VISUAL QUALITY REQUIREMENTS
The UI should feel like a calm, premium, trustworthy future organization—not a generic SaaS dashboard or cyberpunk game. Use midnight navy, glass surfaces, violet/cyan signals, green verification and amber risk. Every animation must communicate a genuine event. The agent canvas is the hero. Clicking an agent must reveal mandate, allowed tools, reason selected, inputs, outputs, and status. Include a Decision Ledger rail and a Time Travel Replay control.

START NOW WITH PHASE 0 ONLY. Ask no questions unless a decision blocks the plan; otherwise make a reversible choice and document it.
```

## Follow-up prompts

### Phase approval prompt

```text
I approve Phase [NUMBER]. Implement only this phase. Before coding, restate its acceptance criteria in 5 bullets. After coding, run the prescribed tests and build, show changed files, explain the architecture choices briefly, and stop for review. Do not begin the next phase.
```

### UI refinement prompt

```text
Review the current NEXUS interface against /docs/04_UI_UX_Figma_and_Stitch_Design_System.md. Improve visual hierarchy, whitespace, graph readability, keyboard accessibility, loading/error states, and reduced-motion behavior. Preserve working API contracts. Do not add decorative animation unless it represents a real task/event. Provide before/after screenshots or a concise visual change log, then run frontend checks.
```

### Reliability review prompt

```text
Act as a senior distributed-systems and AI-safety reviewer. Inspect the NEXUS codebase for duplicate task execution, event ordering defects, missing authorization checks, secrets leakage, unvalidated model output, budget bypasses, stuck approval states, and UI/backend state mismatch. Write findings to docs/SECURITY_AND_RELIABILITY_REVIEW.md, fix only high-confidence issues, add regression tests, and report remaining risks without exaggeration.
```

### Evaluation prompt

```text
Implement the evaluation harness described in /docs/05_Implementation_Roadmap_Quality_and_Expo_Demo.md. Create versioned benchmark prompt fixtures and a CSV/JSON result format with condition, task, run number, model profile, coverage score, evidence coverage, contradictions, cost, latency, and human rating. Do not fabricate any measurement. If no results exist, the UI must say “Not measured yet.”
```

## Figma-to-code handoff prompt

```text
I have a Figma design for NEXUS. Use it as visual guidance, but preserve the existing typed API contracts and accessibility. Map components to the established design tokens. Recreate the layout with reusable components, not pixel-positioned HTML. Validate desktop at 1440px and mobile at 390px. The React Flow organization canvas must become a vertical accessible timeline on mobile.
```
