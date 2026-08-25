# NEXUS — Review Findings and Pre-Build Checklist (doc 09, new in v3)

This document records the independent review of the research papers and the v1/v2 plan documents performed on 2026-08-24, what was changed as a result, and the checklist to clear before starting Phase 0.

## 1. Research verification report (all six PDFs read in full via text extraction)

| Source | Verdict | Verified details |
|---|---|---|
| OrgAgent (arXiv:2604.01020v1) | ✅ Cited accurately | Governance/execution/compliance layers; DIRECT/LIGHT MAS/FULL MAS; STRICT/BALANCE/NOCAP/AUTO; +102.73% F1 / -74.52% tokens on SQuAD 2.0 for GPT-OSS-120B; MuSR results genuinely mixed (-13.77% for GPT-OSS-120B vs flat) — the v2 docs already cited the mixed result, which is good practice |
| TB-CSPN (s10791-025-09667-2, Discover Computing 28:138) | ✅ Cited accurately, one naming fix | Threshold-based topic group formation via colored Petri nets confirmed. ⚠️ The paper's roles are *human agents / consultant agents (LLMs)) / specialized agents (narrow AI)* — v2 said "Supervisor/Consultant/Worker". Fixed in doc 06 §3 |
| SAP organizational memory (arXiv:2607.03228v1) | ✅ Cited accurately | Process-atom attributes (Name, Source, Content = Applicability+Action+Purpose, Tags) confirmed; hybrid tag-filter + semantic retrieval confirmed; PCR numbers confirmed exactly: base 30%/30%, RAG 70%/80%, memory 88% (GPT-4.1) / 95% (Sonnet 4.5), 10 scenarios, 4 runs each, labeled preliminary by authors |
| McKinsey agentic organization | ✅ Confirmed | September 2025, People & Organ Performance Practice; "agentic organization" framing as described |
| Liu (arXiv:2606.30986v1) | ⚠️ Was in the research pile but **never cited** — now integrated | UCL, July 2026. Contextual transaction cost theory; 8,000-task simulation, 7 org forms, 56,000 observations: adaptive meta-org +89.24% efficiency vs single expert (+11.43 efficiency / +14.00 quality / +23.24pp success, task fixed effects); blackboard memory +139.44% vs best imitation form; naive hierarchy (-7.92 eff / -11.49 qual) and committee debate (-42.10 qual) *underperform* the single expert in the simulation. Now doc 06 §5, shapes doc 00 §4 positioning and doc 05 §8 Q&A |
| Jirásek (SSRN 5186559) | ⚠️ Was in the research pile but **never cited** — now integrated | "AI Agents: Redefining Organizing", viewpoint article; division of labor + integration of effort remain fundamental for agent collectives; bounded rationality; high marginal cost per task. Now doc 06 §6, motivates runtime compilation + budgeting |

## 2. Problems found in the v1/v2 document set (all fixed in v3)

1. **Dangling references (critical for an agent build).** The v2 docs are delta documents: they repeatedly say "unchanged from the original NEXUS doc" for content that was never restated (US-01–08, FR-1–5, policies P-01–P-08, screens A–G, the agent catalog, the P0 backlog, the demo script, the follow-up prompts). Doc 08's Step 0 said to put only files 00-08 into `/docs` — an agent following that instruction would hit a dozen dead references. **Fix:** v3 is fully merged and self-contained; nothing outside `/docs` is referenced.
2. **Two uncited research papers.** Liu 2026 and Jirásek 2025 were downloaded but never woven into doc 06. Liu's is arguably the most useful paper in the pile for the pitch (see §1). **Fixed** in docs 00, 05, 06.
3. **TB-CSPN role naming** — "Supervisor/Consultant/Worker" did not match the paper. **Fixed** in doc 06 §3.
4. **VERITAS canonicalization hazard.** The reference implementation hashed `json.dumps(payload, sort_keys=True)` but verification would have re-serialized payloads read back from the DB — JSON round-trips are not byte-stable, so an untampered chain could verify as broken. **Fix:** store `payload_canonical` (the exact hashed string) on the Event row; verify against it (docs 02 §6, 03 §6, master prompt).
5. **VERITAS non-transactional write hazard.** An event written without its hash (crash mid-write) corrupts the chain. **Fix:** event + prev_hash + hash in one transaction, single writer per run (doc 02 §6).
6. **VERITAS honesty gap in the pitch.** No prepared answer for "can't someone with DB access recompute the whole chain?" **Fix:** honest Q&A added (doc 05 §8) + periodic head-anchoring listed as P2 roadmap work (doc 05 §3), not faked in MVP.
7. **MNEMOS embedding model unspecified.** `semantic_rerank` had no defined embedding provider, and pgvector doesn't exist in the SQLite dev path. **Fix:** embedding decision fixed in doc 02 §7 (provider-family embeddings server-side; local sentence-transformers fallback for mock mode; vectors stored on the row; in-Python cosine rerank — fine for 5-50 atoms).
8. **MNEMOS tag extraction unspecified.** **Fix:** deterministic keyword rules first, optional fast-tier LLM confirm (doc 02 §7) — keeps demo behavior reproducible.
9. **Demo replay was a Week-6 afterthought.** It is the expo safety net *and* the Time Travel Replay feature. **Fix:** moved to Week 3 / Phase 3, replaying recorded runs through the same SSE pipeline (docs 02 §12, 05 §2, master prompt).
10. **Flat Swarm baseline scope risk.** The comparison's second condition is a second system. **Fix:** two-day timebox with an explicit honest-drop rule (doc 05 §6).
11. **No repo-level agent context or CI.** **Fix:** `AGENTS.md` added (repo root) + GitHub Actions CI step added to doc 08 Step 0.

