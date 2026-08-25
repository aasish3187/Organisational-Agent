# NEXUS — Master Index, Model Options, Extensions & Step-by-Step Execution Guide (doc 08, v3)

## 1. Document index
| # | File | What it's for |
|---|---|---|
| 00 | Unified Project Overview | Identity, what merged from where, honest positioning |
| 01 | Product Requirements and User Flows | Every screen, user story, edge case |
| 02 | System Architecture and Technology | Stack, modules, VERITAS/MNEMOS detail, build order |
| 03 | Agent Contracts, Policies, and Data Model | Every agent's contract, DB schema, API |
| 04 | UI/UX, Figma, and Stitch Design System | Screens, tokens, components, Stitch prompts |
| 05 | Implementation Roadmap, Quality, and Expo Demo | 6-week plan, testing, demo script |
| 06 | Research Foundation and References | Every citation (verified), what's proven vs. hypothesized |
| 07 | Multi-Tool Build Guide and Master Prompts | Antigravity/Claude Code/Cursor prompts, MCP guidance |
| 08 | **This file** | Qwen slot-in, extensions, exact step-by-step sequence |
| 09 | Review Findings and Pre-Build Checklist | Verification report, changes made, go/no-go checklist |

**v3 note:** this doc set is self-contained. The earlier v1/v2 split (where v2 files said "unchanged from the original NEXUS doc") has been merged away — do not put the old underscore-named v1 files into `/docs`; they are superseded and would create conflicting duplicates.

## 2. Adding Qwen 3.8-Max to the Model Router (doc 02 §9)

Qwen 3.8-Max (Alibaba, 2.4T MoE / 95B active params, 1M context, ~$2/$6 per M tokens, OpenAI- and Anthropic-compatible endpoints) is a strong option — add it because it fills a real gap, not to say you used another model:

```python
class ModelProfile:
    name: str
    tier: Literal['fast', 'reasoning', 'local', 'qwen']
```

**Where it earns its slot:**
- As an **alternative `reasoning` tier** model for CTO/Solutions Officer/Organization Compiler — its long context (1M tokens) is genuinely useful for the Organization Compiler when MNEMOS retrieves several process atoms plus a large Idea Contract.
- As your **cost-story talking point**: priced well below most frontier reasoning models, so you can genuinely say "we route the expensive governance calls to whichever model gives the best reasoning-per-dollar, and it isn't always the same vendor" — a real architectural claim, not marketing.
- Since it's OpenAI/Anthropic-API-compatible, wiring it in is a **base-URL swap**, not a new integration — cheap to add, cheap to demo.

**Where it does NOT belong:** don't make it your primary/only model. Keep Claude or GPT-4.1-class as your default reasoning tier (more stable for a live demo you can't afford to have flake), and present Qwen as a genuine secondary option the Model Router can route to — e.g., a live toggle in Settings that switches CTO's model provider, which is itself a nice thing to show a technically-minded judge.

## 3. Antigravity extensions worth having

Antigravity supports both extensions and MCP servers. From the extensions side:

| Extension | What it adds | Worth it? |
|---|---|---|
| **Claude Code** | Full Claude Code agent inside Antigravity's window | Yes — your primary implementation engine |
| **GitHub Pull Requests** (or VS-Code-lineage equivalent) | Review/create PRs without leaving the editor | Yes, with GitHub as repo host |
| **Python** + **Pylance**-equivalent | Type checking, IntelliSense for the FastAPI backend | Yes — standard for a typed Python backend at this scale |
| **ESLint / Prettier** | Keeps the Next.js/TypeScript frontend consistent across all agent sessions | Yes — prevents style drift when multiple tools write to the same repo |
| **Docker** | Container management inside the editor, matches the Docker Compose setup | Yes, once you reach Week 6 |
| Generic "AI chat"/autocomplete extensions beyond Antigravity + Claude Code | Redundant | Skip — a third autocomplete layer adds noise, not value |

Honest note: **Antigravity's built-in agent + the MCP servers (Figma, GitHub, Playwright, Context7) cover the vast majority of what you need.** Extensions beyond the standard dev-tooling list aren't where the leverage is — resist installing more tooling instead of building.

## 4. The actual step-by-step sequence (do this, in this order)

