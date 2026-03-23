# Phase 4: Mobile And Workflow Continuity - Research

**Researched:** 2026-03-23
**Domain:** Brownfield mobile continuity and viewport adaptation for an existing React + xterm + node-pty integrated terminal panel
**Confidence:** HIGH

<user_constraints>
## User Constraints

### Locked Decisions
- The terminal stays an integrated bottom-panel workspace feature, not a dedicated full-page shell route.
- Mobile is a first-version requirement: the terminal must support the core loop of open, input, output, and tab management on phones.
- Phase 3 tab identity, restart semantics, and PTY reuse contracts remain the foundation; Phase 4 should not replace `/shell`, `node-pty`, or the current tab model.
- Normal app navigation should not force users to lose terminal state or leave the app just to keep a command running.
- The terminal should continue to feel lightweight and natural inside the existing workspace UI instead of growing a second heavyweight shell chrome.

### the agent's Discretion
- The exact default mobile sheet height and drag range, as long as the panel remains usable with the software keyboard open.
- Whether mobile auxiliary controls live in the header, a bottom shortcut tray, or another in-panel touch surface.
- How much project identity text stays visible in the mobile header before truncation.

### Deferred Ideas (OUT OF SCOPE)
- Full tab/session restore across page reloads.
- Copy/paste hardening, safe-link behavior, and transport recovery UX beyond the continuity needed for the mobile core loop.
- Split panes, advanced shell awareness, or deeper editor/chat-to-terminal automation.
- A second shell transport or a dedicated mobile shell route.

</user_constraints>

<research_summary>
## Summary

Phase 3 proved that tab identity is now correct: each integrated terminal tab owns its own PTY lifecycle, restart path, and stored status. Phase 4 does not need another transport change. The remaining gap is UI lifecycle.

Today the integrated terminal is still desktop-first. `MainContent.tsx` returns early for loading/empty workspace states, so the panel disappears entirely in those states. `IntegratedTerminalPanel.tsx` returns `null` whenever the panel is closed, which unmounts the shell host and relies on backend keepalive plus buffered replay instead of preserving the live xterm view locally. On mobile, the panel still uses the same persisted pixel height as desktop, has no visual-viewport strategy, and keeps desktop-oriented auxiliary UI like the fixed right-side `TerminalShortcutsPanel`.

**Primary recommendation:** keep the active shell host mounted while tabs exist, separate "panel visible" from "shell mounted", and move the panel render outside the selected-project early-return path so normal workspace navigation does not tear down the terminal surface. Then add a mobile-specific bottom-sheet controller driven by `window.visualViewport` and safe-area tokens, plus touch-first tab/shortcut/output affordances inside the panel itself. This satisfies same-session continuity and mobile core usability without crossing into reload persistence or Phase 5 hardening work.
</research_summary>

<standard_stack>
## Standard Stack

Phase 4 should continue on the current repo stack.

### Core
| Library / API | Source | Purpose | Why It Stays Standard Here |
|---------------|--------|---------|----------------------------|
| React 18 state/effects | `src/hooks/**`, `src/components/**` | Own panel visibility, mobile sheet state, and mounted-shell continuity | Existing workspace and terminal state already live in React |
| `@xterm/xterm` + `@xterm/addon-fit` | `src/components/shell/hooks/useShellTerminal.ts` | Render the terminal surface and refit after viewport changes | Existing terminal runtime is already stable enough to extend |
| `window.visualViewport` | browser runtime | Track keyboard-driven viewport shrink and mobile sheet limits | Mobile keyboard behavior is the main new Phase 4 risk |
| existing `/shell` WebSocket + `node-pty` path | `server/index.js`, `src/components/shell/hooks/**` | Preserve process state while UI visibility changes | PTY keepalive and tab identity are already solved in Phase 3 |

