# NEXUS Organization OS — Unified Project Overview
### v3: self-contained merged spec (v1 NEXUS + v2 VERITAS/MNEMOS additions + verified research citations)

**Tagline:** *Give us an idea. Watch an AI organization form, reason, verify, remember, and deliver.*

---

## 1. What this document set is

This is the single source of truth for building NEXUS. Earlier versions existed as two generations of documents (v1 NEXUS drafts and v2 delta documents that said "unchanged from the original"). That split created dangling references an AI coding agent could not resolve. **This v3 set is fully merged and self-contained: no document refers to any document outside this folder.** Every research citation in doc 06 was verified against the full text of the source PDFs on 2026-08-24 (see doc 09 for the verification report), and two additional papers that were in the research pile but never cited (Liu 2026 on the organizational behavior of agentic AI; Jirásek 2025 on AI agents redefining organizing) are now integrated where they genuinely strengthen the design story.

## 2. Project identity

**Name:** NEXUS Organization OS
**One-line description:** NEXUS converts a rough human idea into a verified project blueprint by dynamically creating a governed team of AI agents, assigning work by skill, checking evidence and conflicts, and presenting every decision as an inspectable organizational workflow.

## 3. The two additive subsystems

### VERITAS — event-log integrity chain
NEXUS hashes individual artifacts (`content_hash`) and logs an append-only `Event` table. VERITAS is the piece between those two: it **chains** every event's hash to the previous event's hash (`hash(prev_hash + canonical_payload + timestamp)`), so the *entire run's history* becomes tamper-evident, not just individual artifacts. A `GET /runs/{id}/verify` endpoint recomputes the chain on demand.

**Why it's worth adding**: it turns "we log everything" (true of most systems) into "we can *prove* nothing in this log was edited after the fact" (true of almost none). Implementation cost is low, demo value is high.

**Honest scope**: a hash chain deters and detects after-the-fact editing of stored records; it does not stop an attacker with full database write access from recomputing the whole chain. If judges ask, the answer is: chain heads can be periodically anchored (e.g., committed to the repo or signed) — mentioned as roadmap work, not faked in the MVP. See doc 05 §8 for the prepared Q&A.

**Where it lives**: a thin service (`telemetry/veritas.py`) wrapping the existing telemetry adapter; every emitted event gets chained in the same database transaction that writes the event. UI: a dedicated Verify action in the Decision Ledger rail (doc 04).

### MNEMOS — cross-run organizational memory
NEXUS's Evidence Graph and Decision Ledger explain *this run*. Nothing in the base design lets *insight from a past run* inform a *new* one. MNEMOS closes that gap using the process-atom model from the SAP organizational-memory paper (Kirchdorfer et al., 2026): each finished run is decomposed into 3-6 self-contained **process atoms** (`name`, `source_run_id`, `applicability`, `action`, `purpose`, `tags`), stored in a tag-filterable table. New runs query MNEMOS first — tag-filter, then semantic rerank on the filtered set (SAP's hybrid pattern; their proof-of-concept measured 88-95% policy compliance vs 70-80% for plain RAG and 30% for no memory) — and the Organization Compiler receives matching atoms as prior context.

**Why it's worth adding**: it's the answer to "why would anyone use this twice?" — the second EdTech-blueprint run this system ever does should visibly start smarter than the first, because it recognizes it has seen something like this before. A concrete, demoable claim, not a vague "it learns" gesture.

**Where it lives**: a new service (`services/mnemos.py`) called at Organization Compiler time (retrieval) and at run-finalization time (write). New DB table `ProcessAtom`. UI: a Memory panel showing atoms retrieved at run start and atoms written at run end (doc 04).

## 4. Research positioning in one paragraph (new in v3)

Two of the source papers point in different directions, and NEXUS is designed to sit honestly between them. OrgAgent (Wang et al., 2026) reports that company-style hierarchical coordination often beats flat coordination on QA-style benchmarks with lower token use. Liu (2026), in an 8,000-task simulation study, finds the opposite for *naive* hierarchy — hierarchy and committee forms underperform a single expert when their handoffs create more context cost than collective gain — while **adaptive meta-organization** (choosing structure per task) and **blackboard memory** (shared durable state instead of message-passing) are the strongest forms measured. NEXUS takes the winning elements from both: OrgAgent's separated governance/execution/assurance layers and review discipline, combined with Liu's two winners — task-contingent organization (the Organization Compiler picks the team and depth per mission) and shared durable state (versioned structured artifacts in one store, not chat handoffs). The Counterfactual Lab exists precisely to test this combination rather than assume it. See doc 06 §5 for the full citation logic.

## 5. What stays exactly as designed
The Organization Compiler, DAG-based task execution, governance/execution/assurance layers, policy engine (P-01–P-09) and ABAC, approval-gate interrupt/resume flow, Counterfactual Lab, the core screens, and the six-week roadmap — carried forward in docs 01-05 with VERITAS and MNEMOS woven in at the specific points where they attach.

## 6. Honest positioning (say this, not more)
> "NEXUS is an operating system for AI organizations. A user gives a raw idea; our Organization Compiler identifies the skills, creates a temporary governed team, delegates only the needed work, checks evidence and conflicts, and returns a verified blueprint with a replayable, tamper-evident explanation of every decision — and each run makes the next one a little smarter."

Do not say "the greatest agent system in the world." Say what's true: a research-grounded prototype testing whether adaptive organization + governance + verifiable trust + cross-run memory improves blueprint quality and trust versus a single-agent baseline — and show the measurement, not just the claim.

## 7. Document index
| # | File | Purpose |
|---|---|---|
| 00 | Unified Project Overview (this file) | Identity, positioning, what merged from where |
| 01 | Product Requirements and User Flows | Every screen, user story, edge case |
| 02 | System Architecture and Technology | Stack, modules, VERITAS/MNEMOS detail, build order |
| 03 | Agent Contracts, Policies, and Data Model | Agent catalog, schemas, policies P-01–P-09, DB, API |
| 04 | UI/UX, Figma, and Stitch Design System | Tokens, components, screens, motion, Stitch prompts |
| 05 | Implementation Roadmap, Quality, and Expo Demo | 6-week plan, testing, evaluation, demo script, Q&A |
| 06 | Research Foundation and References | All 15 sources, verified claims, citation rules |
| 07 | Multi-Tool Build Guide and Master Prompts | Antigravity/Claude Code/Cursor workflow + all prompts |
| 08 | Master Index, Model Options, Extensions, Execution | Qwen slot, extensions, step-by-step build sequence |
| 09 | Review Findings and Pre-Build Checklist | What was verified, what changed, go/no-go checklist |
