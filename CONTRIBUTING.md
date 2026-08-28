# Contributing to ORGagent Organization OS

Thank you for your interest in contributing to **ORGagent**! We are building the next generation of governed, verified, explainable multi-agent systems.

---

## 🌟 How to Contribute

There are many ways you can contribute:
1. **Submit Bug Reports**: Let us know if you find an issue with agent task execution, Pydantic validation, or UI rendering.
2. **Propose New Specialist Agents**: Add new domain agents (e.g., *DevOps Infrastructure Engineer*, *Database Optimization Specialist*, *Regulatory Compliance Officer*).
3. **Enhance LLM Gateway & Tooling**: Add support for new open-weights reasoning models (e.g. Qwen 2.5 Max, Claude 3.7 Sonnet) or read-only tools.
4. **Improve UI & Visualizations**: Add new React Flow canvas physics, telemetry visualizations, or PDF report generators.

---

## 🛠️ Local Development Setup

### 1. Fork & Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/Organisational-Agent.git
cd Organisational-Agent
```

### 2. Backend Setup (Python 3.11+)
```bash
cd apps/api
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
pytest -v
```

### 3. Frontend Setup (Node.js 18+)
```bash
cd ../web
npm install
npm run dev -- -p 3000
```

---

## 🧪 Testing & Verification Requirements

Before submitting any Pull Request:
1. **Backend Tests**: Run `pytest` inside `apps/api` and ensure 100% pass rate.
2. **Frontend Typecheck & Linting**: Run `npm run typecheck` and `npm run test` inside `apps/web`.
3. **Deterministic Governance**: Ensure no unchained events or non-sandboxed tools are introduced.

---

## 📜 Pull Request Guidelines

1. Create a descriptive branch: `git checkout -b feat/add-devops-agent`
2. Follow Conventional Commits: `feat(agents): add DevOps Specialist agent for Kubernetes Helm charts`
3. Push to your fork and submit a PR against `main`.
4. Fill out the PR template with clear verification steps.

Thank you for helping shape the future of Governed AI Organizations! 🚀
