# NEXUS Implementation Roadmap, Evaluation, and Expo Demo

## 1. Recommended build strategy

Build an impressive **vertical slice**, not a giant incomplete platform. The judging-quality version is one domain (student/startup project blueprint), six well-bounded agents, real saved artifacts, one revision, one approval, one reliable live run, and a prepared replay fallback.

## 2. Six-week roadmap

| Week | Outcome | Deliverables |
|---|---|---|
| 1 | Foundation + UX | Figma prototype, Next.js shell, design tokens, static Living Organization screen, seeded demo JSON |
| 2 | Intake + planning | FastAPI, PostgreSQL/SQLite schema, Idea Contract, rules-based Organization Compiler, org graph from real API |
| 3 | First agent loop | ADK runtime, Research and Product agents, structured artifacts, Reviewer, event stream |
| 4 | Real coordination | 3–6 dynamic roles, parallel execution, dependency DAG, revision loop, evidence records |
| 5 | Governance + polish | policy engine, approval interrupt/resume, trace ledger, blueprint export, Counterfactual Lab |
| 6 | Reliability + story | tests, evaluation runs, demo data/replay, performance tuning, pitch rehearsal, backup plan |

If you have only two weeks, complete Weeks 1–3 plus a manually seeded approval/replay. Do not fake live system behavior; label seeded content “demo replay.”

## 3. Sprint backlog

### P0: must be working
- Create a project and save an Idea Contract
- Compile an organization plan from rules and an LLM explanation
- Render the organization graph with actual task state
- Execute Research -> Product -> Reviewer -> Final Blueprint
- Persist run events and stream them to UI
- Request a revision from Reviewer and show version 2
- Show source/evidence IDs for researched claims
- Enforce one budget cap and one human approval gate
- Export final blueprint as Markdown/JSON

### P1: makes it exceptional
- Parallel research + UX tasks
- Clickable claim-to-evidence lineage
- Single-vs-flat-vs-NEXUS comparison using saved benchmark prompts
- PDF export
- Project memory/retrieval scoped to a project
- Animation, keyboard accessibility, responsive mobile timeline

### P2: roadmap only
- Agent-to-agent protocol adapter
- Local Hugging Face model fallback
- Multi-user collaboration
- Deployable code generation
- Enterprise SSO, full audit retention, multi-tenant control plane

## 4. Definition of done

A feature is done only when:
- It works with fresh data and not only a screenshot
- It has loading, error, and empty states
- Its state survives a refresh where appropriate
- It emits an auditable event
- It does not leak secrets or bypass policy
- A nontechnical teammate can explain its value in one sentence

## 5. Testing plan

### Unit tests
- Complexity/risk score selects required roles
- Every P-01 to P-08 policy rule permits or blocks correctly
- Artifact schema validation rejects invalid objects
- Budget state transitions work
- Dependency graph has no cycles
- ABAC blocks cross-project artifact reads

### Integration tests
- Create project -> compile plan -> run mock agents -> reviewer revision -> final blueprint
- Approval interrupt pauses run and resumes exactly once
- Tool failure becomes a visible event and does not duplicate artifacts
- Budget exhaustion produces partial blueprint with warning

### UI tests
- Live graph reflects event data
- Node inspector matches selected agent
- Approval button sends expected decision
- Reduced motion works
- Keyboard focus reaches every action

### Human evaluation
Recruit 5–10 peers or faculty. Give all systems the same three prompts. Blind them to the mode where possible. Score 1–5:
- usefulness / completeness
- clarity
- trust in evidence
- architecture coherence
- ability to explain reasoning

Record comments, not only averages.

## 6. Evaluation experiment

### Research question
Does NEXUS’s dynamic hierarchy improve the completeness, traceability, and perceived trustworthiness of a project blueprint under an equal or controlled token budget compared with a single-agent baseline?

### Conditions
| Condition | Description |
|---|---|
| Single Agent | One strong model receives the full prompt and blueprint template |
| Flat Swarm | 4 specialists work as peers, then a summarizer combines them |
| NEXUS | Governance -> selected workers -> reviewer/red team -> compliance/human gate |

