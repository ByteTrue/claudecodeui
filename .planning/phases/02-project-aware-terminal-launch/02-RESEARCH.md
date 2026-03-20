# Phase 2: Project-Aware Terminal Launch - Research

**Researched:** 2026-03-21
**Domain:** Brownfield integrated terminal launch semantics for an existing React + xterm + node-pty Agents CLI workspace
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Opening a new integrated terminal binds it to the project currently selected in the workspace.
- If the user switches the main workspace to a different project while the terminal is already open, the terminal stays bound to its original project instead of silently switching context.
- When the terminal's bound project differs from the project currently being viewed, the panel must explicitly communicate that mismatch rather than hiding it.
- If the user switches back to the project the terminal is bound to, the UI should return to the existing live terminal state rather than starting a fresh shell instance.
- The panel header title stays `Terminal`; project identity is secondary information, not part of the main title.
- The default project identity display uses `displayName + short path`, not just a friendly name and not a noisy full absolute path.
- When the viewed project and bound project differ, the mismatch should be surfaced with a light badge/pill treatment rather than a heavy warning banner.
- Project identity is always visible in the header, with stronger emphasis only when there is a project mismatch.
- Opening the integrated terminal should auto-connect immediately.
- If auto-connect fails, the UI must show a clear error state and an explicit retry action.
- Reopening the terminal panel while the bound shell is still alive should restore that live terminal and focus input automatically.
- Connection progress and success should be visible through lightweight status feedback.
- The terminal header should show lightweight connection state such as connecting, live, or disconnected.
- The header action area should stay minimal in Phase 2 and keep only the hide/collapse affordance.

### the agent's Discretion
- Exact status copy, iconography, and color treatment for lightweight connection indicators.
- Exact truncation rules for the short path display, as long as the displayed identity remains unambiguous.
- Exact wording and placement of the project-mismatch badge/pill.
- Exact styling of the retry/error overlay, as long as it remains clear and explicit.

### Deferred Ideas (OUT OF SCOPE)
- Multi-session tabs and explicit terminal lifecycle management belong to Phase 3.
- Mobile continuity and keyboard behavior belong to Phase 4.
- Full disconnect/recovery UX, copy/paste hardening, and safe links belong to Phase 5.
- Real-time shell cwd tracking beyond launch context is out of scope for this phase.

</user_constraints>

<research_summary>
## Summary

Phase 2 is not a terminal-engine rewrite and it is not the moment to convert the product into a new generic plain-shell feature. The repo already treats the shell surface as direct access to provider CLIs through the shared `Shell` runtime, and the existing `/shell` websocket path already accepts `projectPath`, validates it, and spawns the PTY in that cwd. The real gap is launch semantics and identity ownership in the integrated panel.

Right now the integrated panel follows the ambient `selectedProject` and `selectedSession` directly. That means changing sidebar selection can implicitly change the integrated terminal's launch inputs and tear down the terminal even when the user expects one live terminal to stay attached to the original workspace. This is the main Phase 2 problem.

**Primary recommendation:** Introduce an explicit terminal binding snapshot in workspace state and make the integrated panel render from that bound launch context, not from the latest ambient workspace selection. Keep using the current `/shell` transport, PTY session cache, and provider CLI startup path. Add a slim panel header that surfaces bound project identity, mismatch state, and lightweight connection status without bringing back the heavy full-page shell chrome.
</research_summary>

<standard_stack>
## Standard Stack

Phase 2 should continue using the existing repo stack instead of introducing new transport or terminal dependencies.

### Core
| Library / API | Source | Purpose | Why It Stays Standard Here |
|---------------|--------|---------|----------------------------|
| React 18 | `package.json` | Own workspace state and launch-context derivation | Existing app-shell state already lives in hooks/components around `MainContent` |
| `@xterm/xterm` + `@xterm/addon-fit` | `package.json` | Terminal rendering and container fitting | Already integrated and already handles panel resize |
| `node-pty` | `package.json` | PTY-backed terminal processes | Existing shell transport already depends on it |
| `ws` | `package.json` | `/shell` live transport | Existing live terminal path is already correct |
| browser `ResizeObserver` | `src/components/shell/hooks/useShellTerminal.ts` | Refit terminal on container changes | Existing fit pipeline already uses it |

