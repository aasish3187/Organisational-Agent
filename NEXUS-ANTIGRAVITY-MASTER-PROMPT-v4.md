# NEXUS ORGANIZATION OS — ANTIGRAVITY MASTER BUILD PROMPT v4.0
### Industry-Grade · Expo-Ready · Visually Stunning · Fully Functional

---

> **HOW TO USE THIS FILE**
> Paste this entire document into Antigravity's Manager View as your session-opening prompt.
> Say "Phase 0 only" after pasting. Approve each phase explicitly before proceeding.
> Priority: `03 > 02 > 01 > 04 > 05`. Never start the next phase without explicit human sign-off.

---

## SECTION 0 — WHAT YOU ARE BUILDING

**NEXUS Organization OS** turns a one-sentence raw idea into a governed, verified, explainable project blueprint through a multi-agent AI organization — and makes every decision it takes visible, inspectable, and provably untampered.

**The three-sentence pitch (memorize it):**
> A user types a raw idea. NEXUS dynamically assembles a governed team of AI specialists, assigns work by skill, chains every event for tamper-evidence, and returns a verified blueprint with replayable proof of every decision — and each run makes the next one smarter by learning from what worked.

**What makes this stand out at a recruiter/industry demo:**
1. **Not a chatbot** — a full operating system for AI organizations, with governance, evidence, and memory layers
2. **Live 3D agent network** — judges can see the organization form, nodes pulse, data packets flow in real time
3. **VERITAS chain** — one click proves the run was never tampered with; instant "wow" moment
4. **MNEMOS memory** — second run on a related idea visibly starts smarter; demoable cross-run learning
5. **Honest evaluation** — a Counterfactual Lab that shows real metrics vs. baselines, not just claims
6. **Production-grade code** — typed end-to-end, tested, Docker-composable, CI-gated

---

## SECTION 1 — COMPLETE TECHNOLOGY STACK

### Backend
```
Runtime:        Python 3.12
Framework:      FastAPI 0.115+ with async support
ORM:            SQLAlchemy 2.0 async (with Alembic migrations)
Database:       PostgreSQL 16 (production) + SQLite (dev/mock)
Cache/Pub-Sub:  Redis 7 (for SSE fan-out and rate limiting)
Agent Runtime:  Google ADK (google-adk) — Workflows + Multi-agent
Validation:     Pydantic v2 (all models and agent output schemas)
Embeddings:     sentence-transformers (all-MiniLM-L6-v2) — local, no external call
Vector ops:     numpy cosine similarity (in-Python, no pgvector needed for 5-50 atoms)
Hashing:        hashlib SHA-256 (VERITAS chain)
Serialization:  json.dumps(sort_keys=True, separators=(",",":")) — deterministic canonical
Testing:        pytest + pytest-asyncio + httpx (async test client)
Type checking:  mypy strict
Linting:        ruff
```

### Frontend
```
Framework:      Next.js 15 (App Router, TypeScript strict)
Styling:        Tailwind CSS 4 + CSS custom properties (design tokens)
State:          Zustand 5 (global) + TanStack Query v5 (server state)
Animation:      Framer Motion 12 + custom CSS keyframes
3D/Canvas:      React Flow 12 (agent network graph) + custom WebGL particle layer
Charts:         Recharts (evaluation metrics) + D3 (evidence graph)
Icons:          Lucide React
Forms:          React Hook Form + Zod
HTTP:           Axios (typed) + native fetch (SSE)
Testing:        Vitest + Playwright (E2E)
Type checking:  TypeScript 5.5 strict
Linting:        ESLint + Prettier
```

### Infrastructure
```
Containerization: Docker Compose (web + api + db + redis)
CI:               GitHub Actions (pytest + vitest + typecheck on every push)
Secrets:          .env files only — never committed, .env.example with placeholders
Dev tooling:      Antigravity (orchestrator) + Claude Code (impl) + Cursor (UI polish)
MCP servers:      Figma Dev Mode, GitHub read-only, Playwright, Context7
```

### Model Router
```
Primary reasoning tier:   Claude claude-sonnet-4-6 (default) OR GPT-4.1 (swap via env)
Fast/cheap tier:          claude-haiku-4-5-20251001 OR GPT-4o-mini (for mock mode)
Optional alt reasoning:   Qwen 3.8-Max via OpenAI-compatible base URL (demo Settings toggle)
Local fallback:           sentence-transformers CPU (embeddings only, no LLM fallback needed for MVP)
Mock mode:                DEMO_REPLAY=true → returns seeded JSON, no API calls, labeled in UI
```

---

## SECTION 2 — MONOREPO STRUCTURE

