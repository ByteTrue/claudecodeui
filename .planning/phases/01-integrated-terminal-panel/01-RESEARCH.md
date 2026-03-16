# Phase 1: Integrated Terminal Panel - Research

**Researched:** 2026-03-16
**Domain:** Brownfield React workspace layout integration for an existing xterm.js + node-pty terminal
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- The terminal is a true bottom panel under the current workspace view, not a replacement full-page shell view.
- Opening the terminal must keep the current main workspace view visible above it.
- If the panel is open, it stays open while the user switches between main workspace views.
- The panel should span the full workspace width, including the editor area, rather than living only under the left content pane.
- Collapsing the panel should hide it fully rather than leaving a persistent bottom rail.
- Reuse the existing `Shell` control in the workspace chrome as the integrated terminal trigger.
- Opening the terminal should not change the current `activeTab`.
- If the terminal is already open and the user presses the trigger again, it should focus or bring forward the terminal rather than acting as a simple toggle-close.
- Replace the old full-page shell destination with the panel model instead of keeping both mental models alive.
- The first open on desktop should feel roughly one-third of the workspace height.
- After the user resizes the panel, reopening it should remember the last desktop height.
- Desktop resizing should allow a flexible range rather than a narrow fixed band.
- The resize affordance should be explicit, with a visible grab strip.

### Claude's Discretion
- Exact visual treatment of the terminal panel header and chrome.
- Animation and motion details for open/close transitions.
- Fine-grained min/max resize thresholds, as long as they honor the chosen "flexible range" behavior.
- Exact focus styling and polish for "bring terminal forward" interactions.

### Deferred Ideas (OUT OF SCOPE)
- Project-root launch behavior, multi-session tabs, mobile-specific behavior, and terminal hardening belong to later phases.
- Do not add split panes, deep shell automation, or page-reload persistence in this phase.

</user_constraints>

<research_summary>
## Summary

Phase 1 should not introduce a new terminal backend, a second socket path, or a second top-level navigation model. The repo already has the correct terminal stack: `@xterm/xterm` on the client, `node-pty` on the server, and `/shell` WebSocket transport between them. The phase is therefore a workspace-layout problem, not a terminal-engine problem.

The standard brownfield approach is to keep terminal runtime ownership inside the existing shell feature and move the integration boundary upward. In this repo that means `MainContent.tsx`, `AppContent.tsx`, and `useProjectsState.ts` become responsible for panel visibility and shared workspace layout, while `Shell.tsx`, `useShellRuntime.ts`, and `useShellTerminal.ts` remain the runtime surface.

**Primary recommendation:** Implement a workspace-level terminal panel host that keeps terminal visibility separate from `activeTab`, reuses the existing shell runtime unchanged where possible, and preserves the mounted terminal instance while the panel is visible or temporarily collapsed.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this phase are mostly the ones already in the repo:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.x | Workspace state and conditional rendering | Already drives the app shell and is the right place to introduce panel state |
| `@xterm/xterm` | 5.5.x | Terminal rendering surface | Industry-standard browser terminal renderer and already integrated here |
| `@xterm/addon-fit` | 0.10.x | Resize terminal to container | Standard companion for panel/drawer-based terminal layouts |
| `node-pty` | 1.1.x beta | PTY process backing | Already powers the server-side shell sessions |
| `ws` | 8.14.x | Terminal transport | Existing `/shell` WebSocket path already supports init/input/resize |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ResizeObserver` | Web platform | Observe container size changes | Use for panel drag resize and open/close fitting |
| browser `localStorage` | Web platform | Persist desktop panel size / open preference if desired | Use for last-known panel height and non-critical UI state |
| Tailwind CSS | 3.4.x | Panel chrome and resize affordance styling | Follow current feature-level styling patterns |
| `lucide-react` | 0.515.x | Trigger/handle icons | Reuse for terminal trigger and collapse affordances if needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing shell runtime | New terminal wrapper or second shell feature | Would fork lifecycle and regress stability immediately |
| Hand-rolled resize events | `react-resizable-panels` or similar | New dependency is unnecessary for one vertical panel with existing patterns available |
| `activeTab === 'shell'` routing | Shared panel visibility state | Shared panel state is required to meet the phase goal |

**Installation:**
```bash
# No new packages are required for Phase 1.
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/
│   ├── main-content/          # Main workspace host; add terminal panel region here
│   ├── shell/                 # Keep runtime surface, panel-specific chrome may live here
│   └── app/                   # AppContent / MobileNav trigger coordination
├── hooks/
│   └── useProjectsState.ts    # Extend with panel visibility + persisted desktop size
└── types/
    └── app.ts                 # Add panel-facing state types only if needed
