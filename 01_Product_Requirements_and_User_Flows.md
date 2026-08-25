# NEXUS Product Requirements Document

## 1. Product goal

Build an interactive web application that turns a vague idea into a verified, explainable project blueprint through a dynamically organized multi-agent workflow.

**Primary persona:** student innovator, founder, or product team member who has an idea but does not know which experts or steps are required.

**Primary job:** “Help me turn my one-sentence idea into a credible, technically detailed project plan, while showing how the AI team reached it.”

## 2. User stories

| ID | User story | Acceptance condition |
|---|---|---|
| US-01 | As a student, I enter a raw project idea and intended outcome | I receive a brief, assumptions, constraints, and clarifying questions |
| US-02 | As a user, I choose budget, quality, and speed preferences | The planner changes team size and model/task budget accordingly |
| US-03 | As a user, I see which agents were selected | Every selected and excluded role has a human-readable reason |
| US-04 | As a user, I watch work progress | I see task state, dependencies, artifacts, and live event stream |
| US-05 | As a reviewer, I inspect a claim | I can trace it to evidence, agent output, review result, and version |
| US-06 | As a human owner, I approve high-impact choices | The system pauses, shows alternatives and risks, then resumes only after approval |
| US-07 | As an expo visitor, I compare coordination modes | I can compare Single Agent, Flat Swarm, and NEXUS results on a saved prompt |
| US-08 | As a user, I export results | I can download a blueprint containing assumptions, citations, architecture, backlog, risks, and decision history |

## 3. Functional requirements

### FR-1: Intake and clarification
- Text input: idea, target users, problem, constraints, preferred output
- Optional upload: PDF, Markdown, CSV, image
- Modes: `Fast`, `Balanced`, `Deep`
- Ask at most three high-value clarifying questions before planning. Allow “continue with assumptions.”
- Generate an **Idea Contract**: goal, non-goals, assumptions, deliverable list, success measures, domain risk level.

### FR-2: Organization Compiler
- Derive task complexity, skills, risk, data sensitivity, expected artifacts, budget, and deadline.
- Select 3–6 worker roles for the MVP; never auto-create unlimited agents.
- Create a directed acyclic graph (DAG): task, owner, dependency, tool permissions, expected schema, timeout, token budget, review requirement.
- Explain selection in plain language: “Security reviewer added because the project stores student profiles.”
- Use `DIRECT`, `LIGHT`, or `FULL` workflow depth based on complexity and budget.

### FR-3: Execution workspace
- Run independent tasks concurrently.
- Stream structured events: task queued, started, tool requested, evidence added, output submitted, review failed, revision requested, approval required, completed.
- Save all artifacts with a content hash and version number.
- Stop or retry a failed task within defined limits; do not silently continue.

### FR-4: Quality and compliance
- Reviewer checks: requirement coverage, contradictions, evidence support, architecture consistency, output schema.
- Red Team checks: risky claims, security/privacy gaps, unsupported assumptions, impossible scope.
- Compliance gate checks required sections, citation presence when research is used, prohibited high-stakes claims, and user constraints.
- High impact actions must enter `WAITING_FOR_HUMAN` rather than proceed autonomously.

### FR-5: Final project blueprint
Produce these sections in Markdown and JSON:
1. Executive summary
2. Problem and user persona
3. Assumptions / unanswered questions
4. Solution and feature set
5. System architecture
6. AI/data design
7. UI/UX design brief
8. Security, safety, and risk register
9. Implementation backlog and milestones
10. Test and evaluation plan
11. Evidence and decision ledger
12. Cost / complexity estimate

## 4. Non-functional requirements

| Category | MVP target |
|---|---|
| Responsiveness | Initial plan visible in under 15 seconds on normal API connectivity |
| Transparency | 100% of task outputs show owner, status, timestamp, model tier, and review state |
| Reliability | Every run is resumable from stored state after a browser refresh or worker restart |
| Cost control | Per-run token and tool budget; hard stop at 100% of budget |
| Safety | No real external writes, deployment, email, or payment actions in MVP |
| Privacy | Minimize uploads, redact secrets, separate users by project ID; do not train on user files |
| Accessibility | Keyboard navigation, visible focus, contrast-aware colors, reduced-motion option |
| Evaluation | Log baseline and NEXUS metrics for each benchmarked run |