```
nexus-organization-os/
├── AGENTS.md                    ← AI agent instructions (repo root, do not move)
├── docker-compose.yml
├── .env.example                 ← placeholder names only, no real values
├── .github/
│   └── workflows/
│       └── ci.yml               ← pytest + vitest + typecheck on push
├── docs/                        ← files 00-09 (the spec) — read-only for agents
├── apps/
│   ├── api/                     ← FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── core/
│   │   │   │   ├── config.py         ← settings from env
│   │   │   │   ├── database.py       ← async SQLAlchemy engine
│   │   │   │   └── redis_client.py
│   │   │   ├── models/              ← SQLAlchemy ORM models
│   │   │   │   ├── project.py
│   │   │   │   ├── run.py
│   │   │   │   ├── event.py         ← VERITAS fields here
│   │   │   │   ├── artifact.py
│   │   │   │   ├── process_atom.py  ← MNEMOS
│   │   │   │   └── __init__.py
│   │   │   ├── schemas/             ← Pydantic v2 request/response
│   │   │   │   ├── project.py
│   │   │   │   ├── run.py
│   │   │   │   ├── artifact.py
│   │   │   │   └── agents/          ← one schema file per agent output type
│   │   │   ├── routers/
│   │   │   │   ├── projects.py
│   │   │   │   ├── runs.py
│   │   │   │   ├── artifacts.py
│   │   │   │   ├── approvals.py
│   │   │   │   ├── events.py        ← SSE endpoint
│   │   │   │   └── experiments.py
│   │   │   ├── services/
│   │   │   │   ├── veritas.py       ← VERITAS chain service
│   │   │   │   ├── mnemos.py        ← MNEMOS memory service
│   │   │   │   ├── model_router.py  ← multi-provider model routing
│   │   │   │   ├── policy_engine.py ← P-01 through P-09
│   │   │   │   └── telemetry.py     ← OpenTelemetry-style event emitter
│   │   │   ├── agents/              ← one file per agent role
│   │   │   │   ├── base.py
│   │   │   │   ├── mission_interpreter.py
│   │   │   │   ├── organization_compiler.py
│   │   │   │   ├── research_analyst.py
│   │   │   │   ├── product_strategist.py
│   │   │   │   ├── ai_architect.py
│   │   │   │   ├── system_architect.py
│   │   │   │   ├── experience_strategist.py
│   │   │   │   ├── privacy_risk.py
│   │   │   │   ├── finance_scope.py
│   │   │   │   ├── consistency_reviewer.py
│   │   │   │   ├── red_team.py
│   │   │   │   ├── solutions_officer.py
│   │   │   │   └── compliance_gate.py
│   │   │   └── runtime/
│   │   │       ├── orchestrator.py  ← DAG execution engine
│   │   │       └── replay.py        ← demo replay pipeline
│   │   ├── alembic/                 ← migrations
│   │   ├── tests/
│   │   └── pyproject.toml
│   └── web/                     ← Next.js frontend
│       ├── src/
│       │   ├── app/             ← App Router pages
│       │   │   ├── page.tsx            ← Landing
│       │   │   ├── projects/[id]/
│       │   │   │   ├── contract/page.tsx
│       │   │   │   ├── canvas/page.tsx  ← Living Org Canvas (3D)
│       │   │   │   └── blueprint/page.tsx
│       │   │   ├── runs/[id]/
│       │   │   │   ├── workstream/page.tsx
│       │   │   │   └── approval/page.tsx
│       │   │   └── lab/page.tsx        ← Counterfactual Lab
│       │   ├── components/
│       │   │   ├── canvas/
│       │   │   │   ├── AgentNetwork.tsx      ← React Flow + particle WebGL overlay
│       │   │   │   ├── AgentNode.tsx         ← custom node with pulse + glow
│       │   │   │   ├── DataPacketEdge.tsx    ← animated bezier edge with particles
│       │   │   │   ├── OrchestatorRing.tsx   ← center ring node
│       │   │   │   └── NodeInspector.tsx     ← right-rail agent detail
│       │   │   ├── veritas/
│       │   │   │   ├── ChainTimeline.tsx     ← hash chain as animated timeline
│       │   │   │   ├── VerifyButton.tsx      ← scan-line animation + verdict chip
│       │   │   │   └── HashBlock.tsx         ← individual event block
│       │   │   ├── mnemos/
│       │   │   │   ├── MemoryPanel.tsx       ← right drawer with atom cards
│       │   │   │   ├── AtomCard.tsx          ← individual process atom
│       │   │   │   └── MemoryConstellation.tsx ← 3D knowledge graph (D3 force)
│       │   │   ├── artifacts/
│       │   │   │   ├── ArtifactDrawer.tsx
│       │   │   │   ├── EvidenceGraph.tsx     ← D3 force-directed claim→evidence
│       │   │   │   └── ClaimBadge.tsx
│       │   │   ├── approval/
│       │   │   │   ├── ApprovalGate.tsx
│       │   │   │   └── RiskMatrix.tsx
│       │   │   ├── blueprint/
│       │   │   │   ├── BlueprintDoc.tsx
│       │   │   │   └── ExportMenu.tsx
│       │   │   ├── lab/
│       │   │   │   ├── ComparisonCard.tsx
│       │   │   │   └── MetricBar.tsx
│       │   │   └── ui/                  ← shared primitives (glass-tier components)
│       │   │       ├── GlassCard.tsx
│       │   │       ├── GlassButton.tsx
│       │   │       ├── StatusBadge.tsx
│       │   │       ├── TokenMeter.tsx
│       │   │       ├── LiveEventFeed.tsx
│       │   │       └── AuroraBg.tsx
│       │   ├── hooks/
│       │   │   ├── useRunEvents.ts       ← SSE hook
│       │   │   ├── useAgentNetwork.ts    ← graph state from events
│       │   │   ├── useVeritas.ts
│       │   │   └── useMnemos.ts
│       │   ├── store/
│       │   │   ├── runStore.ts           ← Zustand run state
│       │   │   └── uiStore.ts
│       │   ├── lib/
│       │   │   ├── api.ts               ← typed axios client
│       │   │   └── cn.ts                ← clsx + tailwind-merge
│       │   └── styles/
│       │       ├── globals.css          ← design tokens + glass tiers
│       │       └── animations.css       ← keyframes
│       ├── tests/               ← Playwright E2E
│       └── package.json
└── README.md
```

---

## SECTION 3 — DATABASE SCHEMA (COMPLETE, IMPLEMENT EXACTLY)

