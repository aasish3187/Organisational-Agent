# NEXUS — Multi-Tool Build Guide & Master Prompts (v3, self-contained)

## 1. What each tool is actually for

A common failure mode with a stacked toolchain is treating every tool as interchangeable "an AI that can build my app." They're not — each has a real, different job (as of August 2026):

| Tool | What it actually is | Use it for | Don't use it for |
|---|---|---|---|
| **Google Antigravity** | An agentic *development platform* — agent manager, artifacts, codebase-aware workflow, sits above your editor | High-level orchestration: reviewing multi-phase plans, coordinating a large scaffold across the monorepo, running the phased build prompt (below) end to end with checkpoints | Fine-grained, fast in-the-moment code edits — it's built for phase-level agentic work, not tight iteration loops |
| **Claude Code** | A CLI/IDE-embedded coding agent | Deep implementation work within a phase — Organization Compiler logic, policy engine, ADK agent wiring, VERITAS/MNEMOS services — anywhere you want a careful, instructable agent reading your actual docs | Git hosting or PR review |
| **Cursor (the editor)** | An AI-native fork of VS Code with inline agentic edits | Fast iterative UI work — React Flow canvas, Framer Motion transitions, component states, tight edit-preview-edit loops | Long, unsupervised multi-phase builds |
| **Cursor Origin** (beta, Aug 2026) | A **Git-compatible code-hosting platform** — repos, PRs, code browsing, GitHub sync — *not* a coding agent | Hosting your repo if agent-generated branches/PRs become a review bottleneck; optional, low-stakes since it syncs with GitHub | Treating it as a "build my project" agent — it has no project-generation capability; a plain GitHub repo is sufficient for a 6-week expo build |
| **Figma** | Design source of truth | The full design system (tokens, components, screen layouts) — build this first per doc 04 | Fast exploratory visual ideation for a brand-new component |
| **Google Stitch** | Fast text-to-UI generation | First-pass visual directions for novel components (Verify chain, Memory panel) before committing to Figma | Final source of truth — always consolidate back into Figma |
| **Hugging Face** | Model hosting/inference + tooling docs | An optional local/open-weight model for one or two Drafter-tier roles (cost story, "not locked to one vendor") via the Model Router's `local` tier | A required dependency — treat as P2/optional; don't let it become a demo-day stability risk |

## 2. Recommended workflow

1. **Antigravity**: run Phase 0 (plan only) and each subsequent phase as a checkpointed session — this is the project's spine, the place that reads all docs and keeps the whole build coherent phase to phase.
2. **Claude Code** (invokable from within Antigravity, or standalone): the actual within-phase implementation work — FastAPI services, ADK agent definitions, VERITAS/MNEMOS modules, policy engine.
3. **Cursor**: once the backend/API contracts are stable, switch here for the React Flow canvas and the Framer Motion polish pass (doc 04 §8) — genuinely faster in a tight visual-iteration tool than in a CLI agent.
4. **Figma → Stitch → Figma**: build the design system in Figma first (doc 04 §11), use Stitch for the two or three genuinely novel components (Verify chain, Memory panel — prompts in doc 04 §12) to see visual directions fast, then bring the chosen direction back into Figma as the final spec before Cursor implements it.
5. **GitHub (default) or Cursor Origin (optional)**: host the repo. Only add Origin if agent-generated PRs are becoming a review bottleneck — unlikely for a 4-person, 6-week expo build; don't add beta-product risk you don't need.
6. **Hugging Face**: wire in only after the core loop (Phase 3) is solid and demo-tested with your primary provider — a stretch enhancement for the "not vendor-locked" talking point, tested well before demo day if used at all.

## 3. Master prompt — Antigravity + Claude Code (phased build)

Use exactly as structured — Phase 0 first, approval before each subsequent phase.

