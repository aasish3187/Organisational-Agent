# NEXUS — UI/UX, Figma, and Stitch Design System (v3.1 — Liquid Glass)

## 1. Design thesis

The UI must make invisible agent coordination understandable in five seconds. The visual language is **Liquid Glass** — the translucent, refractive material system introduced with iOS 26 — applied to a mission-control interface: deep midnight depth behind, glass layers in front, and **every glowing connection corresponding to real work, evidence, or approval**.

Glass here is not decoration; it is the hierarchy system:
- **Depth = importance.** Active and decision-critical surfaces sit on thicker, more refractive glass; background context recedes into thinner glass.
- **Translucency = honesty.** The run's context (graph, ledger, evidence) always shimmers through behind panels — nothing is hidden behind opaque walls.
- **Light = activity.** Specular highlights and pulses animate only on real events, so a lit edge always means something happened.

## 2. Material system: Liquid Glass

### 2.1 Principles
1. **Content first, glass second.** Glass frames content; it never competes with it.
2. **True translucency.** Every panel reveals blurred, saturated context behind it via `backdrop-filter`. No flat frosted-gray fills — if nothing shows through, it isn't glass.
3. **Layered depth, capped.** Maximum **three** stacked glass layers anywhere on screen. More than that destroys both readability and frame rate.
4. **Specular edges.** Every glass surface carries a lit top edge (inner highlight) and a subtle gradient border, as if lit from above — consistent single light source across the whole app.
5. **Fluidity.** Glass morphs, never cuts: panels expand from their origin, corners stay concentric, state changes animate position/scale/opacity — never animate the blur itself.
6. **Signal colors live in the glass.** Violet/cyan/green/amber/red are emitted *through* the glass as glows and edge tints, not painted on top as solid fills.

### 2.2 Glass tiers

| Tier | Use for | Background | Backdrop filter | Border |
|---|---|---|---|---|
| `glass-thin` | chips, pills, node badges, event ticker items, tag pills | `rgba(255,255,255,0.04)` | `blur(12px) saturate(160%)` | `1px rgba(255,255,255,0.10)` |
| `glass-regular` | ledger cards, agent inspector, task cards, rails, graph side panels | `rgba(255,255,255,0.07)` | `blur(20px) saturate(180%)` | `1px rgba(255,255,255,0.12)` |
| `glass-thick` | drawers, approval card, blueprint reading pane, Memory panel, modals | `rgba(13,16,32,0.60)` (tinted — readability floor) | `blur(28px) saturate(200%)` | `1px rgba(255,255,255,0.14)` |

`glass-thick` is deliberately tinted navy rather than white-transparent: it is used wherever long text must be read, and pure transparency under a busy aurora fails contrast. This is the iOS-style "vibrancy over darkness" treatment, not a compromise.

### 2.3 Reference CSS recipes (implement exactly, then polish)

```css
.glass-card {                                   /* glass-regular */
  background: linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.12);
  border-top-color: rgba(255,255,255,0.22);     /* specular top edge */
  box-shadow: 0 8px 32px rgba(0,0,0,0.35),
              inset 0 1px 0 rgba(255,255,255,0.12);
  border-radius: 20px;
}
/* Concentric corners: inner radius = outer radius − padding.
   A 20px card with 12px padding contains 8px-radius children. */

.glass-chip  { /* glass-thin: same pattern, blur(12px), bg 0.04, radius 999px */ }
.glass-pane  { /* glass-thick: blur(28px), bg rgba(13,16,32,0.60), radius 24px */ }
```

Optional pointer specular (desktop only, cheap): a faint radial highlight on `glass-regular`/`thick` surfaces that follows the cursor via CSS custom properties updated on `pointermove` (throttled with `requestAnimationFrame`). Disable under `prefers-reduced-motion` and on touch.

### 2.4 Ambient background — what the glass refracts
Glass over nothing looks like mud. Every screen has a living depth layer behind all content:

```css
.aurora {
  background:
    radial-gradient(60% 80% at 18% 28%, rgba(139,92,246,0.22), transparent 60%),
    radial-gradient(50% 70% at 82% 72%, rgba(34,211,238,0.16), transparent 60%),
    radial-gradient(40% 55% at 60% 10%, rgba(52,211,153,0.07), transparent 65%),
    var(--bg-0);
}
```
- Two gradient blobs drift extremely slowly (60-90s loop) using `transform: translate3d` on pseudo-elements — never animate `background-position`.
- A faint constellation dot-grid (2% opacity) sits above the aurora for the "organization network" motif.
- During a run, the aurora breathes almost imperceptibly with run state: calm at idle, slightly brighter cyan while agents work, one soft green bloom on completion.

### 2.5 Prohibitions
- No opaque solid panels anywhere except tooltips and context menus.
- No more than 3 stacked `backdrop-filter` layers per screen.
- No blur radius above 32px.
- No body text placed directly on `glass-thin` over the aurora — text containers are `glass-regular` minimum, long-form reading is `glass-thick`.
- No animating `backdrop-filter`, `filter`, or `box-shadow` per frame — animate `transform` and `opacity` only.
- No neon glow overload: glows are reserved for state (active edge, verification green, risk amber), never ambient decoration.

## 3. Interaction concepts

### The Living Organization Canvas
A force-directed but stable organization graph over the aurora. It begins as one central `Mission` node (a thick glass orb with the violet core glow). When the organization is compiled, specialist nodes emerge around governance nodes — each node is a **glass lens**: translucent disc, specular rim, status dot, confidence ring. Lines are thin light beams; a beam animates only when an artifact changes ownership (one cyan pulse). Clicking a node opens its mandate and evidence in a glass inspector — not a generic chat transcript.

### Decision Ledger Rail
A chronological rail of `glass-thin` cards over the canvas edge:
`CEO selected RAG Architect -> reason: uploaded study material -> 2,000 token budget -> approved`.
The **Verify** button sits in the rail header as a prominent glass capsule.

### Evidence Gravity
Claims are rendered as small glass cards. Strong evidence makes a card sit close to the final blueprint; weak or assumed claims drift further away and receive an amber edge tint. Grounding becomes intuitive without overclaiming numerical certainty.

### Time Travel Replay
A scrubber lets judges replay the organization run at 1x, 4x, or step-by-step. Events, graph topology, and artifact versions change together. (Implemented via the demo-replay pipeline — doc 02 §12.)

### Counterfactual Lab
Three glass columns: Single Agent / Flat Swarm / NEXUS. Show output coverage, contradictions caught, evidence ratio, budget, latency, and judge score for a fixed task. Make no global performance claim.

### Verify Action (VERITAS)
A "Verify" capsule button in the Decision Ledger rail header, always visible during and after a run. On click: a subtle scan-line of light travels down the ledger in under 2 seconds; each glass card briefly flashes a green edge-glow as it's confirmed; a summary chip appears — "142 events verified, chain intact" — or, if broken, a red marker at the exact point of failure with the cards below dimmed. Calm and precise, like a lab instrument — only the failure state uses red.

### Memory Panel (MNEMOS)
A `glass-thick` drawer, accessible from a small badge on the Mission node (only appears when atoms were retrieved). Two zones: "Retrieved from memory" (compact glass cards, soft cyan left-edge glow — "this came from before") and "New atoms learned" (soft green left-edge glow — "this is new knowledge"). If no atoms matched: one calm line — "No prior similar runs — this is the first of its kind," never an empty broken-looking void.

## 4. Information architecture

```text
/                         Landing and mission input
/projects/:id/intake       Idea Contract editor
/projects/:id/live         Organization Canvas (primary live run)
/projects/:id/work         Task / artifact / evidence workspace
/projects/:id/blueprint    Final blueprint and exports
/lab                       Counterfactual Lab
/settings                  providers, demo mode, reduced motion
```

## 5. Screen specifications

### Screen A: Landing
- Full-height aurora with slow-drifting violet/cyan blobs and faint constellation grid.
- Headline in Space Grotesk: "Turn one idea into a governed AI organization."
- Hero: one large `glass-thick` mission input capsule with inner specular highlight, example chips (`glass-thin`), depth segmented control as a glass pill group, `Start mission` as the single violet-glow glass CTA.
- Below fold: three proof cards (`glass-regular`, hover lifts 2px + brightens top edge): Dynamic teams, Visible evidence, Human control.

