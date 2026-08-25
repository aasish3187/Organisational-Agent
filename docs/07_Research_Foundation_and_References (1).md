# NEXUS Research Foundation and Reference Notes

## 1. Research positioning

NEXUS is a **research-inspired systems prototype**, not a reproduction of any one paper. It takes the organizational insight from OrgAgent and turns it into a buildable product hypothesis:

> For complex idea-to-blueprint tasks, adaptive role selection plus explicit governance, review, policy checks, evidence lineage, and human approval may make agentic workflows more auditable and useful than an unstructured multi-agent swarm.

The word **may** matters. The project must test the hypothesis, not announce it as proven before evaluation.

## 2. What comes from OrgAgent

The OrgAgent paper describes company-style hierarchical multi-agent coordination with three layers:

- **Governance:** CEO, CTO, COO planning, routing, and resource allocation
- **Execution:** drafting, reviewing, and targeted specialist support
- **Compliance:** final answer generation under constraints and structural validation

It also distinguishes execution depth (`DIRECT`, `LIGHT MAS`, `FULL MAS`) and resource policies (`STRICT`, `BALANCE`, `NOCAP`, `AUTO`). Its evaluation reports that hierarchical coordination often performed better than flat coordination with lower token use on its selected reasoning benchmarks, while also acknowledging mixed results on some tasks and the risk that fixed discussion limits can leave poor claims uncorrected.

### NEXUS extension

| OrgAgent concept | NEXUS implementation |
|---|---|
| Governance layer | Mission Interpreter, CTO/COO policy planning, Organization Compiler |
| Execution layer | Dynamic skill-based pods producing typed artifacts |
| Compliance layer | schema validator, evidence check, policy gate |
| Skill worker pool | role manifests plus permitted tools and output contracts |
| AUTO policy | rules-plus-LLM team selection under explicit budgets |
| Review/revision | reviewer, red team, conflict record, max revision policy |
| Benchmark metrics | coverage, evidence, contradiction, cost, latency, human trust |
| Not present in paper | project artifact lineage, ABAC, approval interrupts, visual time-travel replay |

## 3. Why observability is central

An agent system is a distributed workflow, not merely a chat window. NEXUS must record agent invocation, task ownership, tool use, artifact version, policy decision, token/cost estimate, review verdict, and approval. This enables debugging, comparison, and accountable explanation.

Use OpenTelemetry-style traces where possible. Keep private prompt/document contents out of external telemetry by default; store content references or redacted excerpts instead.

## 4. Why human approval remains central

Agentic systems should not hide consequential assumptions or execute external actions independently. NEXUS uses approval gates for sensitive data design, unresolved high-severity conflicts, budget overrides, and any future write-capable integration. The expo MVP prohibits external writes altogether.

## 5. Interoperability choices

- **MCP:** useful for standardizing agent access to tools and context. NEXUS treats MCP servers as controlled tool adapters and applies permissions before invocation.
- **A2A:** useful later when NEXUS needs to invoke separately hosted, independently managed agents. It is a roadmap feature, not necessary for the first expo build.
- **Provider abstraction:** prevents the organization design from being locked to one LLM vendor. Models are replaceable; task contracts, policies, artifacts, and evaluation are the durable product core.

## 6. Selected sources

1. Wang, Y. et al. (2026). *OrgAgent: Organize Your Multi-Agent System like a Company.* arXiv:2604.01020v1. https://arxiv.org/html/2604.01020v1
2. McKinsey (2026). *The agentic organization: A new operating model for AI.* https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-agentic-organization-contours-of-the-next-paradigm-for-the-ai-era
3. Google ADK documentation. *Workflows: multi-agent, multi-node applications.* https://adk.dev/workflows/
4. Google ADK documentation. *Multi-agent systems.* https://adk.dev/agents/multi-agents/
5. Google Developers Blog (2026). *Build long-running AI agents that pause, resume, and never lose context with ADK.* https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/
6. LangGraph documentation. *Durable execution.* https://docs.langchain.com/oss/javascript/durable-execution
7. LangGraph documentation. *Human-in-the-loop.* https://docs.langchain.com/oss/python/langchain/human-in-the-loop
8. Model Context Protocol specification. *Authorization.* https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
9. Google Developers Blog (2025). *Announcing the Agent2Agent Protocol.* https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
10. OpenTelemetry Blog (2025). *AI Agent Observability.* https://opentelemetry.io/blog/2025/ai-agent-observability/
11. Google Antigravity. https://antigravity.google/
12. Hugging Face. *Function Calling.* https://huggingface.co/docs/hugs/en/guides/function-calling

## 7. Citation rules for your presentation

- Cite OrgAgent when discussing its reported experimental results and its governance/execution/compliance architecture.
- Cite McKinsey only as an industry perspective, not as peer-reviewed evidence.
- Cite ADK/LangGraph/MCP/A2A documentation for implementation capabilities, not for performance claims.
- Clearly label NEXUS’s own UI, Organization Compiler, and evaluation plan as your team’s proposed contribution.
- Never cite sources that you have not read or whose claim you cannot verify.

## 8. About the Springer URL

The requested Springer chapter was not retrievable during initial research. Before adding it to slides, access the abstract/full text through your university library and capture its precise title, authors, publication year, and the claim you want it to support. Do not cite it merely because it appears in a collection of links.