```sql
-- Run this in Phase 0 via Alembic initial migration

CREATE TABLE projects (
    id          TEXT PRIMARY KEY,         -- prj_<nanoid>
    title       TEXT NOT NULL,
    objective   TEXT NOT NULL,
    classification TEXT DEFAULT 'internal',
    owner_session TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE runs (
    id          TEXT PRIMARY KEY,         -- run_<nanoid>
    project_id  TEXT REFERENCES projects(id) ON DELETE CASCADE,
    mode        TEXT NOT NULL DEFAULT 'BALANCED',  -- FAST|BALANCED|DEEP
    status      TEXT NOT NULL DEFAULT 'INITIALIZING',
    -- INITIALIZING|COMPILING|RUNNING|WAITING_FOR_HUMAN|COMPLETED|FAILED|CANCELLED|BUDGET_EXCEEDED
    model_policy TEXT DEFAULT 'AUTO',     -- STRICT|BALANCE|NOCAP|AUTO
    budget_max_tokens  INT DEFAULT 30000,
    budget_max_cost_usd DECIMAL(10,4) DEFAULT 2.0,
    budget_max_minutes  INT DEFAULT 10,
    tokens_used INT DEFAULT 0,
    cost_usd    DECIMAL(10,4) DEFAULT 0,
    is_demo_replay BOOLEAN DEFAULT FALSE,
    started_at  TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE agent_instances (
    id          TEXT PRIMARY KEY,         -- agt_<nanoid>
    run_id      TEXT REFERENCES runs(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,
    parent_id   TEXT REFERENCES agent_instances(id),
    mandate     TEXT,
    permitted_tools TEXT[],              -- array of tool names
    model_tier  TEXT DEFAULT 'reasoning', -- fast|reasoning|local|qwen
    status      TEXT DEFAULT 'PENDING',  -- PENDING|ACTIVE|COMPLETED|FAILED
    token_budget INT DEFAULT 5000,
    tokens_used INT DEFAULT 0,
    started_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE tasks (
    id          TEXT PRIMARY KEY,         -- tsk_<nanoid>
    run_id      TEXT REFERENCES runs(id) ON DELETE CASCADE,
    owner_agent_id TEXT REFERENCES agent_instances(id),
    role        TEXT NOT NULL,
    depends_on  TEXT[],                  -- array of task IDs
    status      TEXT DEFAULT 'QUEUED',   -- QUEUED|RUNNING|REVIEW|REVISION|COMPLETED|FAILED
    output_schema TEXT NOT NULL,
    token_budget INT DEFAULT 5000,
    tokens_used INT DEFAULT 0,
    review_required BOOLEAN DEFAULT FALSE,
    revision_count INT DEFAULT 0,
    risk_level  TEXT DEFAULT 'low',      -- low|medium|high
    queued_at   TIMESTAMPTZ DEFAULT NOW(),
    started_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE artifacts (
    id          TEXT PRIMARY KEY,         -- art_<nanoid>
    task_id     TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    project_id  TEXT REFERENCES projects(id),
    type        TEXT NOT NULL,           -- IdeaContract|EvidenceBrief|ProductSpec|...
    schema_version TEXT DEFAULT '1.0',
    version     INT DEFAULT 1,
    content     JSONB NOT NULL,
    content_hash TEXT NOT NULL,          -- sha256 of canonical JSON
    confidence  DECIMAL(3,2),           -- agent self-assessment 0.0-1.0
    assumptions JSONB,                  -- array of strings
    status      TEXT DEFAULT 'submitted', -- submitted|approved|rejected|superseded
    review_state TEXT,                  -- pending|passed|revision_requested|escalated
    producer_role TEXT,
    producer_model TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence (
    id          TEXT PRIMARY KEY,         -- ev_<nanoid>
    project_id  TEXT REFERENCES projects(id),
    artifact_id TEXT REFERENCES artifacts(id),
    source_url  TEXT,
    source_file TEXT,
    excerpt     TEXT NOT NULL,
    tier        TEXT NOT NULL,           -- primary|official|secondary
    retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claims (
    id          TEXT PRIMARY KEY,         -- clm_<nanoid>
    artifact_id TEXT REFERENCES artifacts(id) ON DELETE CASCADE,
    statement   TEXT NOT NULL,
    support_status TEXT DEFAULT 'unsupported', -- supported|unsupported|disputed
    evidence_ids TEXT[]
);

CREATE TABLE reviews (
    id          TEXT PRIMARY KEY,         -- rev_<nanoid>
    artifact_id TEXT REFERENCES artifacts(id),
    run_id      TEXT REFERENCES runs(id),
    reviewer_role TEXT NOT NULL,
    verdict     TEXT NOT NULL,           -- PASS|REVISE|ESCALATE
    coverage_met JSONB,
    coverage_missing JSONB,
    contradictions JSONB,
    unsupported_claims JSONB,
    revision_tasks JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approvals (
    id          TEXT PRIMARY KEY,         -- apr_<nanoid>
    run_id      TEXT REFERENCES runs(id) ON DELETE CASCADE,
    policy_id   TEXT NOT NULL,           -- P-03, etc.
    gate_type   TEXT NOT NULL,           -- sensitive-data-retention|external-write|...
    proposal    JSONB NOT NULL,
    alternatives JSONB,
    risk_level  TEXT,
    status      TEXT DEFAULT 'PENDING',  -- PENDING|APPROVED|REJECTED|CHANGES_REQUESTED
    human_response TEXT,
    human_notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- *** VERITAS EVENT CHAIN — critical: all 3 hash fields on every row ***
CREATE TABLE events (
    id              TEXT PRIMARY KEY,    -- evt_<nanoid>
    run_id          TEXT REFERENCES runs(id) ON DELETE CASCADE,
    sequence        INT NOT NULL,        -- 0-indexed, monotonically increasing per run
    type            TEXT NOT NULL,
    -- task_queued|task_started|task_completed|tool_called|evidence_added|
    -- artifact_submitted|review_verdict|revision_requested|approval_required|
    -- approval_resolved|run_completed|run_failed|budget_warning|mnemos_retrieved|mnemos_written
    actor           TEXT NOT NULL,       -- agent role or 'system' or 'human'
    actor_id        TEXT,               -- agent_instance_id if applicable
    payload         JSONB NOT NULL,     -- event data (do NOT re-serialize at verify time)
    payload_canonical TEXT NOT NULL,    -- exact string used for hashing (sorted keys, compact)
    prev_hash       TEXT NOT NULL,      -- hash of previous event; genesis uses GENESIS_HASH constant
    hash            TEXT NOT NULL,      -- sha256(prev_hash + payload_canonical + timestamp)
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(run_id, sequence)
);
CREATE INDEX idx_events_run_id ON events(run_id);
CREATE INDEX idx_events_run_sequence ON events(run_id, sequence);

CREATE TABLE metrics (
    id          TEXT PRIMARY KEY,
    run_id      TEXT REFERENCES runs(id),
    agent_id    TEXT REFERENCES agent_instances(id),
    task_id     TEXT REFERENCES tasks(id),
    tokens_in   INT DEFAULT 0,
    tokens_out  INT DEFAULT 0,
    latency_ms  INT,
    cost_usd    DECIMAL(10,6),
    tool_calls  INT DEFAULT 0,
    outcome     TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- *** MNEMOS PROCESS ATOMS ***
CREATE TABLE process_atoms (
    id              TEXT PRIMARY KEY,    -- atom_<nanoid>
    source_run_id   TEXT REFERENCES runs(id),
    name            TEXT NOT NULL,
    applicability   JSONB NOT NULL,      -- {domain, deliverable_type, data_sensitivity, ...}
    action          TEXT NOT NULL,
    purpose         TEXT NOT NULL,
    tags            TEXT[] NOT NULL,
    embedding       FLOAT[],            -- 384-dim sentence-transformers vector
    visibility      TEXT DEFAULT 'shared', -- shared|project (for future multi-tenancy)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_atoms_tags ON process_atoms USING GIN(tags);
```

---

## SECTION 4 — VERITAS IMPLEMENTATION (services/veritas.py)

**Implement exactly as specified. This is the most failure-prone piece.**

```python
import hashlib
import json
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event
from app.models.run import Run

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def canonical(payload: dict) -> str:
    """Deterministic JSON serialization. Store this string; never re-derive at verify time."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)

def compute_hash(prev_hash: str, payload_canonical: str, timestamp: str) -> str:
    raw = f"{prev_hash}{payload_canonical}{timestamp}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

async def emit_event(
    session: AsyncSession,
    run_id: str,
    event_type: str,
    actor: str,
    payload: dict,
    actor_id: Optional[str] = None,
) -> Event:
    """
    Chain-write an event atomically. NEVER call this outside a transaction.
    The event + its hash must land in the DB in a single commit.
    """
    from datetime import datetime, timezone
    from app.core.nanoid import new_id

    # Get last event's hash (or GENESIS_HASH for first event)
    result = await session.execute(
        "SELECT hash, sequence FROM events WHERE run_id = :rid ORDER BY sequence DESC LIMIT 1",
        {"rid": run_id},
    )
    last = result.fetchone()
    prev_hash = last.hash if last else GENESIS_HASH
    next_seq = (last.sequence + 1) if last else 0

    timestamp = datetime.now(timezone.utc).isoformat()
    payload_str = canonical(payload)
    event_hash = compute_hash(prev_hash, payload_str, timestamp)

    event = Event(
        id=new_id("evt"),
        run_id=run_id,
        sequence=next_seq,
        type=event_type,
        actor=actor,
        actor_id=actor_id,
        payload=payload,
        payload_canonical=payload_str,   # ← stored once, read at verify time
        prev_hash=prev_hash,
        hash=event_hash,
        timestamp=timestamp,
    )
    session.add(event)
    # Caller MUST await session.commit() after this — use within transaction block
    return event

async def verify_chain(session: AsyncSession, run_id: str) -> dict:
    """
    Recompute the chain. Reads payload_canonical from storage (never re-serializes).
    Returns: {valid: bool, event_count: int, broken_at_index: int | None, message: str}
    """
    result = await session.execute(
        "SELECT sequence, prev_hash, hash, payload_canonical, timestamp "
        "FROM events WHERE run_id = :rid ORDER BY sequence ASC",
        {"rid": run_id},
    )
    events = result.fetchall()
    if not events:
        return {"valid": False, "event_count": 0, "broken_at_index": None,
                "message": "No events found for this run."}

    expected_prev = GENESIS_HASH
    for evt in events:
        expected_hash = compute_hash(evt.prev_hash, evt.payload_canonical, str(evt.timestamp))
        if evt.prev_hash != expected_prev:
            return {"valid": False, "event_count": len(events),
                    "broken_at_index": evt.sequence,
                    "message": f"Chain broken at event {evt.sequence}: prev_hash mismatch."}
        if evt.hash != expected_hash:
            return {"valid": False, "event_count": len(events),
                    "broken_at_index": evt.sequence,
                    "message": f"Chain broken at event {evt.sequence}: hash mismatch (payload tampered?)."}
        expected_prev = evt.hash

    return {"valid": True, "event_count": len(events), "broken_at_index": None,
            "message": f"All {len(events)} events verified. Chain intact."}
```