```text
You are the principal engineer and technical product partner for a university expo project called NEXUS Organization OS.

Read every Markdown file in /docs before writing code — 00 (Unified Overview), 01 (PRD), 02 (Architecture), 03 (Agent Contracts/Data Model), 04 (UI/UX Design System), 05 (Roadmap/Demo), 06 (Research Foundation), 07 (this build guide), 08 (Execution Guide), and 09 (Review Findings/Checklist). These documents are self-contained and are the product source of truth. If instructions conflict, prioritize this order: 03 > 02 > 01 > 04 > 05 > 06 > 00 > 07 > 08. Also read AGENTS.md in the repo root for commands and rules.

PROJECT OUTCOME
Build a working, visually exceptional web application where a user gives a raw project idea and NEXUS:
- creates an editable Idea Contract;
- dynamically compiles a governed AI organization and dependency graph, informed by any relevant prior organizational memory (MNEMOS);
- selects only the necessary roles with an explanation for every selection;
- executes structured worker tasks including a real review/revision loop;
- records evidence, artifacts, task events, budget, and review verdicts, with every event cryptographically chained for tamper-evidence (VERITAS);
- pauses for a real human approval gate;
- produces a final project blueprint, verifiable and exportable;
- writes what it learned back into organizational memory for future runs;
- visualizes the full organization and a replayable decision ledger.

This is not a generic chatbot, static dashboard, fake agent animation, or unrestricted autonomous system. The organization graph, task states, VERITAS chain, and MNEMOS atoms must be backed by real API/state data. If a feature is mocked for demo mode, label it clearly as DEMO REPLAY.

TECHNICAL CONSTRAINTS
- Monorepo with /apps/web and /apps/api.
- Frontend: Next.js latest stable, TypeScript strict mode, Tailwind CSS, shadcn/ui, React Flow, Framer Motion, Recharts, Zod.
- Backend: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, Alembic. Google ADK as the primary agent runtime abstraction, kept behind an interface.
- Persistence: SQLite locally, designed to switch to PostgreSQL+pgvector (used for both project-scoped Evidence retrieval and MNEMOS's ProcessAtom table). MNEMOS embeddings: store vectors on the row and rerank with in-Python cosine similarity (no pgvector dependency in dev); embedding provider per doc 02 §7.
- VERITAS integrity rules (doc 02 §6): hash over the stored canonical payload string (sorted keys, compact separators, ASCII), never re-serialize at verify time; write event + prev_hash + hash in one transaction; single writer per run for chain-head reads.
- Streaming: Server-Sent Events for run events, each event chained via VERITAS at emission time. The DEMO REPLAY mode replays recorded runs through the same SSE pipeline and UI code paths (build in Phase 3, not as a last-minute patch).
- Testing: pytest (backend), Vitest + Playwright smoke test (frontend), including a VERITAS tamper-detection test, a VERITAS clean-chain test, and a MNEMOS empty-match test.
- Docker Compose starts web, api, and optional database consistently.
- Never place API keys in browser code.
- Do not implement unrestricted shell, browser, payment, email, deployment, or write-capable tools.
- Start with deterministic mock agents and seeded artifacts (including seeded ProcessAtoms). Enable real model provider behind `USE_LIVE_MODELS=false` only after the full workflow and tests pass.

ARCHITECTURE REQUIREMENTS
Backend modules: domain/, services/ (including organization_compiler, run_manager, artifact, review, approval, export, mnemos.py), agents/, tools/, api/, telemetry/ (including veritas.py chaining wrapper around the existing event emitter).

Implement core roles: mission_interpreter, organization_compiler, research_analyst, product_strategist, system_architect, ux_strategist, privacy_risk_analyst, reviewer, red_team, solutions_officer, compliance_gate. The organization compiler chooses 3-6 roles based on hard rules plus MNEMOS-retrieved prior atoms plus a clear selection rationale. It must NOT activate all roles by default.

Implement and test these rules as real code:
- personal/student data triggers privacy_risk_analyst;
- app/system requests trigger product_strategist and system_architect;
- research-required tasks trigger research_analyst and evidence check;
- Fast mode limits active workers to 3 and one review pass;
- external writes are disallowed in this product;
- researched factual claims need evidence IDs or must be labelled assumption;
- unresolved high-severity conflicts prevent finalization;
- per-run budgets can stop work and yield a labelled partial result;
- every emitted event is hash-chained (prev_hash + canonical payload + timestamp), and GET /runs/{id}/verify recomputes and confirms the chain, reporting the exact break index if tampered;
- Organization Compiler queries MNEMOS (tag-filter then semantic rerank) before role selection, and a finalized run writes 3-6 new ProcessAtoms back to memory;
- MNEMOS atom extraction must not store verbatim excerpts of user-uploaded material (doc 03 §13).

IMPLEMENTATION PHASES
Phase 0 — Plan only. Inspect /docs and AGENTS.md. Output: implementation plan, final directory tree, dependency choices, risks/questions, exact files for Phase 1. Do not write application code until approved.

Phase 1 — App shell and static experience (per doc 04 screens, including Verify and Memory panel mockups with seeded fake data).

Phase 2 — Domain and API. SQLAlchemy tables including ProcessAtom and Event.prev_hash/hash/payload_canonical from the start, Pydantic schemas from doc 03, Alembic migration, seeded demo data including seed ProcessAtoms, REST endpoints and SSE events including /runs/{id}/verify.

Phase 3 — Genuine orchestration. Rules-based Organization Compiler (with MNEMOS retrieval call stub), mock worker agents producing valid structured artifacts, dependency DAG with parallel execution, event log with VERITAS chaining live from this phase, reviewer-driven revision loop, demo-replay pipeline through the same SSE path.

Phase 4 — Governance and assurance. Policy engine (P-01 through P-09), budget meter, compliance validation, red-team findings, approval interrupt/resume, evidence/claim lineage, MNEMOS write-back at finalization, Markdown/JSON export gated on successful VERITAS verification (P-09).

Phase 5 — Live provider adapter and evaluation. Provider interface with ADK/Gemini adapter behind env keys, all outputs schema-validated. Comparison data model for Single Agent / Flat Swarm / NEXUS — show "not measured" until real runs exist, never invented numbers. Flat Swarm baseline is timeboxed to two engineering days (doc 05 §6); if it is not working, drop the condition honestly. Include the memory-benefit sub-experiment from doc 05 §6.

CODE QUALITY REQUIREMENTS
Strict types, no giant files, idempotency keys and event sequence numbers, validate all input/output, friendly loading/error/empty states, conventional commits per approved phase, honest test/build reporting.

VISUAL QUALITY REQUIREMENTS
Full Liquid Glass design language (iOS 26-style): translucent refractive glass panels with backdrop blur and specular edges over a deep midnight-navy aurora, built exactly on the material system, glass tiers, and CSS recipes in doc 04 §2 and the tokens in doc 04 §6. Calm, premium, trustworthy control-room feel — not generic SaaS, not cyberpunk clutter, no opaque flat panels. Every animation communicates a genuine event. The agent canvas is the hero; Verify and Memory are the two headline trust/learning moments. Glass must never cost readability or 60fps: enforce the performance budget (doc 04 §9 — max 3 stacked backdrop-filter layers, blur caps, animate transform/opacity only) and the accessibility-on-glass rules (doc 04 §10).

START NOW WITH PHASE 0 ONLY. Ask no questions unless a decision blocks the plan; otherwise make a reversible choice and document it.
```