### Screen B: Intake / Idea Contract
- Left panel (`glass-regular`): original text and uploaded input chips.
- Centre: editable contract cards (`glass-regular`): objective, audience, success criteria, constraints, assumptions.
- Right (`glass-regular`): "NEXUS interpretation" confidence and questions.
- Bottom sticky action bar (`glass-thick` floating capsule): `Compile organization`.

### Screen C: Live Organization Canvas
- Header (`glass-thin` floating bar): project name, run state, elapsed time, budget meter, `Stop` control.
- Centre 70%: organization graph over the aurora with contextual zoom.
- Left rail (`glass-regular` stack): Mission + governance decision cards, **Verify capsule** in the rail header.
- Right rail (`glass-regular`): selected agent details and task tabs.
- Bottom: live event ticker (`glass-thin`); collapses when not needed.
- Graph shape: Governance (three larger lens nodes) -> Pods (3–6 medium) -> Assurance (two) -> Blueprint (one destination orb).
- **Memory badge** on the Mission node (only when MNEMOS retrieved atoms); clicking opens the Memory drawer alongside the agent-inspector rail.

### Screen D: Task detail / Workstream
- 3-column layout of `glass-regular` panes: Input artifacts / output preview / reviewer verdict.
- Tabs as glass pill group: Brief, Evidence, Output, Revisions, Telemetry.
- Output as readable prose first, raw JSON second (JetBrains Mono on `glass-thin` inset).

### Screen E: Approval Gate
- Centered `glass-thick` decision card floating over a dimmed canvas — not an alarming popup.
- "NEXUS needs your decision" heading.
- Statement, affected data/action, rationale, alternatives, risk, cost, and recommendation.
- Buttons: Approve (green edge-glow); Ask for revision; Reject (requires a comment).

### Screen F: Blueprint
- `glass-thick` reading pane (the readability-floor tier) over the dark aurora — long-form text must be effortless.
- Left document outline, main content, right provenance panel (both `glass-regular`).
- Claim badges: `Evidence-backed` (green), `Assumption` (amber), `Needs validation`.
- Export, `Replay how we got here`, and **"Verify integrity"** controls as glass capsules beside Export.

### Screen G: Counterfactual Lab
- Three glass columns per §3; "Not measured yet" state until real runs exist — a calm empty glass frame, never a broken void.

## 6. Design tokens

```css
/* Depth */
--bg-0: #05070F;                 /* deep space base under the aurora */
--bg-1: #0D1020;
--aurora-violet: rgba(139, 92, 246, 0.22);
--aurora-cyan: rgba(34, 211, 238, 0.16);
--aurora-green: rgba(52, 211, 153, 0.07);

/* Glass */
--glass-thin-bg: rgba(255, 255, 255, 0.04);
--glass-regular-bg: rgba(255, 255, 255, 0.07);
--glass-thick-bg: rgba(13, 16, 32, 0.60);
--glass-blur-thin: blur(12px) saturate(160%);
--glass-blur-regular: blur(20px) saturate(180%);
--glass-blur-thick: blur(28px) saturate(200%);
--glass-border: 1px solid rgba(255, 255, 255, 0.12);
--glass-edge-top: rgba(255, 255, 255, 0.22);   /* specular top edge */
--glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.12);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);

/* Signals (emitted through glass, not painted on it) */
--text-primary: #F5F7FF;
--text-secondary: #AAB3D2;
--violet: #8B5CF6;
--cyan: #22D3EE;
--green: #34D399;
--amber: #FBBF24;
--red: #FB7185;

/* Shape */
--radius-chip: 999px;
--radius-card: 20px;
--radius-pane: 24px;
--shadow-glow-violet: 0 0 40px rgba(139, 92, 246, 0.18);
--shadow-glow-cyan: 0 0 32px rgba(34, 211, 238, 0.16);
```

Typography:
- Display: Space Grotesk 600–700
- UI/body: Inter 400–600
- Code/metrics/hashes: JetBrains Mono 400–500 — used specifically for any rendered hash value in the Verify interaction, reinforcing "this is cryptographic, not decorative"
- Minimum body 14px; primary reading text 16px; never rely only on color for status.

## 7. Component inventory

