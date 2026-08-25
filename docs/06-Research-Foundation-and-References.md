# NEXUS — Research Foundation and References (v3, self-contained)

**Verification note:** every claim attributed to sources 1-6 below was checked against the full text of the corresponding PDF on 2026-08-24. Exact figures are quoted as they appear in the papers. See doc 09 for the verification report.

## 1. Research positioning
NEXUS is a **research-inspired systems prototype**, not a reproduction of any one paper.

> For complex idea-to-blueprint tasks, adaptive role selection plus explicit governance, review, policy checks, evidence lineage, verifiable event integrity, cross-run memory, and human approval may make agentic workflows more auditable and useful than an unstructured multi-agent swarm.

The word **may** matters. Test the hypothesis; don't announce it as proven.

## 2. What comes from OrgAgent (Wang et al., 2026)
Governance/execution/compliance three-layer split; `DIRECT`/`LIGHT MAS`/`FULL MAS` execution depth; `STRICT`/`BALANCE`/`NOCAP`/`AUTO` resource policies. Evaluated on MuSR, MuSiQue, and SQuAD 2.0 across three models. Reports hierarchical coordination often outperforming flat coordination with lower token use — the headline result: for GPT-OSS-120B, hierarchy improves over flat MAS by up to **+102.73% F1 while using 74.52% fewer tokens on SQuAD 2.0** — while explicitly noting **mixed results on MuSR** (hierarchy slightly helps GPT-5mini but is -13.77% for GPT-OSS-120B versus flat) and the risk of fixed discussion limits leaving poor claims uncorrected. **Cite the mixed result too — it's what makes the citation credible rather than cherry-picked.**

## 3. What comes from TB-CSPN (Borghoff et al., 2025)
*"An organizational theory for multi-agent interactions integrating human agents, LLMs, and specialized AI"*, Discover Computing 28:138. Formalizes **threshold-based dynamic group formation**: agents join a working group only when a topic's relevance crosses their individual interest threshold, and membership adjusts as the topic evolves — modeled via Topic-Based Communication-Space Petri Nets. The framework's roles are **human agents** (guide overall system objectives), **consultant agents / LLMs** (semantic analysis and mediation), and **specialized agents / narrow AIs** (focused domain tasks). This is the closest available academic grounding for NEXUS's "the team grows or shrinks based on task complexity" claim — cite it specifically when explaining *why* dynamic team formation isn't just a UI gimmick but has a formal basis in prior MAS coordination theory.

**Use with care**: TB-CSPN is a formal/theoretical paper with illustrative scenarios (emergency response, healthcare research, financial decision-making), not a large empirical benchmark study like OrgAgent. Cite it for the *concept* of threshold-driven group formation, not for performance numbers.

## 4. What comes from SAP's organizational-memory paper (Kirchdorfer et al., 2026)
*"Organizational Memory for Agentic Business Process Execution"* (SAP Signavio). Introduces **process atoms** — self-contained units with the attributes **Name, Source, Content (Applicability + Action + Purpose), and Tags** grounded in an Enterprise Domain Model — as the right decomposition granularity for agent-consumable organizational knowledge, retrieved via **tag-filter then semantic/LLM-based selection within the filtered set** rather than plain document-chunk RAG. Their proof-of-concept (procurement-compliance scenario, 10 scenarios, 4 runs each, two LLMs) measured Policy Compliance Rate: **base agent (no memory) 30% for both models; plain RAG 70% (GPT-4.1) / 80% (Sonnet 4.5); atom-based organizational memory 88% (GPT-4.1) / 95% (Sonnet 4.5)**. MNEMOS is a direct, credited adaptation of this architecture to NEXUS's cross-run memory need (doc 03 §7 keeps the attribute structure and specializes Source to `source_run_id`).

**Use with care**: this is a small-scale proof-of-concept (10 scenarios, synthetic documents, two LLMs) explicitly labeled preliminary by its own authors — cite the numbers as "their proof-of-concept measured," not as an established industry benchmark.

## 5. What comes from Liu (2026) — the counterweight that shapes the design
*"The Organizational Behavior of Agentic AI: Context, Boundaries, and Collective Intelligence in Human-Agent Workflows"* (arXiv:2606.30986v1). Argues agentic collectives are a *partial* organizational analogue: their patterns are sustained not by motivation or trust but by **context architecture** — prompts, memory, traces, schemas, tools, validators, permissions — and introduces **contextual transaction cost (CTC)**: the cost of moving context across boundaries determines when collective intelligence is productive versus wasteful. Empirical material includes an 8,000-task simulation across seven organization forms (56,000 task-organization observations) plus trace-instrumented real LLM runs. Headline findings from the simulation:
- **Adaptive meta-organization** (selecting structure per task) and **blackboard memory** (shared durable state instead of message-passing) are the strongest forms: adaptive improves collective efficiency by **89.24% relative to the single expert** (+11.43 efficiency, +14.00 quality, +23.24pp success in task-fixed-effects estimates); blackboard memory is **139.44% more efficient than the best human-imitation form**.
- **Naive hierarchy and committee forms perform *worse* than a single expert** in the simulation (hierarchy: -7.92 efficiency, -11.49 quality; committee debate: -42.10 quality) when their handoffs and deliberation create more context cost than collective gain.