---

## SECTION 5 — MNEMOS IMPLEMENTATION (services/mnemos.py)

```python
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.process_atom import ProcessAtom
from typing import Optional

_model: Optional[SentenceTransformer] = None

def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, CPU-fast
    return _model

def cosine_sim(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    return float(np.dot(va, vb) / (np.linalg.norm(va) * np.linalg.norm(vb) + 1e-9))

async def retrieve_atoms(
    session: AsyncSession,
    domain: str,
    deliverable_type: str,
    query_text: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Step 1: tag-filter by domain + deliverable_type
    Step 2: semantic rerank the filtered set
    Returns top_k most relevant atoms as dicts
    """
    # Step 1: tag filter
    filter_tags = [domain, deliverable_type]
    result = await session.execute(
        "SELECT * FROM process_atoms WHERE tags && :tags",
        {"tags": filter_tags},
    )
    candidates = result.fetchall()
    if not candidates:
        return []

    # Step 2: semantic rerank
    model = get_embedding_model()
    query_vec = model.encode(query_text).tolist()
    scored = []
    for atom in candidates:
        if atom.embedding:
            sim = cosine_sim(query_vec, atom.embedding)
            scored.append((sim, atom))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [row_to_dict(atom) for _, atom in scored[:top_k]]

async def write_atoms(
    session: AsyncSession,
    run_id: str,
    atoms_data: list[dict],
) -> list[str]:
    """
    Write 3-6 process atoms from a completed run.
    CRITICAL: never store verbatim excerpts > 12 words from user docs.
    The atom extraction prompt enforces this; this function adds a word-count guard.
    """
    from app.core.nanoid import new_id
    model = get_embedding_model()
    ids = []
    for data in atoms_data:
        combined = f"{data['name']} {data['action']} {data['purpose']}"
        embedding = model.encode(combined).tolist()
        atom = ProcessAtom(
            id=new_id("atom"),
            source_run_id=run_id,
            name=data["name"],
            applicability=data["applicability"],
            action=data["action"],
            purpose=data["purpose"],
            tags=data["tags"],
            embedding=embedding,
        )
        session.add(atom)
        ids.append(atom.id)
    await session.commit()
    return ids

def row_to_dict(atom) -> dict:
    return {
        "atom_id": atom.id,
        "name": atom.name,
        "applicability": atom.applicability,
        "action": atom.action,
        "purpose": atom.purpose,
        "tags": atom.tags,
        "source_run_id": atom.source_run_id,
    }
```

---

## SECTION 6 — AGENT CONTRACT TEMPLATE

Every agent implementation follows this structure exactly:

```python
# apps/api/app/agents/base.py
from pydantic import BaseModel
from typing import Any
import json

class AgentResult(BaseModel):
    artifact_type: str
    content: dict
    confidence: float
    assumptions: list[str]
    claims: list[dict]  # [{claim_id, text, support, evidence_ids}]
    tokens_used: int
    model_used: str

class BaseAgent:
    role: str
    mandate: str
    non_goals: list[str]
    output_schema: type[BaseModel]

    def system_prompt(self) -> str:
        return f"""You are the NEXUS {self.role}.

MANDATE: {self.mandate}

NON-GOALS (never do these):
{chr(10).join(f'- {g}' for g in self.non_goals)}

OUTPUT: Respond ONLY with valid JSON matching the schema provided. No preamble, no markdown fences.
EVIDENCE: Every factual claim requires a source ID. If you cannot find credible support, add it to unknowns.
BUDGET: Stop after the token limit. Partial output is better than an overrun.
ESCALATION: If a high-severity conflict is unresolvable or a required input is absent, set escalate=true.
"""

    async def run(
        self,
        inputs: dict[str, Any],
        model_router,  # ModelRouter instance
        token_budget: int = 5000,
    ) -> AgentResult:
        raise NotImplementedError
```

**Implement all 13 agents:**

| Agent file | Role | Output schema |
|---|---|---|
| `mission_interpreter.py` | Mission Interpreter | `IdeaContract` |
| `organization_compiler.py` | Organization Compiler (calls MNEMOS retrieve first) | `OrganizationPlan` |
| `research_analyst.py` | Research Analyst | `EvidenceBrief` |
| `product_strategist.py` | Product Strategist | `ProductSpec` |
| `ai_architect.py` | AI/RAG Architect | `AIArchitecture` |
| `system_architect.py` | System Architect | `SystemDesign` |
| `experience_strategist.py` | Experience Strategist | `UXBrief` |
| `privacy_risk.py` | Privacy/Risk Analyst | `RiskRegister` |
| `finance_scope.py` | Finance/Scope Analyst | `ScopeEstimate` |
| `consistency_reviewer.py` | Consistency Reviewer | `ReviewReport` |
| `red_team.py` | Red Team | `RedTeamReport` |
| `solutions_officer.py` | Solutions Officer | `FinalBlueprint` |
| `compliance_gate.py` | Compliance Gate (no LLM call — pure schema/policy check) | `ComplianceVerdict` |

---

## SECTION 7 — POLICY ENGINE (services/policy_engine.py)

Implement each policy as a callable check. Returns `(passed: bool, reason: str)`.

```python
POLICIES = {
    "P-01": "Every research-backed external claim needs source IDs",
    "P-02": "Personal/health/financial/legal/security data activates Risk role",
    "P-03": "Any write-capable tool call requires human approval",
    "P-04": "Agent cannot call tool outside its role allowlist",
    "P-05": "No task may exceed token, cost, retry, or time budget",
    "P-06": "Final blueprint must list assumptions and limitations",
    "P-07": "Unresolved high-severity contradiction blocks finalization",
    "P-08": "Inputs and artifacts remain project-scoped",
    "P-09": "Every finalized run must pass VERITAS verify before blueprint is exportable",
}
```

---

## SECTION 8 — MODEL ROUTER (services/model_router.py)