| Component | Glass tier | States |
|---|---|---|
| `MissionInput` | thick | empty, typing, validating, ready |
| `DepthControl` | thin | fast, balanced, deep |
| `AgentNode` | lens (thin + rim) | planned, queued, working, waiting, needs-revision, approved, failed |
| `TaskEdge` | beam | dormant, active transfer, blocked, completed |
| `BudgetRing` | thin | healthy, warning, capped |
| `EvidenceChip` | thin | primary, official, secondary, uploaded, missing |
| `ClaimBadge` | thin | evidence-backed, assumption, disputed, needs-validation |
| `ApprovalCard` | thick | pending, approved, rejected, expired |
| `ArtifactPanel` | regular | loading, draft, reviewed, revised, final |
| `TraceEvent` | thin | model, tool, artifact, review, policy, approval |
| `VerifyAction` | capsule (thin) | idle, verifying (scan animation), verified (green chip), broken (red marker + index) |
| `MemoryAtomCard` | regular | retrieved (cyan edge), newly-written (green edge), empty-state |

## 8. Motion rules

- Respect `prefers-reduced-motion`: glass becomes static (no drift, no shimmer, no scan-line travel — verification result appears instantly).
- Node birth: 250ms scale/fade with a brief specular rim flash. No perpetual bouncing.
- Artifact transfer: one cyan light pulse travelling along a beam, tied to a real event.
- Panel appearance: glass lands with 200ms scale(0.98→1) + fade from its origin point — iOS-style morph, never a hard cut.
- Hover/press: lift 1-2px + brighten top edge (transform + opacity only). Optional pointer specular per §2.3.
- New review issue: subtle amber edge-glow transition, not a shake.
- Run completion: Blueprint orb illuminates, one soft green bloom in the aurora, then a calm summary panel.
- Verify scan-line capped at 2 seconds regardless of event count (batch confirmations; never animate hundreds of cards individually).
- Keep motion at 60fps; pause aurora drift and canvas animations when the tab is hidden.

## 9. Performance rules (demo-day survival — non-negotiable)

Liquid glass dies on weak GPUs. The expo laptop + projector is the worst case; budget for it:
- **Max 3 stacked `backdrop-filter` layers** visible at once (e.g., aurora-free base + rail + drawer). Audit every screen.
- **Never animate `backdrop-filter`, `filter`, or `box-shadow`.** Animate `transform`/`opacity` only; put animated glass on `will-change: transform`.
- Blur ≤ 24px on anything that moves or sits over the animated canvas; 28px reserved for static thick panes.
- React Flow canvas: nodes are pre-styled glass DOM nodes; do not apply `backdrop-filter` to edges (edges are gradient strokes, not glass).
- If DevTools Performance shows any frame > 16ms during the demo choreography, downgrade: reduce blur radii one step, freeze the aurora drift, disable pointer specular — in that order.
- Test on the actual expo laptop and at 390px before Week 6, not after.

## 10. Accessibility on glass

- Text contrast is measured **against the worst-case background** (aurora blob directly behind), not against an average. Body text lives on `glass-regular` minimum; long-form on `glass-thick`.
- Status is never blur/glow alone: every state pairs glow with an icon and/or label text.
- Keyboard focus rings are solid 2px `--cyan` with a dark underlay so they read over any glass.
- Reduced-motion users get full functionality with static glass (§8).

## 11. Figma workflow

1. Create variables for color, spacing (4px grid), typography, radius, elevation, glass tier, status.
2. Build component library first: button, card, tabs, agent node, badge, drawer, graph edge — each in its glass tier. Figma cannot truly replicate `backdrop-filter`; approximate with background-blur on duplicated content frames and **annotate every glass component with its CSS tier** (thin/regular/thick) for implementation.
3. Create desktop frames at 1440px and responsive frames at 390px. On mobile, replace graph canvas with a vertical organization timeline.
4. Prototype six critical interactions: compile, agent selection, task handoff, approval gate, replay, **Verify**.
5. Use real project language and structured fake data — never Lorem Ipsum.
6. Annotate every screen with backend state needed; this prevents a beautiful but impossible UI.

## 12. Stitch prompts

