# NEXUS UI/UX, Figma, and Stitch Design System

## 1. Design thesis

The UI must make invisible agent coordination understandable in five seconds. The winning visual is not “more neon”; it is an elegant **mission-control interface where every glowing connection corresponds to real work, evidence, or approval.**

## 2. Unique interaction concepts

### The Living Organization Canvas
A force-directed but stable organization graph. It begins as one central `Mission` node. When the organization is compiled, specialist nodes emerge around governance nodes. Lines animate only when an artifact changes ownership. Clicking a node opens its mandate and evidence, not a generic chat transcript.

### Decision Ledger Rail
A chronological, tamper-evident-looking rail of small cards:
`CEO selected RAG Architect -> reason: uploaded study material -> 2,000 token budget -> approved`.

### Evidence Gravity
Claims are rendered as small cards. Strong evidence makes a card sit close to the final blueprint; weak or assumed claims drift further away and receive an amber outline. This makes grounding intuitive without overclaiming numerical certainty.

### Time Travel Replay
A scrubber lets judges replay the organization run at 1x, 4x, or step-by-step. Events, graph topology, and artifact versions change together. This makes a prepared demo feel alive while keeping it honest.

### Counterfactual Lab
Three visual columns: Single Agent / Flat Swarm / NEXUS. Show output coverage, contradictions caught, evidence ratio, budget, latency, and judge score for a fixed task. Make no global performance claim.

## 3. Information architecture

```text
/                         Landing and mission input
/projects/:id/intake       Idea Contract editor
/projects/:id/live         Organization Canvas (primary live run)
/projects/:id/work         Task / artifact / evidence workspace
/projects/:id/blueprint    Final blueprint and exports
/lab                       Counterfactual Lab
/settings                  providers, demo mode, reduced motion
```

## 4. Screen specifications

### Screen 1: Landing
- Full height, dark atmospheric grid and quiet moving constellation background.
- Headline: “Turn one idea into a governed AI organization.”
- Large natural-language mission field with example chips.
- Controls: depth segmented control, budget pill, `Start mission` button.
- Below fold: three proof cards: Dynamic teams, Visible evidence, Human control.

### Screen 2: Intake / Idea Contract
- Left panel: original text and uploaded input chips.
- Centre: editable contract cards: objective, audience, success criteria, constraints, assumptions.
- Right: “NEXUS interpretation” confidence and questions.
- Bottom sticky action: `Compile organization`.

### Screen 3: Live Organization Canvas
- Header: Project name, run state, elapsed time, budget meter, `Stop` control.
- Centre 70%: organization graph with contextual zoom.
- Left rail: Mission + governance decision cards.
- Right rail: selected agent details and task tabs.
- Bottom: live event ticker; it collapses when not needed.
- Graph shape: Governance (three larger nodes) -> Pods (3–6 medium nodes) -> Assurance (two nodes) -> Blueprint (one destination node).

### Screen 4: Task detail
- 3-column layout: Input artifacts / output preview / reviewer verdict.
- Tabs: Brief, Evidence, Output, Revisions, Telemetry.
- Show output as readable prose first and raw JSON second.

### Screen 5: Approval Gate
- Centered decision card, not an alarming popup.
- “NEXUS needs your decision” heading.
- Statement, affected data/action, rationale, alternatives, risk, cost, and recommendation.
- Buttons: Approve; Ask for revision; Reject. Require a comment on Reject.

### Screen 6: Blueprint
- Paper-like reading surface over dark shell.
- Left document outline, main content, right provenance panel.
- Claim badges: `Evidence-backed`, `Assumption`, `Needs validation`.
- Export and `Replay how we got here` controls.

## 5. Design tokens

```css
--bg-0: #070912;
--bg-1: #0D1020;
--surface: rgba(18, 23, 43, 0.72);
--surface-solid: #151A30;
--text-primary: #F5F7FF;
--text-secondary: #A9B2D0;
--violet: #8B5CF6;
--cyan: #22D3EE;
--green: #34D399;
--amber: #FBBF24;
--red: #FB7185;
--border: rgba(169, 178, 208, 0.18);
--radius-card: 16px;
--shadow-glow: 0 0 40px rgba(139, 92, 246, .18);
```