```python
from enum import Enum
import os

class ModelTier(str, Enum):
    FAST = "fast"
    REASONING = "reasoning"
    QWEN = "qwen"
    MOCK = "mock"

class ModelRouter:
    def __init__(self):
        self.demo_mode = os.getenv("DEMO_REPLAY", "false").lower() == "true"
        self.primary_provider = os.getenv("PRIMARY_PROVIDER", "anthropic")  # anthropic|openai
        self.qwen_enabled = os.getenv("QWEN_ENABLED", "false").lower() == "true"

    def get_client(self, tier: ModelTier):
        if self.demo_mode:
            return MockClient()
        if tier == ModelTier.QWEN and self.qwen_enabled:
            return QwenClient()  # OpenAI-compatible, base_url swap
        if tier == ModelTier.REASONING:
            return self._reasoning_client()
        return self._fast_client()

    def _reasoning_client(self):
        if self.primary_provider == "anthropic":
            return AnthropicClient(model="claude-sonnet-4-6")
        return OpenAIClient(model="gpt-4.1")

    def _fast_client(self):
        if self.primary_provider == "anthropic":
            return AnthropicClient(model="claude-haiku-4-5-20251001")
        return OpenAIClient(model="gpt-4o-mini")
```

---

## SECTION 9 — SSE EVENT STREAM (routers/events.py)

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json

router = APIRouter()

@router.get("/runs/{run_id}/events")
async def stream_events(run_id: str, after_sequence: int = -1):
    """
    SSE endpoint. Streams new events as they are emitted.
    Frontend polls this with EventSource. Each event is JSON.
    """
    async def generator():
        last_seq = after_sequence
        while True:
            new_events = await get_events_after(run_id, last_seq)
            for event in new_events:
                yield f"data: {json.dumps(event.to_sse_dict())}\n\n"
                last_seq = event.sequence
            # Check if run is terminal
            run_status = await get_run_status(run_id)
            if run_status in ("COMPLETED", "FAILED", "CANCELLED"):
                yield f"data: {json.dumps({'type': 'stream_end', 'status': run_status})}\n\n"
                break
            await asyncio.sleep(0.5)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
```

---

## SECTION 10 — UI DESIGN SYSTEM (implement in globals.css)

### Design philosophy
This UI must look like a **real-time organizational intelligence platform** — think mission control meets a modern product studio. Dark, auroral, with glass surfaces that refract the aurora behind them. Every agent node must feel alive.

### Color tokens
```css
:root {
  /* Aurora background layers */
  --aurora-base: #050810;
  --aurora-deep: #060a14;
  --aurora-violet: rgba(88, 28, 220, 0.12);
  --aurora-cyan: rgba(6, 182, 212, 0.08);
  --aurora-emerald: rgba(16, 185, 129, 0.06);
  --aurora-rose: rgba(244, 63, 94, 0.06);

  /* Glass tiers */
  --glass-thin-bg: rgba(255, 255, 255, 0.04);
  --glass-thin-border: rgba(255, 255, 255, 0.08);
  --glass-thin-blur: 8px;

  --glass-regular-bg: rgba(255, 255, 255, 0.07);
  --glass-regular-border: rgba(255, 255, 255, 0.12);
  --glass-regular-blur: 16px;
  --glass-regular-specular: rgba(255, 255, 255, 0.06);

  --glass-thick-bg: rgba(15, 20, 35, 0.75);
  --glass-thick-border: rgba(255, 255, 255, 0.15);
  --glass-thick-blur: 24px;

  /* Brand accents */
  --accent-primary: #7c3aed;      /* violet — NEXUS identity */
  --accent-cyan: #06b6d4;         /* cyan — VERITAS chain */
  --accent-emerald: #10b981;      /* green — success/approved */
  --accent-amber: #f59e0b;        /* amber — waiting/pending */
  --accent-rose: #f43f5e;         /* rose — error/blocked */
  --accent-indigo: #6366f1;       /* indigo — MNEMOS memory */

  /* Agent status colors (node glow) */
  --agent-active: #7c3aed;
  --agent-completed: #10b981;
  --agent-waiting: #f59e0b;
  --agent-reviewing: #06b6d4;
  --agent-failed: #f43f5e;
  --agent-pending: rgba(255,255,255,0.2);

  /* Typography */
  --font-display: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Concentric corner radii (iOS 26 Liquid Glass) */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;
}
```

### Glass component mixins
```css
.glass-thin {
  background: var(--glass-thin-bg);
  backdrop-filter: blur(var(--glass-thin-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--glass-thin-blur)) saturate(1.2);
  border: 1px solid var(--glass-thin-border);
  border-radius: var(--radius-md);
}

.glass-regular {
  background: var(--glass-regular-bg);
  backdrop-filter: blur(var(--glass-regular-blur)) saturate(1.4) brightness(1.05);
  -webkit-backdrop-filter: blur(var(--glass-regular-blur)) saturate(1.4) brightness(1.05);
  border: 1px solid var(--glass-regular-border);
  border-radius: var(--radius-lg);
  box-shadow:
    inset 0 1px 0 var(--glass-regular-specular),
    0 4px 24px rgba(0,0,0,0.4),
    0 1px 4px rgba(0,0,0,0.3);
}

.glass-thick {
  background: var(--glass-thick-bg);
  backdrop-filter: blur(var(--glass-thick-blur)) saturate(1.6) brightness(0.98);
  -webkit-backdrop-filter: blur(var(--glass-thick-blur)) saturate(1.6) brightness(0.98);
  border: 1px solid var(--glass-thick-border);
  border-radius: var(--radius-xl);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    0 8px 40px rgba(0,0,0,0.6),
    0 2px 8px rgba(0,0,0,0.4);
}
```

### Aurora animated background (AuroraBg.tsx)
```tsx
// Full-bleed animated aurora — render once at layout level
// CSS: 4 radial gradient blobs animated with keyframes
// Performance: will-change: transform, reduced-motion fallback
// Blur cap: max 80px on the aurora blobs themselves
export function AuroraBg() {
  return (
    <div className="aurora-container" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}
```

```css
.aurora-container {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
}
.aurora-blob {
  position: absolute; border-radius: 50%; filter: blur(80px);
  will-change: transform; animation: aurora-drift linear infinite;
}
.aurora-blob-1 {
  width: 60vw; height: 60vw; top: -20%; left: -10%;
  background: radial-gradient(circle, var(--aurora-violet), transparent 70%);
  animation-duration: 20s;
}
.aurora-blob-2 {
  width: 50vw; height: 50vw; top: 30%; right: -10%;
  background: radial-gradient(circle, var(--aurora-cyan), transparent 70%);
  animation-duration: 25s; animation-delay: -8s;
}
.aurora-blob-3 {
  width: 40vw; height: 40vw; bottom: -10%; left: 30%;
  background: radial-gradient(circle, var(--aurora-emerald), transparent 70%);
  animation-duration: 18s; animation-delay: -14s;
}
.aurora-blob-4 {
  width: 35vw; height: 35vw; top: 60%; left: 15%;
  background: radial-gradient(circle, var(--aurora-rose), transparent 70%);
  animation-duration: 22s; animation-delay: -5s;
}
@keyframes aurora-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(3%, 5%) scale(1.05); }
  50% { transform: translate(-2%, 3%) scale(0.97); }
  75% { transform: translate(4%, -3%) scale(1.03); }
}
@media (prefers-reduced-motion: reduce) {
  .aurora-blob { animation: none; }
}
```

---

## SECTION 11 — 3D AGENT NETWORK CANVAS (THE CENTERPIECE)

This is the most important component. Judges will stare at this for the entire demo.

### AgentNetwork.tsx — implementation spec

```tsx
// Uses React Flow for the base graph + a custom WebGL canvas overlay for particles