### Supporting
| Library / API | Source | Purpose | When To Use |
|---------------|--------|---------|-------------|
| `useDeviceSettings` | `src/hooks/useDeviceSettings.ts` | Existing mobile/desktop mode split | Any new mobile-only layout branch |
| Safe-area CSS variables | `src/index.css` | Align terminal sheet and shortcut tray above nav + device insets | Mobile-only panel positioning and bottom padding |
| `touch-manipulation` patterns | `src/components/app/MobileNav.tsx`, shared UI primitives | Build touch-friendly tab and shortcut controls | Any mobile-only control with repeated taps |
| `useQuickSettingsDrag` pattern | `src/components/quick-settings-panel/hooks/useQuickSettingsDrag.ts` | Reference for touch drag math and body-scroll locking | Mobile sheet resize/drag behavior |

### Alternatives Rejected
| Instead Of | Rejected Approach | Why Not In Phase 4 |
|------------|-------------------|--------------------|
| Mounted-but-hidden integrated panel | Keep unmounting the shell host whenever the panel closes | Same-session continuity would still depend on buffered replay and risk lost local output context |
| Visual viewport handling | Reuse the desktop fixed pixel height on mobile | Software keyboard and browser chrome changes break desktop assumptions immediately |
| In-panel mobile controls | Reuse the desktop fixed right-side shortcut drawer on phones | It wastes horizontal space and competes with the bottom-sheet mental model |
| Existing shell transport | Create a mobile-only shell route or transport path | Violates the brownfield constraint and duplicates runtime behavior |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Mounted shell lifecycle separate from panel visibility
**What:** Keep the active `StandaloneShell` mounted while terminal tabs exist, and treat `isOpen` as a visibility/focus flag rather than a mount/unmount flag.
**Why:** Same-session continuity depends on preserving the live xterm host, not only the backend PTY.
**Repo fit:** `IntegratedTerminalPanel.tsx` already receives both `isOpen` and the active tab identity, so visibility can be decoupled from mount in one place.

### Pattern 2: Render the terminal panel outside workspace empty/loading short-circuits
**What:** Replace `MainContent.tsx` early returns with a `workspaceContent` branch and always render the terminal panel after the workspace body.
**Why:** Loading or empty project states should not implicitly destroy an active integrated terminal if tabs still exist.
**Repo fit:** `MainContent.tsx` already derives `boundProject` and `boundSession` from the active terminal tab independently from `selectedProject`.

### Pattern 3: Mobile terminal uses a visual-viewport-aware sheet, not desktop height persistence
**What:** Add a mobile-specific sheet controller that clamps height from `window.visualViewport?.height ?? window.innerHeight`, reserves space for mobile nav/safe area, and supports touch drag.
**Why:** Fixed desktop pixel heights do not survive soft-keyboard and browser-chrome movement.
**Repo fit:** The repo already has safe-area tokens in `src/index.css` and a touch-drag reference in `useQuickSettingsDrag.ts`.

### Pattern 4: Auxiliary mobile controls belong inside the terminal panel
**What:** Convert mobile shortcut/help affordances into an in-panel tray or row instead of a fixed right-side drawer.
**Why:** Phones need controls close to the terminal content and reachable with the thumb while the keyboard is open.
**Repo fit:** `TerminalShortcutsPanel.tsx` is already a separable subcomponent and can branch by `isMobile`.

### Pattern 5: Touch-first terminal chrome prioritizes legibility over desktop density
**What:** Increase tap targets, keep tab actions horizontally scrollable, and add bottom padding so the newest terminal lines do not sit under floating controls.
**Why:** Mobile success is defined by core usability, not by preserving the exact desktop chrome density.
**Repo fit:** The repo already uses `touch-manipulation`, safe-area padding, and mobile-specific nav/header variants elsewhere.