```

### Pattern 1: Shared Workspace Panel Host
**What:** Treat the terminal as a persistent bottom region of the main workspace rather than one more mutually exclusive top-level tab.
**When to use:** When a feature must remain available alongside chat/files/git without taking over the page.
**Repo fit:** `src/components/main-content/view/MainContent.tsx` already owns the major workspace layout split and is the natural host for a shared bottom panel.

### Pattern 2: Runtime Reuse, Visibility Control Above
**What:** Keep shell runtime logic in `src/components/shell/` and move open/collapse/focus state to higher-level workspace state.
**When to use:** When the app already has a working runtime layer that should not be rewritten for layout work.
**Repo fit:** `useShellRuntime.ts`, `useShellConnection.ts`, and `useShellTerminal.ts` already handle init, socket lifecycle, and resize events. Reuse them.

### Pattern 3: Preserve Component Position for State Continuity
**What:** If the same shell component is meant to stay alive across workspace view switches, keep it rendered in a stable position and change visibility/layout around it rather than remounting it via `activeTab`.
**When to use:** When terminal continuity matters even before later phases add explicit session persistence.
**Repo fit:** Current `MainContent.tsx` conditionally mounts the shell only when `activeTab === 'shell'`; that is the exact behavior Phase 1 must stop relying on.

### Anti-Patterns to Avoid
- **A second integrated-terminal implementation:** Do not create another shell client beside `Shell.tsx` / `StandaloneShell.tsx`.
- **Panel behavior driven purely by `activeTab`:** This would preserve the old “shell is a page” model and fail INTE-01/02.
- **Collapse by unmounting with no remembered UI state:** This leads to brittle reopen behavior and resize resets.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but already have adequate solutions here:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Terminal rendering | A new terminal canvas/widget | Existing `Shell.tsx` + `@xterm/xterm` | Rendering, selection, clipboard, and prompt handling are already solved |
| Socket transport | A second `/terminal-panel` channel | Existing `/shell` init/input/resize flow | Phase 1 is not a transport problem |
| Resize tracking | Window-only resize math | Existing `ResizeObserver` pattern from `useShellTerminal.ts` and drag-resize pattern from `useEditorSidebar.ts` | Panel resizing depends on container size, not only viewport size |
| Panel persistence model | Custom DOM-driven state outside React | `useProjectsState.ts` / shared workspace state + `localStorage` | Keeps layout consistent with the rest of the app and survives normal view switches |

**Key insight:** Brownfield terminal work fails when teams rebuild solved runtime layers instead of isolating the real gap, which here is workspace composition and navigation semantics.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Keeping shell as a real page while also adding a panel
**What goes wrong:** Users end up with two terminal mental models: one from the `shell` tab and another from the new panel.
**Why it happens:** Reusing the old nav shape is easier than rewiring shared workspace state.
**How to avoid:** Repurpose the current `Shell` trigger into panel access and remove the full-page shell behavior in this phase.
**Warning signs:** `activeTab` still flips to `shell`, or both the shell page and panel remain reachable.

### Pitfall 2: Unmounting the panel every time visibility changes
**What goes wrong:** Reopen behavior feels fragile, panel size resets, and the runtime lifecycle becomes hard to reason about.
**Why it happens:** The easiest JSX shape is `{isOpen && <Shell />}`, but that couples visibility to mount lifetime.
**How to avoid:** Separate “rendered in workspace tree” from “currently expanded/visible.”
**Warning signs:** Reopen always creates a fresh terminal surface or requires extra reconnect work in Phase 1.

### Pitfall 3: Fitting only on initial mount
**What goes wrong:** Terminal rows/cols are wrong after dragging, expanding, or restoring the panel.
**Why it happens:** `xterm` fitting is container-sensitive; bottom panels change container height repeatedly.
**How to avoid:** Refit after open, after drag-resize settles, and after layout changes that affect the terminal container.
**Warning signs:** Terminal becomes correct only after manual window resize.

### Pitfall 4: Letting panel state leak into future-phase scope
**What goes wrong:** Planning drifts into project cwd logic, multi-tab session management, or mobile keyboard handling.
**Why it happens:** Terminal panel and terminal runtime are tightly related.
**How to avoid:** Keep Phase 1 limited to panel host, trigger behavior, collapse/reopen, and desktop resizing.
**Warning signs:** Plan tasks start modifying session identity or transport semantics beyond what panel integration needs.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from current repo and primary docs:

### Container-based terminal fitting
```typescript
// Reuse the existing pattern in src/components/shell/hooks/useShellTerminal.ts:
// observe terminal container changes -> call fitAddon.fit() -> send resize over /shell.
```

### Shared panel visibility above runtime ownership
```typescript
// Direction for Phase 1:
// workspace state owns isTerminalPanelOpen + terminalPanelHeight
// shell runtime remains inside src/components/shell/
// panel trigger focuses/opens without changing activeTab
```

### Reuse trigger chrome instead of adding a second destination
```typescript
// Current trigger surfaces:
// - src/components/main-content/view/subcomponents/MainContentTabSwitcher.tsx
// - src/components/app/MobileNav.tsx
// Phase 1 should reinterpret the shell trigger as panel access, not a page switch.
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Treat integrated terminal as a dedicated route/page | Treat terminal as workspace infrastructure that coexists with editor/content | Long-standing editor UX pattern, reinforced by browser IDEs | Phase 1 should model shared workspace chrome, not route replacement |
| Manual geometry math only on window resize | Container-aware fitting with addon + observer-driven updates | Modern xterm/browser layouts | Panel drag-resize should be container-driven |
| Desktop-only integrated terminal assumptions | Explicit planning for mobile viewport/keyboard issues | Modern browser IDEs increasingly need touch-aware layout | Phase 1 can defer mobile implementation, but must not block later phases structurally |