### Supporting
| Library / API | Source | Purpose | When To Use |
|---------------|--------|---------|-------------|
| `localStorage` | `src/hooks/useProjectsState.ts` | Persist terminal panel height and existing lightweight panel state | Keep using for non-critical panel preferences |
| `lucide-react` | `package.json` | Compact panel status and action iconography | Reuse current icon system for header polish |
| `react-i18next` | `src/components/**` | Header/status labels and mismatch copy | Use for any new visible strings added to terminal UI |

### Alternatives Rejected
| Instead Of | Rejected Approach | Why Not In Phase 2 |
|------------|-------------------|--------------------|
| Bound launch snapshot | Keep integrated panel tied directly to `selectedProject` / `selectedSession` | Violates the user's "stay bound to original project" decision |
| Existing `/shell` path | New websocket route or second PTY manager | Adds backend complexity without solving the actual problem |
| Existing provider CLI shell model | Converting integrated terminal to a brand-new generic bash product | Changes product semantics beyond this phase boundary |
| Compact status in integrated header | Reusing the heavy full-page `ShellHeader` unchanged | Conflicts with the chosen lightweight panel density |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Snapshot-bound terminal launch context
**What:** Capture a `terminal binding` object when the panel first opens and keep using that bound project/session/provider context until the user intentionally replaces it.
**Why:** The workspace selection should be free to move without silently re-targeting the live terminal.
**Repo fit:** `useProjectsState.ts` already owns `terminalPanelState`, so Phase 2 can extend that state without inventing a new global store.

### Pattern 2: Separate ambient workspace selection from integrated terminal ownership
**What:** Let `selectedProject` / `selectedSession` continue driving the rest of the workspace while the integrated terminal reads from a distinct bound context.
**Why:** The user explicitly wants to see mismatch state instead of having the terminal automatically follow the latest selection.
**Repo fit:** `MainContent.tsx` already receives both workspace selection and terminal panel state; it is the right place to derive `current project` versus `terminal-bound project`.

### Pattern 3: Keep backend reuse; solve identity in the frontend
**What:** Reuse the existing server PTY session keying and websocket init contract instead of changing server semantics first.
**Why:** `server/index.js` already keys PTY sessions by `projectPath` and session identity and already reuses existing sessions on reconnect.
**Repo fit:** If the front end keeps passing the same bound `projectPath` + session snapshot on reopen, the current backend behavior already supports "return to the same live terminal."

### Pattern 4: Expose runtime state upward instead of duplicating shell logic
**What:** Let the compact integrated header read `connecting/live/disconnected` status from the existing shell runtime instead of building a second connection state machine.
**Why:** The runtime already knows `isInitialized`, `isConnecting`, and `isConnected`; the integrated panel only needs a presentation-friendly projection of that state.
**Repo fit:** `Shell.tsx` already has all the data needed to emit a small status snapshot to `IntegratedTerminalPanel.tsx` through `StandaloneShell.tsx`.

### Anti-Patterns to Avoid
- **Do not let `selectedProject` changes remount the integrated terminal unintentionally.**
- **Do not let `selectedSession` changes drive terminal restarts just because the sidebar or chat selection moved.**
- **Do not add new permanent header controls for restart/disconnect in Phase 2.**
- **Do not hard-code shell body height against a fixed header size once the header gains mismatch/status content.**
- **Do not broaden the work into terminal tabs, terminal history management, or generalized shell orchestration.**
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Terminal process reuse | A second terminal session cache | Existing `ptySessionsMap` in `server/index.js` | Already keyed by project/session identity and supports reconnect |
| Connection state model | A panel-local socket state machine | Existing `Shell.tsx` + `useShellRuntime.ts` + `useShellConnection.ts` state | Avoids duplicated truth for live/disconnected/retrying |
| Refit on resize | Manual DOM math divorced from xterm lifecycle | Existing `ResizeObserver` + `fitAddon.fit()` path in `useShellTerminal.ts` | Already integrated with resize messages to the server |
| Project identity source | Parsing terminal output to infer cwd/project | Explicit bound project metadata from workspace state | Launch context is the chosen source of truth in this phase |
| New standalone terminal product | A generic shell mode replacing the current Agents CLI experience | Existing provider CLI shell semantics plus project-aware binding | Keeps Phase 2 inside roadmap scope |