### Anti-Patterns to Avoid
- **Do not treat backend PTY keepalive as a complete substitute for mounted UI continuity.**
- **Do not keep the current fixed right-side shortcut drawer on mobile.**
- **Do not reuse desktop-only pixel heights or row-resize behavior on phones.**
- **Do not turn Phase 4 into full reload persistence or Phase 5 disconnect hardening.**
- **Do not add a dedicated mobile shell route that bypasses the integrated panel.**
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile viewport behavior | A second shell runtime for mobile | Existing shell runtime plus a mobile sheet controller | Keeps one terminal lifecycle and one PTY model |
| Sheet drag behavior | Ad-hoc touch math in multiple components | A dedicated mobile-sheet hook modeled after `useQuickSettingsDrag` | Centralizes drag clamping and body-scroll locking |
| Continuity across view changes | Reconstruct the terminal from backend replay every time | Keep the active shell mounted while tabs exist | Preserves local xterm state and reduces reconnect churn |
| Mobile controls | Desktop side drawer squeezed onto a phone | In-panel shortcut tray and touch-sized tab/header controls | Matches the bottom-sheet interaction model |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Panel close still tears down the terminal host
**What goes wrong:** The PTY may survive, but the visible terminal loses local scrollback and the user sees a reconnect-style experience after every hide/reopen.
**Why it happens:** `IntegratedTerminalPanel.tsx` currently returns `null` whenever `isOpen` is false.
**How to avoid:** Keep the shell mounted whenever tabs exist and gate only visibility/focus on `isOpen`.
**Warning sign:** Hide/reopen always rebuilds the terminal DOM and auxiliary chrome from scratch.

### Pitfall 2: Empty/loading workspace states kill continuity
**What goes wrong:** If the workspace drops into loading or no-project state, the integrated terminal disappears even though a bound tab still exists.
**Why it happens:** `MainContent.tsx` currently returns early before rendering the panel.
**How to avoid:** Always render the panel after the workspace surface and let the active terminal tab remain the source of bound context.
**Warning sign:** The panel vanishes as soon as `selectedProject` becomes null.

### Pitfall 3: Mobile keyboard shrinks the viewport but the panel height stays desktop-sized
**What goes wrong:** The bottom sheet consumes too much space, the prompt moves under the keyboard, or the workspace becomes unusable behind it.
**Why it happens:** Current mobile mode just reuses the stored desktop height and does not observe `visualViewport`.
**How to avoid:** Clamp mobile panel height from visual viewport metrics and keep a keyboard-open minimum that still leaves header/nav context visible.
**Warning sign:** The terminal becomes usable only after manually dismissing the keyboard.

### Pitfall 4: Desktop auxiliary UI leaks into mobile
**What goes wrong:** The fixed right-side shortcut drawer or desktop-sized tab pills feel cramped, overlap the sheet, or steal too much screen width.
**Why it happens:** `TerminalShortcutsPanel.tsx` currently assumes a full-height desktop side drawer.
**How to avoid:** Branch mobile auxiliary controls into an in-panel tray and keep touch targets at mobile sizes.
**Warning sign:** The user must reach to the far edge of the screen for basic terminal controls.

### Pitfall 5: Phase 4 absorbs full recovery or reload persistence work
**What goes wrong:** The plan balloons into session serialization, reconnect UX, or transport-hardening changes before mobile core usability is solved.
**Why it happens:** Continuity naturally invites "just persist everything" thinking.
**How to avoid:** Limit continuity to same-session mounted UI behavior and existing PTY lifecycle; leave reload persistence and recovery UX to later phases.
**Warning sign:** The plan starts adding localStorage tab serialization or transport retry flows unrelated to mobile usability.
</common_pitfalls>

<code_examples>
## Code Examples

Verified repo behaviors that should guide planning:

### `MainContent.tsx` currently short-circuits before the panel can render
```tsx
if (isLoading) {
  return <MainContentStateView mode="loading" ... />;
}

if (!selectedProject) {
  return <MainContentStateView mode="empty" ... />;
}
```