**What NEXUS takes from this:** the two design choices that keep hierarchy from becoming a cost — (1) task-contingent organization (the Compiler picks team and depth per mission, not a fixed org chart) and (2) shared durable state (versioned structured artifacts in one store instead of chat handoffs), plus inspectable traces (VERITAS) as the auditability mechanism the paper says agent collectives depend on. This paper is also the prepared answer to "doesn't hierarchy add overhead?" (doc 05 §8).

**Use with care**: the headline numbers come from a synthetic simulation with task fixed effects, plus limited real-LLM traces — cite them as "in his simulation study," not as universal empirical law. The paper and OrgAgent genuinely disagree about naive hierarchy; present that disagreement honestly and position the Counterfactual Lab as NEXUS's way of testing rather than picking sides.

## 6. What comes from Jirásek (2025)
*"AI Agents: Redefining Organizing"* (SSRN 5186559, viewpoint article). Argues that once AI agents approach genuine autonomy, treating AI as mere technology in organization design becomes unsustainable; the fundamental problems of organizing — **division of labor and integration of effort** — remain relevant for agent collectives, which will also exhibit **bounded rationality** and incur **high marginal costs** per task. Cite it as theoretical motivation for two NEXUS features: runtime organization *compilation* (division of labor decided per mission, not hardcoded) and per-run budgeting (integration of effort under real marginal cost). It is a perspective piece — cite it as such, no performance claims.

## 7. Why observability is central
NEXUS records agent invocation, task ownership, tool use, artifact version, policy decision, cost, review verdict, approval — OpenTelemetry-style traces, private content kept out of external telemetry by default. VERITAS extends this by chaining the event log for tamper-evidence, which none of the source papers implement — it's NEXUS's own contribution, credited as such, not attributed to any paper.

## 8. Why human approval remains central
Approval gates for sensitive-data design, unresolved high-severity conflicts, budget overrides, any future write-capable integration. MVP prohibits external writes entirely.

## 9. Interoperability choices
- **MCP**: controlled tool/context adapter, permissions applied before invocation.
- **A2A**: roadmap feature for invoking separately-hosted agents, not MVP-required.
- **Provider abstraction**: models replaceable; task contracts/policies/artifacts/evaluation are the durable core.
- **Cursor Origin** (beta, Aug 2026): a Git-compatible code-hosting platform for agent-heavy PR volumes — relevant to *how you build NEXUS*, not to NEXUS's runtime architecture. See doc 07 §6.

## 10. Full source list

1. Wang, Y. et al. (2026). *OrgAgent: Organize Your Multi-Agent System like a Company.* arXiv:2604.01020v1.
2. Borghoff, U.M., Bottoni, P., Pareschi, R. (2025). *An organizational theory for multi-agent interactions integrating human agents, LLMs, and specialized AI.* Discover Computing, 28:138.
3. Kirchdorfer, L. et al. (2026). *Organizational Memory for Agentic Business Process Execution.* SAP Signavio, arXiv:2607.03228v1.
4. Liu, C. (2026). *The Organizational Behavior of Agentic AI: Context, Boundaries, and Collective Intelligence in Human-Agent Workflows.* University College London, arXiv:2606.30986v1.
5. Jirásek, M. (2025). *AI Agents: Redefining Organizing.* SSRN 5186559.
6. McKinsey (2025, published September). *The agentic organization: Contours of the next paradigm for the AI era.* People & Organizational Performance Practice.
7. Google ADK documentation — Workflows and Multi-agent systems.
8. Google Developers Blog (2026). *Build long-running AI agents that pause, resume, and never lose context with ADK.*
9. LangGraph documentation — Durable execution; Human-in-the-loop.
10. Model Context Protocol specification — Authorization.
11. Google Developers Blog (2025). *Announcing the Agent2Agent Protocol.*
12. OpenTelemetry Blog (2025). *AI Agent Observability.*
13. Google Antigravity — antigravity.google.
14. Cursor — cursor.com; Cursor Origin launch coverage (Aug 2026).
15. Hugging Face — Function Calling documentation.

## 11. Citation rules for the presentation
- Cite OrgAgent for its governance/execution/compliance architecture and its reported results — including the tasks where hierarchy *didn't* clearly win (MuSR).
- Cite TB-CSPN specifically for the theoretical basis of threshold-driven dynamic team formation, not for performance claims.
- Cite the SAP paper specifically for the process-atom memory design and its proof-of-concept numbers, labeled preliminary.
- Cite Liu for contextual transaction cost and the simulation evidence that adaptive + shared-state forms beat naive imitation forms — labeled as simulation results — and use it to explain why NEXUS is adaptive and artifact-based rather than a fixed org chart.
- Cite Jirásek and McKinsey as industry/theoretical perspectives, not peer-reviewed empirical evidence.
- Cite ADK/LangGraph/MCP/A2A/Cursor documentation for implementation capability, not performance claims.
- Clearly label the Organization Compiler, VERITAS, MNEMOS, and the full UI/evaluation plan as the team's own contribution — none of the source papers implement this exact combination.
- Never cite a source that hasn't been read or a claim that can't be verified.

## 12. About the Springer URL
The TB-CSPN paper (item 2) *is* the Springer/Discover Computing article referenced in earlier research notes as unretrievable — it has since been retrieved and read in full (s10791-025-09667-2.pdf). Verified as the same article on 2026-08-24.