**Key insight:** Phase 2 should move the ownership boundary, not the transport boundary. The correct fix is to snapshot and display launch identity, not to rebuild the terminal stack.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Binding the panel to `selectedProject` by prop pass-through
**What goes wrong:** Switching projects silently changes terminal cwd or remounts the terminal.
**Why it happens:** `IntegratedTerminalPanel` currently receives `project={selectedProject}` straight from `MainContent`.
**How to avoid:** Store `terminalPanelState.binding` and render from that bound value until the terminal is intentionally replaced.
**Warning sign:** `MainContent.tsx` still passes ambient selection directly into the terminal mount.

### Pitfall 2: Letting chat/session navigation restart the terminal
**What goes wrong:** The integrated terminal loses continuity when the user selects a different session in the sidebar or chat area.
**Why it happens:** `useShellRuntime.ts` disconnects when `selectedSession?.id` changes.
**How to avoid:** Snapshot the launch session/provider into terminal binding state and feed the shell runtime from that snapshot, not from live chat/session selection.
**Warning sign:** Selecting a session in the sidebar causes the bottom terminal to reconnect.

### Pitfall 3: Adding status UI without changing panel layout rules
**What goes wrong:** The panel header grows taller but the shell body still uses a fixed `calc(100%-49px)` height, causing prompt/output clipping.
**Why it happens:** Current integrated panel body height assumes a one-line fixed header.
**How to avoid:** Convert the panel shell region to flex-based `min-h-0` layout so header growth does not break the terminal surface.
**Warning sign:** Adding mismatch/status rows breaks the terminal viewport height.

### Pitfall 4: Solving retry in two places
**What goes wrong:** The compact header, overlay, and runtime all expose overlapping reconnect semantics.
**Why it happens:** It's tempting to add a retry button everywhere once connection state becomes visible.
**How to avoid:** Keep the permanent header informational and let the overlay remain the explicit retry surface.
**Warning sign:** The plan adds new persistent restart/disconnect controls to the integrated header.

### Pitfall 5: Treating this like Phase 3 terminal tabs early
**What goes wrong:** The state model balloons into full tab/session orchestration before there are explicit tab controls.
**Why it happens:** Bound launch state and tab state look superficially similar.
**How to avoid:** Store one bound launch context only; do not add arrays, tab ids, close semantics, or per-tab status maps.
**Warning sign:** New state names include `tabs`, `terminalSessions`, or `activeTerminalId`.
</common_pitfalls>

<code_examples>
## Code Examples

Verified repo behaviors that should guide planning:

### Current panel-open behavior lacks bound launch context
```typescript
// src/hooks/useProjectsState.ts
const openTerminalPanel = useCallback(() => {
  setTerminalPanelState((previous) => ({
    ...previous,
    isOpen: true,
    focusVersion: previous.focusVersion + 1,
  }));
}, []);
```

This opens/focuses the panel, but it does not snapshot which project/session the terminal now belongs to.