## 5. Principal screens

### A. Landing / Mission Start
- Hero: “From idea to AI organization.”
- One large input field and three sample missions.
- Toggle `Fast | Balanced | Deep`.
- Small explanation of what will happen: plan -> organization -> review -> blueprint.

### B. Idea Contract
- Split screen: original idea on left; generated mission contract on right.
- User can edit assumptions, success criteria, constraints, and output type.
- Button: `Compile Organization`.

### C. Living Organization Canvas
- Main expo screen.
- Dynamic organization graph centred on an Orchestrator ring.
- Nodes: role, task count, status, confidence, budget used.
- Animated but non-decorative task handoffs.
- Side rail: selected agent’s mandate, allowed tools, inputs, output contract, and reason selected.

### D. Workstream / Evidence view
- Kanban + timeline toggle.
- Each task card opens a detail drawer: prompt summary, sources, artifact preview, reviewer verdict, revisions, cost.
- Evidence graph view lets the visitor follow an important claim backward.

### E. Approval Gate
- Shows proposed decision, alternatives, evidence, expected cost, risk, and agent recommendation.
- Buttons: `Approve`, `Request changes`, `Reject`, `Stop run`.
- This must use real paused backend state rather than a fake modal.

### F. Final Blueprint
- Polished document view with collapsible sections.
- “Assumption” and “Evidence-backed” badges.
- Export Markdown/PDF later; for MVP export Markdown and JSON.

### G. Counterfactual Lab
- Select a prepared prompt and prior runs.
- Comparison cards: coverage score, evidence coverage, contradiction count, cost, latency, review passes, human rating.
- Important: labels say “measured on this demo task,” not general universal claims.

## 6. Happy path

1. User enters: “Build a multilingual AI exam-prep platform for B.Tech students.”
2. NEXUS creates an Idea Contract and declares assumptions.
3. User selects `Balanced` and clicks Compile Organization.
4. Compiler selects Product Research, AI/RAG, System Architecture, UX, Privacy/Risk, and Reviewer.
5. Research and UX begin in parallel; architecture waits for the product contract; risk reviews data flows.
6. Reviewer flags an unsupported cost claim and a missing consent policy.
7. System sends revisions to Finance/Scope and Privacy/Risk pods.
8. Human approval appears for “Store student learning history?”
9. User approves the recommended privacy-preserving design.
10. NEXUS compiles the final blueprint and enables the trace replay.

## 7. Edge cases

- **Ambiguous idea:** show up to three questions; otherwise make labelled assumptions.
- **Tool failure / rate limit:** retry with exponential backoff, record failure, continue only if dependent tasks are not blocked.
- **Budget exhausted:** stop new work, synthesize from completed artifacts with a visible “budget-limited” warning.
- **Reviewer disagreement:** create a structured conflict record, solicit one targeted tie-breaker, then escalate to the human if unresolved.
- **No credible sources:** explicitly say “insufficient evidence”; do not invent citations.
- **Unsafe/high-stakes use:** present a scoped educational blueprint only and require expert validation for any deployment.

## 8. Out of scope for version one

- Creating a fully deployable app from arbitrary ideas
- Autonomous browsing with unrestricted actions
- Autonomous hiring/firing or real-world decisions
- Multi-tenant enterprise access controls beyond basic project isolation
- Native mobile application

## 9. Demo data

Create three seeded missions so the demo works even with an unreliable internet connection:
- **EdTech:** multilingual exam-prep platform
- **Startup:** surplus-food redistribution marketplace
- **Campus:** AI-assisted student grievance triage (use synthetic policy documents only)

For each, pre-save organization topology, sample artifacts, sources, one review failure, one approval gate, and final blueprint. Mark these runs clearly as “demo replay” rather than live work.