## 4. Phase approval prompt

```text
I approve Phase [NUMBER]. Implement only this phase. Before coding, restate its acceptance criteria in 5 bullets. After coding, run the prescribed tests and build, show changed files, explain the architecture choices briefly, and stop for review. Do not begin the next phase.
```

## 5. Follow-up prompts

### UI refinement prompt
```text
Review the current NEXUS interface against /docs/04-UI-UX-Figma-Stitch-Design-System.md. Improve visual hierarchy, whitespace, graph readability, keyboard accessibility, loading/error states, and reduced-motion behavior. Preserve working API contracts. Do not add decorative animation unless it represents a real task/event. Provide before/after screenshots or a concise visual change log, then run frontend checks.
```

### Reliability review prompt
```text
Act as a senior distributed-systems and AI-safety reviewer. Inspect the NEXUS codebase for duplicate task execution, event ordering defects, missing authorization checks, secrets leakage, unvalidated model output, budget bypasses, stuck approval states, and UI/backend state mismatch. Check specifically for VERITAS chain gaps (events emitted without chaining, non-transactional writes, re-serialization at verify time instead of the stored canonical payload) and MNEMOS atoms leaking private uploaded content (verbatim excerpts stored in atom fields). Write findings to docs/SECURITY_AND_RELIABILITY_REVIEW.md, fix only high-confidence issues, add regression tests, and report remaining risks without exaggeration.
```

### Evaluation prompt
```text
Implement the evaluation harness described in /docs/05-Implementation-Roadmap-Quality-and-Expo-Demo.md. Create versioned benchmark prompt fixtures and a CSV/JSON result format with condition, task, run number, model profile, coverage score, evidence coverage, contradictions, cost, latency, and human rating. Include the memory-benefit sub-experiment as a labelled separate table. Do not fabricate any measurement. If no results exist, the UI must say "Not measured yet."
```

### Figma-to-code handoff prompt
```text
I have a Figma design for NEXUS. Use it as visual guidance, but preserve the existing typed API contracts and accessibility. Map components to the established design tokens. Recreate the layout with reusable components, not pixel-positioned HTML. Validate desktop at 1440px and mobile at 390px. The React Flow organization canvas must become a vertical accessible timeline on mobile.
```

## 6. Cursor-specific prompt (UI iteration pass)

```text
You're working in Cursor on the NEXUS Organization OS frontend (Next.js/TypeScript/Tailwind/shadcn/React Flow/Framer Motion). The backend API contracts are stable — do not modify them. Read /docs/04-UI-UX-Figma-Stitch-Design-System.md as your source of truth for tokens, components, and the motion rules.

Focus this session on: [pick one — e.g. "the Living Organization Canvas's React Flow node rendering and the Verify chain animation"]. Match the Figma design exactly for spacing, color tokens, and typography. Implement glass surfaces exactly per the doc 04 §2 tiers and recipes — no improvised blur/alpha values — and stay within the doc 04 §9 performance budget. Every animation must tie to a real event from the SSE stream — no decorative-only motion. Respect prefers-reduced-motion. Keep the Verify animation under 2 seconds regardless of event count. Test at 1440px and 390px viewports before considering this done.
```

## 7. On Cursor Origin specifically
If you do adopt it: sync your existing GitHub repo in rather than starting fresh there (GitHub stays the source of truth during beta), and treat it purely as a review/hosting convenience layered on top of the workflow above — it changes nothing about which tool writes which code. Given it's a two-week-old beta as of this writing with no issues/project-boards/public-repos/CI-runner yet, the lower-risk default for a time-boxed expo project is a plain GitHub repo; revisit Origin post-expo if it matures.