### Current shell init already sends projectPath and session identity
```typescript
// src/components/shell/hooks/useShellConnection.ts
sendSocketMessage(socket, {
  type: 'init',
  projectPath: currentProject.fullPath || currentProject.path || '',
  sessionId: isPlainShellRef.current ? null : selectedSessionRef.current?.id || null,
  hasSession: isPlainShellRef.current ? false : Boolean(selectedSessionRef.current),
  provider: isPlainShellRef.current ? 'plain-shell' : (selectedSessionRef.current?.__provider || localStorage.getItem('selected-provider') || 'claude'),
  cols: currentTerminal.cols,
  rows: currentTerminal.rows,
  initialCommand: initialCommandRef.current,
  isPlainShell: isPlainShellRef.current,
});
```

This means Phase 2 can succeed by stabilizing the inputs above, not by redesigning the transport.

### Current backend already reuses PTY sessions on reconnect
```javascript
// server/index.js
ptySessionKey = `${projectPath}_${sessionId || 'default'}${commandSuffix}`;
const existingSession = isLoginCommand ? null : ptySessionsMap.get(ptySessionKey);
```

If the front end reuses the same bound `projectPath` and session snapshot, the existing PTY reuse behavior already supports "return to the same live terminal."

### Current integrated panel body height is fixed to a one-line header
```tsx
// src/components/shell/view/IntegratedTerminalPanel.tsx
<div className="h-[calc(100%-49px)] min-h-0">
```

This is fine for the current shallow header but becomes fragile once mismatch and status UI are added.
</code_examples>

<open_questions>
## Open Questions

1. **Should the terminal binding snapshot include the currently selected session/provider, or only the project?**
   - What we know: letting live `selectedSession` drive the terminal would violate continuity when the user navigates elsewhere.
   - Recommendation: snapshot `sessionId` and `provider` at open time if present, but keep project identity as the primary UI concept. This preserves current shell semantics without making session selection the ongoing source of truth.

2. **How much new copy should Phase 2 introduce into i18n?**
   - What we know: the compact header needs at least one mismatch label and one stable "live" state label.
   - Recommendation: add the minimum new keys needed for mismatch/state copy across supported locales; reuse existing `tabs.shell`, `shell.connecting`, and related keys wherever possible.
</open_questions>

## Validation Architecture

Phase 2 can and should stay on the existing static-validation + manual-workflow pattern:

- **Quick validation loop:** `npm run lint`
- **Full validation loop:** `npm run lint && npm run typecheck`
- **Manual verification focus:** open the integrated terminal on one project, switch to another project, confirm the terminal stays bound to the original project with explicit mismatch UI, verify input/output still stream live, then resize/reopen the panel and confirm the terminal viewport still fits correctly

This phase does not justify a new UI test harness. The highest-value checks are static safety plus manual validation of the bound-project workflow and compact-header layout.

<sources>
## Sources

### Primary (repo-specific)
- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/phases/02-project-aware-terminal-launch/02-CONTEXT.md`
- `README.md`
- `src/hooks/useProjectsState.ts`
- `src/types/app.ts`
- `src/components/app/AppContent.tsx`
- `src/components/main-content/view/MainContent.tsx`
- `src/components/main-content/types/types.ts`
- `src/components/shell/view/IntegratedTerminalPanel.tsx`
- `src/components/standalone-shell/view/StandaloneShell.tsx`
- `src/components/shell/view/Shell.tsx`
- `src/components/shell/hooks/useShellRuntime.ts`
- `src/components/shell/hooks/useShellConnection.ts`
- `src/components/shell/hooks/useShellTerminal.ts`
- `src/components/shell/types/types.ts`
- `server/index.js`

### Secondary (supporting repo context)
- `src/components/main-content/view/subcomponents/MainContentHeader.tsx`
- `src/components/main-content/view/subcomponents/MainContentTabSwitcher.tsx`
- `src/components/app/MobileNav.tsx`
- `src/i18n/locales/en/chat.json`
</sources>

<metadata>
## Metadata

**Research scope:**
- Frontend state ownership
- Existing shell transport reuse
- Compact identity/status UI
- Fit/reopen stability under a richer header

**Deliberately excluded:**
- Terminal tabs
- Full mobile behavior
- Transport hardening and recovery UX
- Real-time cwd tracking after launch
</metadata>