### Tasks
- AI exam-prep platform
- Campus sustainability marketplace
- Student support workflow with synthetic policy documents

### Metrics
| Metric | How to measure |
|---|---|
| Requirement coverage | Fraction of predefined rubric items addressed |
| Evidence coverage | Supported factual claims / factual claims sampled |
| Contradictions | Independent reviewer counts unresolved contradictions |
| Traceability | Percentage of final key claims linked to artifact/evidence |
| Cost | Sum input/output tokens and tool calls |
| Latency | Wall-clock completion time |
| Human trust | Mean Likert score from evaluators |
| Intervention rate | Approval/escalation events per run |

### Fairness rules
- Same model family, temperature, time limit, and maximum token budget where feasible
- Run each task at least three times because LLM outputs vary
- Label small sample sizes as preliminary
- Do not report a percentage increase without raw scores and method
- Report cases where NEXUS is slower or not better

## 7. Expo demo choreography (4 minutes)

### 0:00–0:25 — Hook
Say: “Most agent demos show many agents talking. We built the missing layer: an organization that decides which agents should exist, what they may do, and how their work is verified.”

### 0:25–0:55 — Input
Type or paste: “Design a multilingual AI exam-prep platform for B.Tech students in India.” Show the Idea Contract; explain that assumptions are visible rather than hidden.

### 0:55–1:40 — Organization forms
Click Compile Organization. Point to the graph: Research, Product, AI/RAG, UX, Privacy/Risk, Reviewer. Click a node and show “why selected” and tool limits.

### 1:40–2:25 — Work and evidence
Show parallel Research and UX work. Open an evidence card. Show the Reviewer catching an unsupported cost claim and requesting revision.

### 2:25–2:55 — Human control
Open the live approval gate for student-data retention. Select the privacy-preserving option. Emphasize the system paused rather than silently deciding.

### 2:55–3:35 — Final outcome
Open Final Blueprint: architecture, UX, risk register, backlog, and decision ledger. Click “replay how we got here.”

### 3:35–4:00 — Evidence of contribution
Open Counterfactual Lab. Say: “We evaluate NEXUS against a single-agent baseline using coverage, evidence, contradictions, cost, latency, and human ratings. We do not claim universal superiority; we make the trade-offs visible.”

## 8. Questions judges may ask

**Why not a single LLM?**
A single LLM is excellent for simple work. NEXUS targets cross-domain work where planning, specialized artifacts, review, policy boundaries, and traceability matter.

**Why not simply call ten agents?**
More agents can duplicate effort and increase cost. The Organization Compiler chooses a minimum justified team, budgets it, and records why each role exists.

**Is the organization really dynamic?**
Yes. The generated OrganizationPlan is stored as a task DAG. Different idea contracts produce different roles, dependencies, budgets, and approval gates.

**How do you prevent hallucinations?**
We do not claim perfect prevention. We require evidence links for researched claims, label assumptions, run review/red-team checks, and escalate unresolved high-risk issues.

**What is novel?**
The product contribution is adaptive organization compilation plus a visual decision/evidence ledger and counterfactual comparison—not merely predefined agents with titles.

**Can it replace humans?**
No. It assists project discovery and planning. Humans define objectives, approve consequential choices, and remain accountable.

## 9. Backup plan

- Prepare a 45-second screen recording of the complete live run.
- Seed three replay runs locally; internet should not be needed to present the dashboard.
- Have screenshots/PDF of architecture and evaluation table.
- Use a local `.env.demo` with mock model responses only for the fallback mode; show `DEMO REPLAY` in the UI.
- Keep one concise printout: problem, architecture, evaluation method, and QR code to repository/video.

## 10. Team split (if you have 4 people)

| Person | Ownership |
|---|---|
| AI/Backend lead | ADK agents, compiler, policies, FastAPI, state |
| Full-stack lead | Next.js, SSE integration, API client, auth/demo data |
| Design lead | Figma, Stitch exploration, design system, React Flow canvas, demo polish |
| Research/QA lead | Evaluation prompts, rubric, test cases, pitch, documentation |

All members should understand the full user flow and be able to explain the safety/honesty boundaries.
