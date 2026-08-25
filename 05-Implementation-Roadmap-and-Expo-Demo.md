# NEXUS — Implementation Roadmap, Quality, and Expo Demo (v3, self-contained)

## 1. Build strategy

Build an impressive **vertical slice**, not a giant incomplete platform. The judging-quality version is one domain (student/startup project blueprint), six well-bounded agents, real saved artifacts, one revision, one approval, one reliable live run, and a prepared replay fallback.

## 2. Six-week roadmap

| Week | Outcome | Deliverables |
|---|---|---|
| 1 | Foundation + UX | Figma prototype (including Verify + Memory panel mockups), Next.js shell, **liquid glass design tokens and material recipes (doc 04 §2)**, static Living Organization screen, seeded demo JSON |
| 2 | Intake + planning | FastAPI, PostgreSQL/SQLite schema **including `ProcessAtom` table and `Event.prev_hash`/`hash`/`payload_canonical` columns from the start**, Idea Contract, rules-based Organization Compiler, org graph from real API |
| 3 | First agent loop | ADK runtime, Research and Product agents, structured artifacts, Reviewer, event stream **with VERITAS chaining wired into the telemetry emitter from day one**, **demo-replay pipeline (recorded run replayed through the same SSE path)** |
| 4 | Real coordination | 3-6 dynamic roles, parallel execution, dependency DAG, revision loop, evidence records, **MNEMOS retrieval call added to Organization Compiler** |
| 5 | Governance + polish | policy engine, approval interrupt/resume, trace ledger, blueprint export, Counterfactual Lab, **MNEMOS write step at finalization, seeded atom store, Verify UI action wired end-to-end** |
| 6 | Reliability + story | tests, evaluation runs, demo data/replay, performance tuning, pitch rehearsal, backup plan |

If only two weeks are available: complete Weeks 1-3 plus a manually seeded approval/replay. VERITAS's schema fields still belong in Week 2 even on a compressed timeline (cheap now, expensive to retrofit); MNEMOS can be cut entirely on a two-week timeline without damaging the core pitch — the hierarchy + governance + evidence story stands on its own.

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
- VERITAS chain fields present on every event; a basic (even unstyled) verify check working end-to-end — cheap enough to be P0, not P1

### P1: makes it exceptional
- Parallel research + UX tasks
- Clickable claim-to-evidence lineage
- Single-vs-flat-vs-NEXUS comparison using saved benchmark prompts
- PDF export
- Project memory/retrieval scoped to a project
- Animation, keyboard accessibility, responsive mobile timeline
- Polished Verify animation and Memory panel UI
- MNEMOS write+retrieve fully wired with seeded atoms

### P2: roadmap only
- Agent-to-agent protocol adapter
- Local Hugging Face model fallback
- Multi-user collaboration
- Deployable code generation
- Enterprise SSO, full audit retention, multi-tenant control plane
- Periodic anchoring of VERITAS chain heads (signed/committed head hashes) — the honest upgrade path for the "recompute attack" question

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
- Every P-01 to P-09 policy rule permits or blocks correctly
- Artifact schema validation rejects invalid objects
- Budget state transitions work
- Dependency graph has no cycles
- ABAC blocks cross-project artifact reads
- **Tampering with a stored event payload causes `verify_chain()` to correctly report `broken_at_index`**
- **`verify_chain()` on an untampered run returns valid (guards against canonicalization regressions)**

### Integration tests
- Create project -> compile plan -> run mock agents -> reviewer revision -> final blueprint
- Approval interrupt pauses run and resumes exactly once
- Tool failure becomes a visible event and does not duplicate artifacts
- Budget exhaustion produces partial blueprint with warning
- **A run with no MNEMOS matches produces the correct empty-state payload; a run with matches produces atoms correctly attributed in `selection_rationale`**

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
Does NEXUS's dynamic hierarchy improve the completeness, traceability, and perceived trustworthiness of a project blueprint under an equal or controlled token budget compared with a single-agent baseline?

### Conditions
| Condition | Description |
|---|---|
| Single Agent | One strong model receives the full prompt and blueprint template |
| Flat Swarm | 4 specialists work as peers, then a summarizer combines them |
| NEXUS | Governance -> selected workers -> reviewer/red team -> compliance/human gate |

**Flat Swarm timebox (v3 rule):** the swarm baseline is a means, not a deliverable. Implement the simplest possible version — same four specialist prompts, no hierarchy, round-robin contributions into one shared thread, one summarizer, same model family and total budget. Maximum two engineering days. If it is not working by the end of Week 5, drop the condition and present Single Agent vs NEXUS honestly rather than shipping a broken comparison.

### Tasks
- AI exam-prep platform
- Campus sustainability marketplace
- Student support workflow with synthetic policy documents

### Metrics
| Metric | How to measure |
|---|---|---|
| Requirement coverage | Fraction of predefined rubric items addressed |
| Evidence coverage | Supported factual claims / factual claims sampled |
| Contradictions | Independent reviewer counts unresolved contradictions |
| Traceability | Percentage of final key claims linked to artifact/evidence |
| Cost | Sum input/output tokens and tool calls |
| Latency | Wall-clock completion time |
| Human trust | Mean Likert score from evaluators |
| Intervention rate | Approval/escalation events per run |
| Memory benefit | For a second run on a related seeded task, compare role-selection accuracy and time-to-first-plan with vs. without MNEMOS atoms available — reported as a labelled sub-experiment, not folded into the headline comparison, since it only applies once a memory store exists |

