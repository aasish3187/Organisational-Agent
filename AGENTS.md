# AGENTS.md — NEXUS Organization OS

## What this repo is
NEXUS converts a rough human idea into a verified project blueprint by dynamically creating a governed team of AI agents (Organization Compiler), executing structured artifact-producing tasks with review loops, chaining every event for tamper-evidence (VERITAS), and writing reusable organizational lessons back to memory (MNEMOS). It is a university expo prototype: vertical slice, honest demo labeling, no unrestricted autonomy.

## Read before doing anything
1. Read every file in `/docs` (00-09). They are self-contained and are the product source of truth.
2. Conflict priority: `03 > 02 > 01 > 04 > 05 > 06 > 00 > 07 > 08`. Doc 09 is review history/checklist.
3. Work is phase-gated (doc 07 §3). Never start the next phase without explicit human approval.

## Commands (fill exact commands during Phase 0, keep updated)
```bash
# Backend (apps/api)
uvicorn app.main:app --reload          # dev server
pytest                                  # backend tests
mypy app                                # typecheck (or ruff check)

# Frontend (apps/web)
npm run dev                             # dev server
npm run test                            # vitest
npm run lint && npm run typecheck       # eslint + tsc

# Whole stack
docker compose up                       # web + api + db
```

## Hard rules
- No API keys in code, client bundles, or commits. Env vars only; `.env.example` holds placeholder names.
- No unrestricted shell/browser/payment/email/deployment/write tools for NEXUS agents — read-only tool catalog only (doc 02 §10).
- Every emitted run event must be VERITAS-chained in the same DB transaction (doc 02 §6). Never emit an unchained event. Never re-serialize payloads at verify time — use the stored `payload_canonical`.
- All model output is untrusted input: validate against Pydantic schemas before storage.
- Mocked/seeded demo content must be labeled `DEMO REPLAY` in the UI. Never fabricate evaluation numbers; show "Not measured yet".
- Conventional commits, one commit per approved phase batch. Run tests + typechecks before claiming any task complete; report failures honestly.