## 3. What was deliberately NOT changed

- Product scope: no new subsystems, no new acronym beyond VERITAS/MNEMOS. The review agrees with doc 08 §5 — scope creep is now the primary risk.
- The six-week roadmap shape, the vertical-slice strategy, the demo choreography, the honest-positioning language, and the "don't overbuild" rules.
- The toolchain division of labor (Antigravity orchestrates, Claude Code implements, Cursor polishes UI, GitHub hosts).

## 4. Pre-build checklist (clear every box before Phase 0)

**Research & story**
- [ ] All six papers' PDFs are in the team's shared drive; doc 06 §10 source list matches them
- [ ] Every team member can say the one-line positioning (doc 00 §6) and the OrgAgent-vs-Liu tension (doc 06 §5) in their own words
- [ ] Judge Q&A in doc 05 §8 rehearsed by all four members, not just the presenter

**Repo & tooling**
- [ ] GitHub repo `nexus-organization-os` created; `/docs` contains exactly files 00-09; `AGENTS.md` at root; no v1 underscore files
- [ ] CI workflow runs pytest + vitest + typechecks on push
- [ ] Antigravity installed; MCP servers (Figma, GitHub read-only, Playwright, Context7) configured; Claude Code extension signed in
- [ ] `.env.example` exists with placeholder names only; real keys in local `.env` never committed

**API keys & budget**
- [ ] Primary reasoning provider key (Claude or GPT-4.1-class) working
- [ ] Qwen 3.8-Max key (optional, for the Settings toggle demo) — test the OpenAI-compatible base-URL swap in isolation before wiring into the router
- [ ] Embedding provider decided per doc 02 §7 and key available (or local sentence-transformers chosen)
- [ ] Rehearsal budget rule agreed: mock/fast tier for rehearsals, reasoning tier for final rehearsal + show only

**Design**
- [ ] Figma variables + component library built from doc 04 §6-7, each component in its glass tier
- [ ] Verify + Memory panel directions generated in Stitch, chosen direction rebuilt in Figma
- [ ] Figma Dev Mode MCP can read the file from Antigravity

**Demo data**
- [ ] Three seeded missions defined (doc 01 §9)
- [ ] 5-8 MNEMOS atoms pre-seeded from a dry run of the EdTech mission
- [ ] 45-second backup video script drafted (recorded in Week 6)

## 5. Expo additions worth stealing (optional, low cost)

- **Cold-open option:** if the judges look time-pressed, invert the demo — open on the finished blueprint, click Verify ("this entire run is provably untampered"), then say "let me show you the 90 seconds that produced it" and run the choreography from doc 05 §7. Rehearse both orders.
- **One-slide research map:** a single slide with the six sources arranged as: OrgAgent (hierarchy helps, sometimes) ↔ Liu (naive hierarchy hurts; adaptive + shared state wins) → NEXUS (takes the winning elements of both, tests the combination). This visual is the strongest possible answer to "what does your research actually say?"
- **Cost transparency card:** show the actual token cost of the live demo run in the Counterfactual Lab — a real number beats a claim, and it makes the Qwen cost-story concrete.

## 6. Design direction change log

**v3.1 (2026-08-24): Liquid Glass pivot.** After the review, the design system was re-specified from "dark glass surfaces" to a full iOS 26-style **Liquid Glass** language — doc 04 rewritten: three glass tiers (thin/regular/thick) with exact CSS recipes, an aurora ambient background the glass refracts, specular edges, concentric corners, fluid morph motion, and rewritten Stitch prompts. Honest risks accepted with mitigations:
- **Performance:** `backdrop-filter` is GPU-expensive → hard budget in doc 04 §9 (max 3 stacked layers, blur caps, transform/opacity-only animation, a downgrade ladder, and an expo-laptop frame audit before Week 6). A janky glass UI loses more points than it wins.
- **Readability:** pure transparency fails contrast over busy backgrounds → the `glass-thick` tinted readability floor for all long-form text, plus the worst-case-contrast rule in doc 04 §10.
- **Projector washout:** dark glass can die under expo lighting → handoff checklist (doc 04 §13) now includes an expo-lighting check with fallback to the laptop screen.

No functional scope was added by this change — it replaces the visual language only. Docs 02, 05, and 07 were updated to reference the new material system.