Typography:
- Display: Space Grotesk 600–700
- UI/body: Inter 400–600
- Code/metrics: JetBrains Mono 400–500
- Minimum body 14px; primary reading text 16px; never rely only on color for status.

## 6. Component inventory

| Component | States |
|---|---|
| `MissionInput` | empty, typing, validating, ready |
| `DepthControl` | fast, balanced, deep |
| `AgentNode` | planned, queued, working, waiting, needs-revision, approved, failed |
| `TaskEdge` | dormant, active transfer, blocked, completed |
| `BudgetRing` | healthy, warning, capped |
| `EvidenceChip` | primary, official, secondary, uploaded, missing |
| `ClaimBadge` | evidence-backed, assumption, disputed, needs-validation |
| `ApprovalCard` | pending, approved, rejected, expired |
| `ArtifactPanel` | loading, draft, reviewed, revised, final |
| `TraceEvent` | model, tool, artifact, review, policy, approval |

## 7. Motion rules

- Respect `prefers-reduced-motion`.
- Node birth: 250ms scale/fade. No perpetual bouncing.
- Artifact transfer: one light pulse travelling along a line, tied to a real event.
- New review issue: subtle amber border transition, not a shake.
- Run completion: illuminate Blueprint node, then open a calm summary panel.
- Keep motion at 60fps; pause canvas animations when tab is hidden.

## 8. Figma workflow

1. Create variables for color, spacing (4px grid), typography, radius, elevation, status.
2. Build component library first: button, card, tabs, agent node, badge, drawer, graph edge.
3. Create desktop frames at 1440px and responsive frames at 390px. On mobile, replace graph canvas with a vertical organization timeline.
4. Prototype five critical interactions: compile, agent selection, task handoff, approval gate, replay.
5. Use real project language and structured fake data—never Lorem Ipsum.
6. Annotate every screen with backend state needed; this prevents a beautiful but impossible UI.

## 9. Stitch prompt: design direction

Paste this into Stitch to generate the visual starting point:

```text
Design a premium desktop web app called “NEXUS Organization OS”, an AI mission-control interface that turns a user’s project idea into a temporary team of AI agents. Visual style: sophisticated near-future intelligence operations center, calm and trustworthy, dark midnight navy background, glass surfaces, electric violet and cyan accents, verification green and risk amber. Avoid cyberpunk clutter, robots, cartoon avatars, and excessive neon.

Create a 1440px desktop dashboard for the “Live Organization” screen. Header has project title, LIVE status, elapsed time, token budget ring, and stop button. Main center area is a dynamic organization graph: three governance nodes at top labelled CEO, CTO, COO; five specialist pod nodes in the middle; Reviewer and Compliance nodes at bottom leading to a Final Blueprint node. Nodes show tiny status dots, confidence, and task counts. Draw elegant subtle connections with one active cyan artifact handoff. Left sidebar is a Decision Ledger with chronological decision cards. Right inspector panel shows selected agent mandate, permitted tools, input artifacts, output contract, and explanation for why this agent was selected. Bottom has a compact live event timeline. Use Space Grotesk headings, Inter body. Ensure high contrast, clear hierarchy, and accessible labeled status—not color alone.
```

## 10. Stitch prompt: landing page

```text
Create a responsive landing page for “NEXUS Organization OS.” Headline: “One idea. A governed AI organization.” Subheadline: “NEXUS forms the right AI team, verifies its work, and shows why every decision was made.” Place a large elegant mission input panel in the hero with placeholder “Describe the project you want to create…” and controls Fast, Balanced, Deep. Show three small interactive-looking proof cards: Dynamic organization, Evidence lineage, Human approval. Background is midnight navy with a minimal constellation and organizational-network motif. Style is premium, academic-expo-ready, trustworthy, dark glass, violet/cyan accents. No generic robot imagery.
```

## 11. Handoff checklist

- Export SVG icon assets and avoid raster screenshots for graph nodes.
- Record tokens and component variants in Figma Dev Mode.
- Define empty/loading/error states for every screen.
- Match status vocabulary exactly to backend task state.
- Test contrast, keyboard focus, and reduced motion before judging day.