import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, ReactFlowProvider
} from 'reactflow';
import { useCallback, useEffect, useRef } from 'react';
import { AgentNode } from './AgentNode';
import { DataPacketEdge } from './DataPacketEdge';
import { useRunEvents } from '@/hooks/useRunEvents';

const nodeTypes = { agentNode: AgentNode };
const edgeTypes = { dataPacket: DataPacketEdge };

export function AgentNetwork({ runId }: { runId: string }) {
  const { events, agents, tasks } = useRunEvents(runId);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Derive graph from incoming events — nodes form as agents are activated
  useEffect(() => {
    // Build nodes from agent_instances in events
    // Build edges from task dependencies and handoffs
    // Animate: node status changes trigger glow color transitions
  }, [events]);

  return (
    <div className="agent-network-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(124,58,237,0.15)" size={1} />
        <Controls className="glass-thin" />
        <MiniMap
          nodeColor={(n) => statusColor(n.data?.status)}
          className="glass-regular"
        />
      </ReactFlow>
    </div>
  );
}
```

### AgentNode.tsx — custom node
```tsx
// Each node is a glass card with:
// 1. Outer glow ring (color = agent status, animated pulse when ACTIVE)
// 2. Role icon + role label
// 3. Task count + status badge
// 4. Token usage micro-bar
// 5. Confidence ring (arc progress around the node)