### Fairness rules
- Same model family, temperature, time limit, and maximum token budget where feasible
- Run each task at least three times because LLM outputs vary
- Label small sample sizes as preliminary
- Do not report a percentage increase without raw scores and method
- Report cases where NEXUS is slower or not better

## 7. Expo demo choreography (~4 minutes)

### 0:00-0:25 — Hook
Say: "Most agent demos show many agents talking. We built the missing layer: an organization that decides which agents should exist, what they may do, how their work is verified, and what it remembers."

### 0:25-0:55 — Input
Type or paste: "Design a multilingual AI exam-prep platform for B.Tech students in India." Show the Idea Contract; explain that assumptions are visible rather than hidden.

### 0:55-1:40 — Organization forms
Click Compile Organization. Point to the graph: Research, Product, AI/RAG, UX, Privacy/Risk, Reviewer. Click a node and show "why selected" and tool limits. **If a memory badge appears on the Mission node, open it**: "Notice it already flagged Privacy/Risk as likely relevant — that's not a hardcoded rule, it's recalling a similar case."

### 1:40-2:25 — Work and evidence
Show parallel Research and UX work. Open an evidence card. Show the Reviewer catching an unsupported cost claim and requesting revision.

### 2:25-2:55 — Human control
Open the live approval gate for student-data retention. Select the privacy-preserving option. Emphasize the system paused rather than silently deciding.

### 2:55-3:20 — Final outcome + trust
Open Final Blueprint. Click "Verify integrity" — narrate the scan-line and the confirmation chip: "Every one of these events is cryptographically chained — if I'd edited anything after the fact, this would show exactly where." Then click "replay how we got here."

### 3:20-3:50 — Evidence of contribution
Open Counterfactual Lab. Say: "We evaluate NEXUS against a single-agent baseline using coverage, evidence, contradictions, cost, latency, and human ratings. We do not claim universal superiority; we make the trade-offs visible."

### 3:50-4:00 — Close
One sentence: one idea in, a governed organization, a verified blueprint, and a system that starts smarter on run two.

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
The product contribution is adaptive organization compilation plus a visual decision/evidence ledger, tamper-evident event chaining, cross-run organizational memory, and counterfactual comparison — not merely predefined agents with titles.

**Can it replace humans?**
No. It assists project discovery and planning. Humans define objectives, approve consequential choices, and remain accountable.

**Isn't hashing/logging standard practice — what's actually new about VERITAS?**
Most systems log events; almost none chain them so tampering anywhere breaks a verifiable check. It's a small addition with an outsized trust payoff, and it's demoable live in under two seconds.

**If someone has database access, can't they just recompute the whole chain?**
Honestly: a hash chain alone cannot stop a determined attacker with write access from recomputing it. What it does is make any after-the-fact edit of stored records detectable by anyone who can read the log — which covers the realistic threat model for an internal audit trail. The standard upgrade is periodic anchoring: publishing the chain head somewhere immutable (a signed timestamp, a commit to the repo). Anchoring is listed as roadmap work; we did not fake it in the MVP.

**Doesn't hierarchy just add handoff overhead?**
That is a real measured risk — Liu (2026) found naive hierarchy and committee forms underperform a single expert when handoffs create more context cost than collective gain, while adaptive organization and shared memory were the strongest forms. That is exactly why NEXUS is not a fixed org chart: the Compiler picks team size and depth per mission, and agents exchange versioned structured artifacts through a shared store instead of lossy chat handoffs. OrgAgent reports hierarchy winning on QA-style benchmarks with lower token use; the papers disagree, so we built the Counterfactual Lab to test our combination rather than assume.

**How is MNEMOS different from just doing RAG on past runs?**
Plain RAG chunks and similarity-searches raw documents; MNEMOS decomposes runs into structured, tagged, reusable atoms and retrieves via tag-filter-then-semantic-rerank — the SAP paper this is based on measured that hybrid approach beating plain RAG by roughly 15-18 points of policy-compliance in their proof-of-concept.

## 9. Backup plan

- Prepare a 45-second screen recording of the complete live run.
- Seed three replay runs locally; internet should not be needed to present the dashboard.
- Have screenshots/PDF of architecture and evaluation table.
- Use a local `.env.demo` with mock model responses only for the fallback mode; show `DEMO REPLAY` in the UI.
- Keep one concise printout: problem, architecture, evaluation method, and QR code to repository/video.
- **Rehearsal budget rule:** rehearse in mock/fast-tier mode; run the full reasoning-tier live flow only in the final rehearsal and the show itself, so token cost and rate-limit risk stay bounded.

## 10. Team split (four people)

| Person | Ownership |
|---|---|
| AI/Backend lead | ADK agents, compiler, policies, FastAPI, state, VERITAS/MNEMOS services |
| Full-stack lead | Next.js, SSE integration, API client, auth/demo data, replay pipeline |
| Design lead | Figma, Stitch exploration, design system, React Flow canvas, Verify/Memory polish |
| Research/QA lead | Evaluation prompts, rubric, test cases, atom seeding, pitch, documentation |

All members should understand the full user flow and be able to explain the safety/honesty boundaries.