### Step 0 — Repo and docs setup (30 min)
1. Create a GitHub repo named `nexus-organization-os`.
2. Create a `/docs` folder and copy in **this self-contained doc set: files 00-09**. Copy `AGENTS.md` to the repo root. Do **not** add the old v1 underscore-named files — they are superseded.
3. Add a minimal GitHub Actions CI workflow (`.github/workflows/ci.yml`): run backend `pytest`, frontend `vitest`, and both typechecks on every push. Ten lines of YAML now buys green badges on the repo judges will look at, and catches agent-introduced regressions per phase.
4. Clone locally, or open directly in Antigravity via "Open Folder."

### Step 1 — Design system, before any code (Week 1)
1. Open Figma. Build the design tokens from doc 04 §6 as Figma Variables.
2. Build the core component library (doc 04 §7) using those variables, each in its glass tier (doc 04 §2).
3. For the two genuinely novel components — the VERITAS Verify chain and the MNEMOS Memory panel — open **Stitch**, paste the two prompts from doc 04 §12 verbatim, generate a few directions, pick one, then **manually rebuild the chosen direction in Figma** so Figma stays the single source of truth.
4. Lay out the screens from doc 04 §5 at 1440px and 390px.
5. Install the **Figma Dev Mode MCP server** so Antigravity/Cursor can read this file directly once building starts.

### Step 2 — Antigravity setup (Week 1, same week)
1. Install Antigravity. Open your repo.
2. `Settings → Customizations → Installed MCP Servers → Add MCP` — install Figma, GitHub (read-only PAT), Playwright, Context7.
3. `Extensions → Claude Code` — sign in with your own Anthropic account/API key.
4. In Antigravity's Manager View, open a session and paste the **master prompt from doc 07 §3**. Tell it explicitly: "Phase 0 only."
5. Review the plan it returns. Check the directory tree and dependency choices against doc 02 before approving anything. Verify the Phase 0 plan includes the VERITAS columns and ProcessAtom table in the Phase 2 schema — if it doesn't, reject and point at doc 02 §12.

### Step 3 — Phase-by-phase build (Weeks 1-6, doc 05 roadmap)
For each phase (0 through 5, as defined in doc 07 §3):
1. Approve the phase explicitly using the **Phase approval prompt** (doc 07 §4).
2. Let Antigravity coordinate; when it needs deep implementation work, hand off to the Claude Code extension in the same window.
3. Once a batch of backend work is stable, switch to **Cursor** for the corresponding frontend piece — use the **Cursor-specific prompt** (doc 07 §6), scoped to one component per session.
4. Use the **Playwright MCP** to actually click through what was just built against doc 04's screen specs — don't just eyeball it.
5. Commit with a conventional commit message. Push to GitHub (CI runs automatically).
6. Repeat for the next phase. Do not skip ahead to Phase 4 (governance/VERITAS UI/MNEMOS) before Phases 1-3 (the core loop) are demo-solid — a good trust/memory story bolted onto a broken core loop is worse than a simple core loop that works.

### Step 4 — Reliability and evaluation (Weeks 5-6)
1. Run the **Reliability review prompt** (doc 07 §5) — specifically catches VERITAS chain gaps and MNEMOS private-content leakage.
2. Run the **Evaluation prompt** (doc 07 §5) — build the Single-Agent vs Flat-Swarm vs NEXUS comparison harness per doc 05 §6, respecting the two-day Flat Swarm timebox. Never fabricate a result; the UI says "Not measured yet" until real runs exist.
3. Seed your three demo missions (doc 01 §9) and 5-8 MNEMOS atoms so a fresh live demo has something real to show.

### Step 5 — Demo prep (last few days)
1. Rehearse the choreography in doc 05 §7 at least five times end to end (mock/fast tier for rehearsals, reasoning tier only for final rehearsal + show — doc 05 §9).
2. Record the 45-second backup video in case of connectivity issues.
3. Test the Verify animation and Memory panel specifically at both small and large event counts (doc 04 §13).
4. Print the one-page backup summary with a QR code to your repo/demo video.

### Step 6 — On stage
Follow the script in doc 05 §7 exactly, take a live unscripted query as planned, and be ready for the judge questions in doc 05 §8 — including the four hard ones added in v3 (hash-chain recompute attack, hierarchy overhead, VERITAS novelty, MNEMOS vs RAG).

## 5. One last honest note
You now have a genuinely comprehensive, internally consistent, self-contained spec — ten documents that reference each other correctly, grounded in six read-and-verified research sources, with a realistic toolchain and a step-by-step path from empty repo to demo day. The single biggest risk at this point isn't the plan — it's scope creep from continuing to add subsystems (a ninth acronym, a fourth model provider, a fifth tool). Everything above is genuinely buildable by a small team in six weeks **if you stop adding to it now** and start executing Step 0.
