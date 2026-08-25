# NEXUS Organization OS

> **Industry-Grade · Expo-Ready · Visually Stunning · Fully Governed**

NEXUS turns a raw human idea into a governed, verified, explainable project blueprint through a dynamically compiled AI organization — and makes every decision it takes visible, inspectable, and provably untampered.

---

## 🌟 The Core Pitch

A user types a raw idea. NEXUS dynamically assembles a governed team of AI specialists, assigns work by capability, chains every event for cryptographic tamper-evidence (VERITAS), and returns a verified blueprint with replayable proof of every decision — and each run makes the next one smarter by learning reusable patterns (MNEMOS).

---

## 🏗️ Architecture & Technology Stack

```
nexus-organization-os/
├── AGENTS.md                    ← Root AI agent governance & instructions
├── docker-compose.yml           ← Multi-container orchestration (web, api, db, redis)
├── .env.example                 ← Environment template (placeholder names only)
├── .github/workflows/ci.yml     ← Automated CI (pytest, ruff, tsc, vitest)
├── docs/                        ← Specifications 00-09 (product source of truth)
├── apps/
│   ├── api/                     ← FastAPI (Python 3.12, async SQLAlchemy 2.0, Alembic)
│   │   ├── app/
│   │   │   ├── main.py          ← FastAPI entrypoint & middleware
│   │   │   ├── core/            ← Config, async DB engine, prefixed NanoIDs, Redis
│   │   │   ├── models/          ← 12 SQLAlchemy ORM models + VERITAS & MNEMOS schemas
│   │   │   ├── schemas/         ← Pydantic v2 validation models
│   │   │   ├── routers/         ← API routes & SSE stream endpoints
│   │   │   ├── services/        ← VERITAS chain & MNEMOS memory services
│   │   │   └── agents/          ← 13 Governed agent contracts
│   │   ├── alembic/             ← Database migrations
│   │   └── tests/               ← Async pytest test suite
│   └── web/                     ← Next.js 15 (App Router, TypeScript strict, Tailwind CSS)
│       ├── src/
│       │   ├── app/             ← Canvas, Blueprint, Workstream, Lab pages
│       │   ├── components/      ← Glass UI primitives, 3D Agent Network, VERITAS timeline
│       │   ├── lib/             ← Typed API client & utilities
│       │   └── styles/          ← Design tokens & Aurora keyframes
│       └── tests/               ← Vitest unit tests
```

---

## 🚀 Quickstart

### Option 1: Docker Compose (Full Stack)
```bash
# Copy environment file
cp .env.example .env

# Run web, api, postgresql, and redis
docker compose up --build
```
- Web UI: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`
- API Health: `http://localhost:8000/health`

### Option 2: Local Development

#### Backend (`apps/api`)
```bash
cd apps/api
python -m venv .venv
# Activate virtual environment
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000

# Run backend tests & lint
pytest
ruff check .
```

#### Frontend (`apps/web`)
```bash
cd apps/web
npm install
npm run dev

# Run frontend tests & typecheck
npm run test
npm run typecheck
```

---

## 🛡️ Core Guarantees & Hard Rules

1. **Cryptographic VERITAS Chain**: Every emitted run event is chained using SHA-256 (`payload_canonical`, `prev_hash`, `hash`) in the same database transaction.
2. **Untrusted Model Outputs**: All LLM responses are strictly validated against Pydantic schemas before persistence.
3. **Privacy-Preserving MNEMOS**: Organizational learning extracts generalized process atoms without leaking private verbatim inputs (>12 words).
4. **Honest Demo Labeling**: Seeded runs and mock modes are explicitly flagged as `DEMO REPLAY` in the UI.

---

## 📋 Build Phases

- [x] **Phase 0**: Monorepo skeleton, complete 12-table schema with VERITAS columns, FastAPI health check, Next.js shell, Docker Compose, and CI.
- [ ] **Phase 1**: UI design system, Aurora animated background, Glass component primitives, and Landing page.
- [ ] **Phase 2**: Mission Intake, Idea Contract generation, and Organization Compiler with MNEMOS retrieval.
- [ ] **Phase 3**: Dynamic 3D Agent Network Living Canvas with glowing pulse nodes and SSE streaming.
- [ ] **Phase 4**: 13 Agent roles execution, parallel DAG dispatch, human approval gates, and MNEMOS learning write-back.
- [ ] **Phase 5**: Policy Engine (P-01 to P-09), Counterfactual Lab, and Blueprint export.
- [ ] **Phase 5b**: Reliability audit, frame-rate performance validation (≥55fps), and Expo demonstration readiness.