This is the clearest continuity gap: loading/empty states skip the terminal panel entirely.

### `IntegratedTerminalPanel.tsx` currently unmounts when hidden
```tsx
if (!activeTab || !boundProject || !isOpen) {
  return null;
}
```

This makes hide/reopen depend on reconnect/replay rather than preserving the active shell host locally.

### Mobile currently reuses desktop panel height persistence
```typescript
const [terminalPanelState, setTerminalPanelState] = useState<TerminalPanelState>({
  isOpen: false,
  height: readPersistedTerminalPanelHeight(),
  focusVersion: 0,
  tabs: [],
  activeTabId: null,
});
```

There is no mobile-specific height model or visual-viewport handling yet.

### `MobileNav.tsx` already opens the terminal without replacing the active workspace tab
```tsx
const handleSelect = () => {
  if (item.id === 'shell') {
    onShellTrigger();
    return;
  }

  setActiveTab(item.id);
};
```

This is a good Phase 4 foundation: mobile terminal open should stay an overlay/sheet behavior, not a full content-tab swap.

### `TerminalShortcutsPanel.tsx` is desktop-shaped today
```tsx
<button
  type="button"
  className={`fixed ${isOpen ? 'right-64' : 'right-0'} ...`}
/>

<div className={`fixed right-0 top-0 z-40 h-full w-64 transform ...`}>
```

This must be adapted or replaced for touch-first terminal use.
</code_examples>

<open_questions>
## Open Questions

1. **Should a closed panel keep the active shell mounted?**
   - What we know: PTY keepalive already exists, but local xterm continuity is still lost on unmount.
   - Recommendation: yes. Keep the active shell mounted while terminal tabs exist and gate only visibility/focus on `isOpen`.

2. **What should the default mobile open height be?**
   - What we know: desktop one-third height is too small for touch input and too rigid for keyboard-open states.
   - Recommendation: start around 60-65% of the current visual viewport, clamp to a mobile minimum around 260px, and leave at least ~88px for workspace header/nav context.

3. **Where should mobile shortcut controls live?**
   - What we know: the current fixed side drawer is a desktop affordance and the phone already has a bottom-sheet mental model.
   - Recommendation: move mobile shortcuts into an in-panel bottom tray above the safe area instead of keeping the desktop side drawer.
</open_questions>

## Validation Architecture

Phase 4 should stay on the same lightweight validation stack as earlier terminal phases:

- **Quick validation loop:** `npm run lint`
- **Full validation loop:** `npm run lint && npm run typecheck`
- **Manual verification focus:**
  - hide/reopen the terminal and switch between major workspace views without losing the same terminal tab and output context
  - on a phone viewport, open the terminal, focus terminal input, open the software keyboard, and confirm the prompt remains usable
  - drag/resize the mobile sheet and confirm the workspace remains usable above it
  - create, switch, close, and restart tabs on mobile with touch-sized controls and readable output

This phase still does not justify a new browser automation harness. The critical gaps are mounted UI continuity and mobile viewport behavior, which need real runtime verification against the existing provider-backed terminal.

<sources>
## Sources

### Primary (repo-specific)
- `src/components/main-content/view/MainContent.tsx`
- `src/components/shell/view/IntegratedTerminalPanel.tsx`
- `src/components/shell/view/Shell.tsx`
- `src/components/shell/view/subcomponents/TerminalShortcutsPanel.tsx`
- `src/components/shell/hooks/useShellRuntime.ts`
- `src/components/shell/hooks/useShellTerminal.ts`
- `src/components/app/MobileNav.tsx`
- `src/hooks/useDeviceSettings.ts`
- `src/components/quick-settings-panel/hooks/useQuickSettingsDrag.ts`
- `src/index.css`
- `.planning/phases/03-multi-session-terminal-tabs/03-VERIFICATION.md`
- `.planning/research/SUMMARY.md`
- `.planning/research/PITFALLS.md`
</sources>