**New tools/patterns to consider:**
- Visual viewport awareness for later mobile phases where the on-screen keyboard changes visible height.
- Preserving component state through stable tree position rather than remounting via tab routing.

**Deprecated/outdated:**
- A second terminal renderer or socket layer for “integrated” mode.
- Treating the shell tab as a separate destination if the product goal is shared workspace flow.
</sota_updates>

<open_questions>
## Open Questions

1. **How much of the current `ShellHeader` survives into the panel?**
   - What we know: Current header is full-page oriented and likely too heavy for a compact bottom panel.
   - What's unclear: Whether Phase 1 should build a slimmer panel header immediately or reuse/adapt the current one.
   - Recommendation: Let planner choose the lightest viable header that supports collapse/focus/restart expectations without introducing later-phase tab chrome.

2. **Should panel-open state itself persist across reloads?**
   - What we know: The user only explicitly locked remembered desktop height, not reload persistence.
   - What's unclear: Whether open/closed state should be restored after reload in Phase 1.
   - Recommendation: Treat remembered size as in-scope; treat reload persistence as discretionary and keep it lightweight if added.
</open_questions>

## Validation Architecture

Phase 1 can achieve fast feedback without adding a new test framework:

- **Quick validation loop:** targeted lint on modified workspace/shell files, then local typecheck before final completion
- **Full validation loop:** `npm run lint && npm run typecheck`
- **Manual verification needed:** open a project, trigger the bottom panel from the existing shell control, confirm collapse/reopen, drag-resize, and workspace continuity across chat/files/git

This phase should not introduce a large test-harness setup just to validate layout behavior. Validation should stay fast and focus on static safety plus manual workflow confirmation.

<sources>
## Sources

### Primary (HIGH confidence)
- xterm.js docs: https://xtermjs.org/docs/
- xterm.js addon guide: https://xtermjs.org/docs/guides/using-addons/
- xterm.js link handling guide: https://xtermjs.org/docs/guides/link-handling/
- xterm.js Terminal API: https://xtermjs.org/docs/api/terminal/classes/terminal/
- node-pty README: https://github.com/microsoft/node-pty
- MDN ResizeObserver: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- React docs on preserving/resetting state: https://react.dev/learn/preserving-and-resetting-state

### Secondary (HIGH confidence in repo-specific behavior)
- `src/components/main-content/view/MainContent.tsx`
- `src/components/main-content/view/subcomponents/MainContentTabSwitcher.tsx`
- `src/components/app/MobileNav.tsx`
- `src/hooks/useProjectsState.ts`
- `src/components/shell/view/Shell.tsx`
- `src/components/shell/hooks/useShellRuntime.ts`
- `src/components/shell/hooks/useShellTerminal.ts`
- `server/index.js`

</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: React workspace layout + existing xterm/node-pty shell
- Ecosystem: xterm.js addons, ResizeObserver, state preservation patterns
- Patterns: shared bottom panel host, runtime reuse, trigger repurposing
- Pitfalls: page-vs-panel split, remount resets, resize correctness, scope drift

**Confidence breakdown:**
- Standard stack: HIGH - repo already contains the relevant runtime stack
- Architecture: HIGH - the affected integration points are clear in current code
- Pitfalls: HIGH - directly observable from the current `activeTab` and shell mount model
- Code examples: MEDIUM - examples are repo-informed rather than lifted from a dedicated phase-research agent

**Research date:** 2026-03-16
**Valid until:** 2026-04-15
</metadata>

---

*Phase: 01-integrated-terminal-panel*
*Research completed: 2026-03-16*
*Ready for planning: yes*