### Design direction
```text
Design a premium desktop web app called "NEXUS Organization OS", an AI mission-control interface that turns a user's project idea into a temporary team of AI agents. Visual style: Apple iOS 26 Liquid Glass design language — translucent refractive glass panels with backdrop blur, specular highlights along top edges, subtle gradient borders, layered depth over a deep midnight-navy aurora background with slow violet and cyan gradient blobs and a faint constellation grid. Calm, trustworthy, content-first. Avoid cyberpunk clutter, robots, cartoon avatars, opaque flat panels, and excessive neon.

Create a 1440px desktop dashboard for the "Live Organization" screen. Header is a floating thin-glass bar with project title, LIVE status, elapsed time, token budget ring, and stop button. Main center area is a dynamic organization graph of translucent glass lens nodes: three governance nodes at top labelled CEO, CTO, COO; five specialist pod nodes in the middle; Reviewer and Compliance nodes at bottom leading to a Final Blueprint glass orb. Nodes show tiny status dots, confidence rings, and task counts; one active cyan light pulse travels along a connection. Left sidebar is a Decision Ledger of thin-glass chronological decision cards with a prominent "Verify" glass capsule button at the top. Right inspector panel is a regular-glass pane showing selected agent mandate, permitted tools, input artifacts, output contract, and why this agent was selected. Bottom has a compact live event ticker in thin glass. Use Space Grotesk headings, Inter body. High contrast text on glass, clear hierarchy, accessible labeled status — not color alone.
```

### Verify interaction
```text
Design a "Verify" interaction component for an AI mission-control dashboard in Apple iOS 26 Liquid Glass style (deep midnight-navy aurora background, translucent glass panels, violet/cyan accents, verification green). Show a vertical chain of small connected glass blocks (like interlocking chain links), each labeled with a short agent name and a truncated monospace hash. Include a "Verify Chain" glass capsule button above the chain. Show one state where a scan-line of light travels down the chain and each glass block briefly glows a soft green edge with a checkmark, ending in a small glass confirmation chip reading "142 events verified, chain intact." Also show a broken-chain state where one block glows red with a small warning icon and the blocks below are dimmed. Style: precise, technical, calm — like a lab instrument reading rather than an error dialog.
```

### Memory panel
```text
Design a "Memory" side drawer for an AI mission-control dashboard in Apple iOS 26 Liquid Glass style (deep midnight-navy aurora background, thick translucent glass pane with specular top edge, violet/cyan accents). Two sections stacked vertically: "Retrieved from memory" containing 2-3 small glass cards with a soft cyan left-edge glow, each showing a short name, a row of small glass tag pills, and a faint reference to a past project; and "New atoms learned" below it, containing 1-2 similar cards with a soft green left-edge glow instead. Include a collapsed/empty state showing a single calm centered line of text: "No prior similar runs — this is the first of its kind." Style: quiet, archival, like a well-organized knowledge library rendered in glass.
```

### Landing page
```text
Create a responsive landing page for "NEXUS Organization OS" in Apple iOS 26 Liquid Glass style. Headline: "One idea. A governed AI organization." Subheadline: "NEXUS forms the right AI team, verifies its work, and shows why every decision was made." Place a large elegant thick-glass mission input capsule in the hero with inner specular highlight, placeholder "Describe the project you want to create…" and a glass pill control Fast, Balanced, Deep, plus one violet-glow glass CTA button. Show three small interactive-looking glass proof cards: Dynamic organization, Evidence lineage, Human approval. Background is a deep midnight-navy aurora with slow violet and cyan gradient blobs and a faint constellation/organizational-network motif. Style is premium, academic-expo-ready, trustworthy, translucent layered glass. No generic robot imagery, no opaque flat panels.
```

## 13. Handoff checklist

- Export SVG icon assets and avoid raster screenshots for graph nodes.
- Record tokens, glass tiers, and component variants in Figma Dev Mode.
- Define empty/loading/error states for every screen (empty states are calm glass frames with one line of text, never broken voids).
- Match status vocabulary exactly to backend task state.
- Test contrast against worst-case aurora backgrounds, keyboard focus over glass, and reduced motion before judging day.
- Test the Verify animation at both a small event count (~10, Fast-mode demo run) and a large one (~150+, Deep-mode run) to confirm the 2-second cap holds at both scales.
- Run the performance audit from §9 on the expo laptop: no frame > 16ms during the full demo choreography; apply the downgrade ladder if needed.
- View the app under expo lighting (bright hall, projector washout): if glass contrast dies on the projector, switch the demo display to the laptop screen.