export function AgentNode({ data }: NodeProps) {
  const { role, status, tokensUsed, tokenBudget, confidence, taskCount } = data;

  return (
    <div className={`agent-node agent-node--${status}`}>
      <div className="agent-node__glow" />
      <div className="agent-node__inner glass-regular">
        <div className="agent-node__icon">{roleIcon(role)}</div>
        <div className="agent-node__role">{roleLabel(role)}</div>
        <div className="agent-node__status">
          <StatusBadge status={status} />
          <span className="agent-node__tasks">{taskCount} tasks</span>
        </div>
        <div className="agent-node__budget-bar">
          <div
            className="agent-node__budget-fill"
            style={{ width: `${(tokensUsed / tokenBudget) * 100}%` }}
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

```css
.agent-node {
  position: relative;
  width: 160px;
}
.agent-node__glow {
  position: absolute;
  inset: -8px;
  border-radius: 28px;
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.4s, background 0.4s;
}
.agent-node--ACTIVE .agent-node__glow {
  background: var(--agent-active);
  opacity: 0.4;
  animation: pulse-glow 2s ease-in-out infinite;
}
.agent-node--COMPLETED .agent-node__glow {
  background: var(--agent-completed);
  opacity: 0.2;
}
.agent-node--REVIEW .agent-node__glow {
  background: var(--agent-reviewing);
  opacity: 0.35;
  animation: pulse-glow 1.5s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
.agent-node__inner {
  padding: 12px 14px;
  cursor: pointer;
  transition: transform 0.2s;
}
.agent-node__inner:hover { transform: translateY(-2px); }
.agent-node__budget-bar {
  height: 2px;
  background: rgba(255,255,255,0.1);
  border-radius: 1px;
  margin-top: 8px;
  overflow: hidden;
}
.agent-node__budget-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-cyan));
  border-radius: 1px;
  transition: width 0.3s ease;
}
```

### DataPacketEdge.tsx — animated data flow
```tsx
// Custom edge that shows animated "data packets" traveling along the bezier path
// when a handoff or tool call event fires between two agents
// Implementation: SVG path + CSS animation of a glowing dot moving along it

export function DataPacketEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const isActive = data?.active;

  return (
    <>
      <path
        id={id}
        className={`data-packet-edge ${isActive ? 'data-packet-edge--active' : ''}`}
        d={edgePath}
        fill="none"
        stroke={isActive ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? '8 4' : 'none'}
      />
      {isActive && (
        <circle r="4" fill={var(--accent-cyan)} filter="url(#packet-glow)">
          <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
```

---

## SECTION 12 — VERITAS CHAIN VISUALIZER

```tsx
// ChainTimeline.tsx
// Renders events as a horizontal timeline with:
// - Each event as a connected block showing type, actor, hash prefix
// - Scan-line animation when verify is triggered
// - Green "VERIFIED" or red "BROKEN AT N" verdict chip

export function ChainTimeline({ runId }: { runId: string }) {
  const { events } = useVeritas(runId);
  const { verify, verifying, result } = useVerifyAction(runId);

  return (
    <div className="glass-thick chain-timeline">
      <div className="chain-timeline__header">
        <h3>VERITAS Event Chain</h3>
        <VerifyButton onClick={verify} loading={verifying} result={result} />
      </div>
      <div className="chain-timeline__track">
        {events.map((evt, i) => (
          <HashBlock
            key={evt.id}
            event={evt}
            isFirst={i === 0}
            isBroken={result?.broken_at_index === evt.sequence}
          />
        ))}
      </div>
      {verifying && <div className="chain-timeline__scanline" />}
      {result && <VerdictChip valid={result.valid} message={result.message} />}
    </div>
  );
}

// CSS: scanline is a horizontal gradient that sweeps left-to-right
// on a 1.2s animation when verify is triggered
.chain-timeline__scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(6,182,212,0.15) 48%,
    rgba(6,182,212,0.4) 50%,
    rgba(6,182,212,0.15) 52%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: scanline-sweep 1.2s ease-in-out forwards;
  pointer-events: none;
}
@keyframes scanline-sweep {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
```

---

## SECTION 13 — MNEMOS MEMORY PANEL

```tsx
// MemoryPanel.tsx — right drawer that slides in when memory badge is clicked
// Shows:
// 1. Atoms retrieved at compile time (with match score)
// 2. Atoms written at run finalization
// 3. MemoryConstellation: D3 force-directed graph of atom relationships

export function MemoryPanel({ atoms, isOpen, onClose }: MemoryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="memory-panel glass-thick"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          <div className="memory-panel__header">
            <span className="memory-panel__badge">MNEMOS</span>
            <h3>Organizational Memory</h3>
            <button onClick={onClose}>✕</button>
          </div>

          {atoms.retrieved.length === 0 ? (
            <div className="memory-panel__empty">
              <p>No prior similar runs — this is the first of its kind.</p>
              <p className="memory-panel__empty-sub">
                Patterns from this run will be stored after completion.
              </p>
            </div>
          ) : (
            <>
              <p className="memory-panel__subtitle">
                Retrieved {atoms.retrieved.length} patterns from prior runs
              </p>
              {atoms.retrieved.map(atom => (
                <AtomCard key={atom.atom_id} atom={atom} type="retrieved" />
              ))}
            </>
          )}

          {atoms.written?.length > 0 && (
            <>
              <div className="memory-panel__divider">
                <span>Learned this run</span>
              </div>
              {atoms.written.map(atom => (
                <AtomCard key={atom.atom_id} atom={atom} type="written" />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## SECTION 14 — COMPLETE API ROUTES

```
POST   /api/projects                           → Create project
GET    /api/projects/:id                       → Get project
POST   /api/projects/:id/intake                → Submit idea, get IdeaContract
POST   /api/projects/:id/compile-organization  → Compile org plan (calls MNEMOS retrieve)
POST   /api/runs                               → Start a run
GET    /api/runs/:id                           → Get run status
GET    /api/runs/:id/events                    → SSE stream
GET    /api/runs/:id/organization              → OrganizationPlan with atom references
GET    /api/runs/:id/verify                    → VERITAS chain verification
GET    /api/runs/:id/blueprint                 → FinalBlueprint
POST   /api/runs/:id/export                    → Export (gated on P-09 verify pass)
POST   /api/runs/:id/cancel                    → Cancel run
GET    /api/tasks/:id                          → Task detail + artifact
GET    /api/artifacts/:id                      → Artifact detail with claims/evidence
POST   /api/approvals/:id/decision             → Human approval decision
GET    /api/memory/atoms                       → Browse atom store (?tags=&domain=)
GET    /api/experiments/compare                → Comparison metrics (?prompt_id=)
GET    /api/runs/:id/replay                    → Trigger demo replay pipeline
```

---

## SECTION 15 — DEMO DATA (seed before expo)

Create `/apps/api/app/data/seeds/` with three complete seeded missions:

### Mission 1: EdTech (primary demo)
```json
{
  "idea": "Design a multilingual AI exam-prep platform for B.Tech students in India",
  "domain": "edtech",
  "agents_selected": ["research", "product", "ai_architect", "system_architect", "ux", "privacy_risk", "reviewer"],
  "mnemos_atoms_to_pre_seed": [
    {
      "name": "Privacy/Risk role required when platform stores student learning history",
      "applicability": {"domain": "edtech", "deliverable_type": "platform-blueprint", "data_sensitivity": "student-data"},
      "action": "Activate Privacy/Risk Analyst; require explicit approval gate on retention duration",
      "purpose": "Prevents silent decisions about sensitive data retention reaching the final blueprint unreviewed",
      "tags": ["edtech", "privacy", "student-data", "approval-gate"]
    },
    {
      "name": "Multilingual NLP requires regional language corpus validation",
      "applicability": {"domain": "edtech", "deliverable_type": "ai-architecture"},
      "action": "Specify evaluation dataset covering target languages; flag coverage gaps as risks",
      "purpose": "Prevents deployment of a multilingual system that silently fails on minority languages",
      "tags": ["edtech", "multilingual", "nlp", "evaluation"]
    }
  ]
}
```

### Mission 2: Startup (surplus food marketplace)
```json
{
  "idea": "Build a surplus-food redistribution marketplace connecting restaurants with food banks",
  "domain": "marketplace"
}
```

### Mission 3: Campus grievance triage
```json
{
  "idea": "AI-assisted student grievance triage system with synthetic policy documents",
  "domain": "campus-admin"
}
```

**DEMO REPLAY LABELING**: All seeded runs must have `is_demo_replay=true` in the DB and display a `DEMO REPLAY` chip in the UI header.

---

## SECTION 16 — BUILD PHASES (6 weeks, phase-gated)

### Phase 0 — Repo, schema, skeleton (Week 1, ~2 days)
**STOP after this phase and get explicit approval.**

Deliverables:
- [ ] GitHub repo `nexus-organization-os` created
- [ ] Monorepo structure from Section 2 initialized
- [ ] Alembic initial migration with complete schema from Section 3 applied
- [ ] FastAPI app boots, returns `{"status": "ok"}` on `GET /health`
- [ ] Next.js app boots, renders a placeholder page
- [ ] Docker Compose runs both services + PostgreSQL
- [ ] CI workflow passes on first push (empty tests pass)
- [ ] `.env.example` with all required variable names
- [ ] `AGENTS.md` at repo root (copy from docs/AGENTS.md)

### Phase 1 — Design system + core UI (Week 1-2)
- [ ] Design tokens from Section 10 in `globals.css`
- [ ] `AuroraBg` component renders and animates
- [ ] `GlassCard`, `GlassButton`, `StatusBadge`, `TokenMeter` components
- [ ] Landing page (Screen A) with sample missions
- [ ] Figma variables synced; Figma Dev Mode MCP configured

### Phase 2 — Intake + Organization Compiler (Week 2)
- [ ] `POST /projects` + `POST /projects/:id/intake` implemented
- [ ] `MissionInterpreter` agent produces valid `IdeaContract`
- [ ] `OrganizationCompiler` produces valid `OrganizationPlan` (includes MNEMOS retrieve call)
- [ ] Idea Contract screen (Screen B) interactive
- [ ] VERITAS columns present on all events from day 1
- [ ] `ProcessAtom` table ready; MNEMOS service stub returns empty set (no atoms yet)

### Phase 3 — Agent execution + Living Canvas (Week 3)
- [ ] SSE stream working end-to-end
- [ ] `AgentNetwork` component wired to event stream — nodes appear as agents activate
- [ ] At least 3 agents fully implemented: Research, Product, Reviewer
- [ ] `DataPacketEdge` animates on handoff events
- [ ] VERITAS chain wired into telemetry emitter — every event is chained
- [ ] Demo replay pipeline (`GET /runs/:id/replay`) working with seeded EdTech data
- [ ] Node inspector rail shows agent details on click

### Phase 4 — Full execution + MNEMOS write (Week 4)
- [ ] All 13 agents implemented
- [ ] Parallel task execution in orchestrator
- [ ] Revision loop (Reviewer → revision request → re-run)
- [ ] Approval gate working (run enters `WAITING_FOR_HUMAN`, resumes on decision)
- [ ] MNEMOS write step at run finalization (3-6 atoms extracted and stored)
- [ ] Memory panel shows retrieved atoms when present
- [ ] Evidence graph (D3 force-directed) renders claim→evidence links

### Phase 5 — Governance + polish + evaluation (Week 5)
- [ ] Policy engine P-01 through P-09 enforced
- [ ] Compliance gate agent running as final check
- [ ] VERITAS `GET /runs/:id/verify` working; scan-line animation in UI
- [ ] Blueprint export (Markdown + JSON)
- [ ] Counterfactual Lab with real Single-Agent vs NEXUS metrics
- [ ] Memory constellation (D3 force-graph of atoms) in MNEMOS panel
- [ ] Reduced motion, keyboard nav, focus visible

### Phase 5b — Reliability + demo prep (Week 6)
- [ ] Full unit test suite (see test plan in docs/05)
- [ ] Integration tests passing
- [ ] Playwright E2E: full happy path runs green
- [ ] 3 seeded demo missions with pre-seeded atoms
- [ ] 45-second backup video recorded
- [ ] VERITAS verify completes in < 2 seconds on a typical run
- [ ] Frame-rate audit at 1440p: canvas ≥ 55fps, all animations ≥ 50fps
- [ ] Expo projector contrast test passed

---

## SECTION 17 — LIVE TOKEN COST METER (show this to judges)

```tsx
// TokenMeter.tsx — always-visible HUD element in canvas view
// Shows live cost in USD, token count, and budget % used
// This is the "cost transparency card" from the expo playbook

export function TokenMeter({ runId }: { runId: string }) {
  const { tokensUsed, costUsd, budgetTokens, budgetCostUsd } = useRunBudget(runId);
  const pct = Math.min((tokensUsed / budgetTokens) * 100, 100);

  return (
    <div className="token-meter glass-thin">
      <div className="token-meter__label">Run Cost</div>
      <div className="token-meter__cost">${costUsd.toFixed(4)}</div>
      <div className="token-meter__tokens">{tokensUsed.toLocaleString()} tokens</div>
      <div className="token-meter__bar">
        <div
          className="token-meter__fill"
          style={{
            width: `${pct}%`,
            background: pct > 80
              ? 'linear-gradient(90deg, var(--accent-amber), var(--accent-rose))'
              : 'linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))',
          }}
        />
      </div>
      <div className="token-meter__budget">{pct.toFixed(0)}% of budget</div>
    </div>
  );
}
```

---

## SECTION 18 — HARD RULES (agents must never violate these)

1. **No API keys in code, bundles, or commits.** Environment variables only. `.env.example` has placeholder names only.

2. **Every run event must be VERITAS-chained in the same DB transaction.** Never emit an unchained event. Never re-serialize payloads at verify time — read `payload_canonical` from storage.

3. **All model output is untrusted.** Validate every agent response against its Pydantic schema before storage. Reject invalid output and emit a `task_failed` event.

4. **MNEMOS atoms must not leak private uploaded-document content.** The atom extraction prompt must extract generalizable patterns only. Post-extraction guard: reject any atom whose name/action/purpose contains a verbatim span longer than 12 words from an uploaded document.

5. **Mocked/seeded content must be labeled `DEMO REPLAY` in the UI header.** Never fabricate evaluation numbers — show `Not measured yet` until real runs exist.

6. **P-09 must gate exports.** `POST /runs/:id/export` returns 403 unless `GET /runs/:id/verify` returns `{valid: true}` for that run.

7. **Phase-gated.** Never start the next phase without explicit human approval message. Never skip phases. Tests must pass before claiming a phase complete.

8. **Conventional commits.** One commit per approved phase batch. Format: `feat(phase-N): <summary>`.

9. **No scope additions.** Do not add a ninth acronym, a fourth model provider, or a fifth tool unless explicitly instructed. Scope creep is the #1 risk.

10. **Demo mode.** `DEMO_REPLAY=true` must make the entire system work without any external API calls, using seeded JSON only, clearly labeled.

---

## SECTION 19 — EXPO DEMO SCRIPT (memorize and follow)

**Total: ~4 minutes. Rehearse 5+ times in mock mode before the show.**

| Time | Action | What to say |
|---|---|---|
| 0:00–0:25 | Open to landing page | "Most agent demos show many agents talking. We built the missing layer: an organization that decides which agents should exist, what they may do, how their work is verified, and what it remembers." |
| 0:25–0:55 | Type the idea | "Design a multilingual AI exam-prep platform for B.Tech students in India." Show Idea Contract. "Notice it declares its assumptions — nothing is hidden." |
| 0:55–1:40 | Click Compile Organization | Point to the 3D network forming live. "Six specialists, selected based on the task. Click a node — here's its mandate, its permitted tools, and why it was chosen. That memory badge? This system already saw something like this before." Open memory panel. |
| 1:40–2:25 | Show parallel work | "Research and UX are running in parallel — you can see the data packets flowing. Open an evidence card. Every factual claim is linked to a source." Show the Reviewer blocking an unsupported cost claim. |
| 2:25–2:55 | Approval gate | "The system paused — it won't decide about student-data retention without a human. I approve the privacy-preserving design." |
| 2:55–3:20 | Final blueprint + Verify | "Blueprint complete. Click Verify Integrity." (scan-line animation) "Every one of these events is cryptographically chained. If I'd edited anything after the fact, this would break here and show exactly where." |
| 3:20–3:50 | Counterfactual Lab | "We compare NEXUS against a single-agent baseline: coverage, evidence, contradictions, cost. We show real numbers, not claims." Point to token cost meter. "This run cost $0.0042." |
| 3:50–4:00 | Close | "One idea in. A governed organization, verified evidence, and a system that starts smarter on run two." |

---

## SECTION 20 — PREPARED JUDGE ANSWERS

**"Doesn't hierarchy add overhead?"**
> Liu (2026) found naive hierarchy and committee forms can underperform a single expert when handoffs create more context cost than collective gain. That's exactly why NEXUS is not a fixed org chart — the Compiler picks team size and depth per mission, and agents exchange versioned structured artifacts through a shared store instead of lossy chat. We built the Counterfactual Lab to test this rather than assume it.

**"Can't someone with DB access recompute the whole chain?"**
> Honestly yes. A hash chain alone can't stop a determined attacker with DB write access from recomputing it. What it does is make any after-the-fact edit detectable by anyone who can read the log — which covers the realistic internal audit threat model. The upgrade is periodic anchoring: publishing chain head hashes somewhere immutable. We list that as roadmap work — we didn't fake it in the MVP.

**"What's novel?"**
> Most systems log events. NEXUS chains them so tampering anywhere breaks a verifiable check. Most systems retrieve documents. NEXUS decomposes runs into structured atoms and retrieves via tag-filter then semantic rerank. Most agents use a fixed org chart. NEXUS compiles a minimum justified team per mission. And none of the source papers implement this exact combination — the Organization Compiler + VERITAS + MNEMOS + visual governance layer is our contribution.

**"How is MNEMOS different from RAG?"**
> Plain RAG chunks and similarity-searches raw documents. MNEMOS decomposes runs into structured, tagged, reusable organizational lessons and retrieves via tag-filter-then-semantic-rerank. The SAP paper this is based on measured that hybrid approach beating plain RAG by 15-18 points of policy compliance in their proof-of-concept.

---

## FINAL INSTRUCTION TO ANTIGRAVITY

You have everything you need. Start with **Phase 0 only**. Build the directory structure, apply the database migration, get both services booting, and get CI passing. Then stop and wait for explicit "approve Phase 1" from the human.

Do not invent new agent roles, new acronyms, new database tables, or new screens beyond what is specified here. When in doubt, build less and build it right.

The single most important thing to get right first: **the VERITAS columns (`payload_canonical`, `prev_hash`, `hash`) must be on the Event table from the very first migration**. Retrofitting them later is expensive.

The single most important UI component: **AgentNode with animated glow**. Get that right in Phase 3 before moving to anything else in the canvas. Everything else on the canvas can be iterated, but the "living" feeling of the network is what makes judges stop walking and watch.

Good luck. Ship something true.
