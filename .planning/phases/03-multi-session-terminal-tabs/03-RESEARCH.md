# Phase 3: Multi-Session Terminal Tabs - Research

**Researched:** 2026-03-21
**Domain:** Brownfield multi-session terminal orchestration for an existing React + xterm + node-pty integrated panel
**Confidence:** HIGH

<user_constraints>
## User Constraints

### Locked Decisions
- Phase 3 must deliver tabbed integrated terminals inside the existing bottom panel, not a new full-page shell surface.
- The Phase 2 terminal binding snapshot remains the source of truth for project/session/provider launch context; workspace navigation must not silently retarget an existing terminal tab.
- Phase 3 scope is limited to create, switch, close, restart, and status for terminal tabs.
- The terminal UI should stay lightweight and native to the current workspace instead of growing into a second full shell chrome.
- Existing `/shell` transport, PTY spawning, and reconnect buffering should be reused where practical; a transport rewrite is out of scope.

### the agent's Discretion
- Exact tab title generation when several tabs target the same project.
- Exact placement and density of close/restart actions in the tab strip as long as status remains obvious.
- Whether closing the last tab hides the panel immediately or leaves an empty-state panel behind.
- Whether a new tab should snapshot the currently selected session/provider when present or always start a fresh provider shell.

### Deferred Ideas (OUT OF SCOPE)
- Full session restore across page reloads.
- Mobile-specific tab affordances and keyboard behavior.
- Split terminal panes or multiple simultaneously visible terminal surfaces.
- Deep cwd tracking beyond the Phase 2 launch binding.
- Safe-link hardening and disconnect/recovery UX beyond the status needed for tab lifecycle.

</user_constraints>

<research_summary>
## Summary

The repo already solved the hard part of Phase 2: the integrated terminal no longer follows ambient workspace selection and the server already keeps PTY sessions alive for 30 minutes after a WebSocket disconnect. That means Phase 3 does not need a new terminal engine. The real gap is identity.

Right now the integrated panel still models only one terminal binding and the server keys PTY reuse by `projectPath` plus `sessionId`. That is enough for a single integrated terminal, but it collides immediately once the user wants two tabs against the same project or against the same provider session. The frontend also mounts a single `StandaloneShell`, so there is nowhere to store per-tab status, restart intent, or active-tab selection.

**Primary recommendation:** replace the single binding model with an explicit terminal-tab state model in app state, give every tab a stable client-generated `terminalTabId`, and extend the shell init contract so the backend PTY cache key includes that tab identity. Keep only one visible shell mounted at a time, but make tab switching reconnect to the same PTY for that tab rather than restarting it. Drive per-tab chips from stored tab status, with the active shell feeding structured status updates back into tab state.
</research_summary>

<standard_stack>
## Standard Stack

Phase 3 should continue on the current repo stack.

### Core
| Library / API | Source | Purpose | Why It Stays Standard Here |
|---------------|--------|---------|----------------------------|
| React 18 state/effects | `package.json`, `src/hooks/**`, `src/components/**` | Own terminal tab list, active-tab selection, and status snapshots | The app already manages workspace state in React rather than a separate client store |
| `@xterm/xterm` + `@xterm/addon-fit` | `package.json` | Render the active terminal surface | Existing viewport sizing and terminal input pipeline already work |
| `node-pty` | `package.json` | Run provider shells and keep PTYs alive between reconnects | Existing `/shell` path already depends on it |
| `ws` | `package.json`, `server/index.js` | Transport live shell data and lifecycle events | Current shell path already handles streaming and reconnect reuse |
| browser `crypto.randomUUID()` | browser runtime | Generate stable terminal tab ids client-side | Prevents array-index identity bugs without new dependencies |

### Supporting
| Library / API | Source | Purpose | When To Use |
|---------------|--------|---------|-------------|
| `react-i18next` | `src/i18n/locales/**` | Tab labels, restart/close tooltips, lifecycle copy | Any new user-visible terminal-tab strings |
| `lucide-react` | `package.json` | Reuse iconography for add/close/restart affordances | Keep the tab strip visually aligned with the existing panel |
| `localStorage` | existing panel state | Persist panel height only | Phase 3 should not add reload persistence for tabs |

### Alternatives Rejected
| Instead Of | Rejected Approach | Why Not In Phase 3 |
|------------|-------------------|--------------------|
| Tab-scoped id in shell init | Keep PTY reuse keyed only by `projectPath` and `sessionId` | Multiple tabs in the same project would reconnect to the same PTY unintentionally |
| One visible shell that reconnects by tab id | Mount one `Shell` instance per tab simultaneously | Higher memory cost, more DOM complexity, and no product requirement for concurrent visible terminals |
| Stored tab status in panel state | Derive inactive-tab status only from the active shell runtime | Inactive tabs still need visible state chips after the user switches away |
| Explicit server lifecycle events | Infer `exited` purely from output parsing | Too brittle for a per-tab state machine and restart UX |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Terminal tabs as first-class app state
**What:** Replace the single integrated-terminal binding with `tabs[]` plus `activeTabId`.
**Why:** Multi-session UX requires stable identities for create, switch, close, restart, and status.
**Repo fit:** `useProjectsState.ts` already owns `terminalPanelState`, so tab state belongs there rather than in `IntegratedTerminalPanel.tsx`.

### Pattern 2: Tab identity separate from project/session binding
**What:** Each tab gets a client-generated `terminalTabId` in addition to its bound project/session/provider snapshot.
**Why:** Two tabs may legitimately share the same project and the same provider/session source but still need separate PTY lifecycles.
**Repo fit:** `TerminalBindingContext` can stay focused on launch context while a new tab record carries runtime identity and status.

### Pattern 3: Active shell remount keyed by tab id, with restart handled inside the mounted shell
**What:** Render only the active tab's `StandaloneShell`, key it by `activeTab.id`, and pass `restartNonce` as a prop-driven same-tab restart signal.
**Why:** Switching between two tabs that both have `sessionId = null` or even the same provider session still needs a full runtime identity swap, while same-tab restart should not depend on a second React remount contract.
**Repo fit:** The current shell runtime already assumes one mounted terminal host; remount-on-tab-switch plus prop-driven restart keeps that assumption intact.

### Pattern 4: Extend the existing PTY cache instead of replacing it
**What:** Keep `ptySessionsMap`, but include `terminalTabId` in the cache key and emit structured lifecycle messages.
**Why:** The backend already buffers output and keeps PTYs alive after disconnect, which is exactly what inactive tabs need.
**Repo fit:** `server/index.js` already owns session reuse and timeout cleanup, so the minimal change is to make the key and messages tab-aware.

### Pattern 5: Store tab status in app state, not only inside `Shell`
**What:** The active shell publishes `connecting/live/disconnected/exited` snapshots upward; the panel stores them on the matching tab record.
**Why:** The tab strip has to show status for inactive tabs too.
**Repo fit:** Phase 2 already added `onStatusChange` from `Shell` to the integrated panel, so Phase 3 can extend that into tab-scoped state updates.

### Anti-Patterns to Avoid
- **Do not keep `TerminalPanelState.binding` as the only terminal identity.**
- **Do not key PTY reuse only by `projectPath` and `sessionId` once tabs exist.**
- **Do not use array index as the terminal tab id or React key.**
- **Do not reset every tab to `loading` when only the active tab changes.**
- **Do not turn Phase 3 into reload persistence, mobile redesign, or split-pane work.**
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PTY lifetime across tab switches | A second backend session manager | Existing `ptySessionsMap` plus a tab-aware key | Reuses buffering, reconnect, and timeout logic already in production |
| Tab identity | Array index or generated title text | Stable `terminalTabId` from `crypto.randomUUID()` | Reordering and duplicate project names must not break reconnect identity |
| Restart semantics | Reconnect to the same PTY and call it a restart | Explicit `forceFresh` init path tied to `restartNonce` | Restart must kill/replace the previous PTY for that tab |
| Inactive-tab status | Recompute from whatever shell is active right now | Persist `status`, `canRetry`, and `exitCode` on each tab record | Inactive tabs still need accurate chips |
| Visibility continuity | Keep all tabs mounted in hidden DOM | Single active shell mount keyed by tab identity | Simpler and matches the existing shell runtime model |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: PTY key collisions between tabs
**What goes wrong:** Opening a second terminal tab for the same project reconnects to the first tab's PTY instead of creating a distinct shell.
**Why it happens:** The current backend cache key is `${projectPath}_${sessionId || 'default'}` plus optional command suffix.
**How to avoid:** Add `terminalTabId` to the init payload and include it in `ptySessionKey`.
**Warning sign:** The second tab immediately prints `[Reconnected to existing session]` even though the user expected a fresh tab.

### Pitfall 2: Tab switching that depends on `selectedSession?.id` only
**What goes wrong:** Switching between two tabs with the same `sessionId` or `null` session ids does not remount the shell runtime cleanly.
**Why it happens:** `useShellRuntime.ts` currently disconnects only when the selected session id changes.
**How to avoid:** Key the visible shell by `activeTab.id` so tab switches remount cleanly, and use `restartNonce` only as the same-tab `forceFresh` signal inside that mounted shell.
**Warning sign:** Tab A and Tab B show different tab labels, but the visible shell content never changes when the user switches tabs.

### Pitfall 3: Restart that silently reuses the old PTY
**What goes wrong:** The UI says a tab restarted, but reconnecting just resumes the old process.
**Why it happens:** The server keeps PTYs alive after disconnect, and reconnect alone is not a true restart.
**How to avoid:** Send a tab-scoped `forceFresh` signal from the client when `restartNonce` changes and have the server kill/delete the old PTY before spawning the new one.
**Warning sign:** A restarted tab still contains pre-restart process state or scrollback.

### Pitfall 4: Losing inactive-tab status
**What goes wrong:** All inactive tabs collapse back to a generic status once the user switches away.
**Why it happens:** Status is stored only in the active `Shell` component.
**How to avoid:** Update only the matching tab record in `terminalPanelState.tabs` when status changes.
**Warning sign:** Every tab chip shows the same status as the currently active tab.

### Pitfall 5: Expanding scope into persistence or mobile continuity
**What goes wrong:** Planning bloats into reload recovery, mobile redesign, or split-pane discussions.
**Why it happens:** Multi-tab terminal work naturally invites "while we're here" additions.
**How to avoid:** Keep Phase 3 to tab lifecycle and status only; leave reload persistence to later work.
**Warning sign:** The plan starts adding `localStorage` tab serialization or mobile-specific tab layouts.
</common_pitfalls>

<code_examples>
## Code Examples

Verified repo behaviors that should guide planning:

### Current integrated panel stores only one binding
```typescript
// src/types/app.ts
export interface TerminalPanelState {
  isOpen: boolean;
  height: number;
  focusVersion: number;
  binding: TerminalBindingContext | null;
}
```

This is the root Phase 3 limitation: there is no place to keep more than one terminal identity.

### Current open action snapshots only one terminal binding
```typescript
// src/hooks/useProjectsState.ts
const openTerminalPanel = useCallback(() => {
  setTerminalPanelState((previous) => ({
    ...previous,
    isOpen: true,
    focusVersion: previous.focusVersion + 1,
    binding: previous.binding ?? (selectedProject ? { ... } : null),
  }));
}, [selectedProject, selectedSession]);
```

This fits a single integrated terminal but not tab creation or active-tab selection.

### Current runtime disconnect logic is keyed to session id changes
```typescript
// src/components/shell/hooks/useShellRuntime.ts
useEffect(() => {
  const currentSessionId = selectedSession?.id ?? null;
  if (lastSessionIdRef.current !== currentSessionId && isInitialized) {
    disconnectFromShell();
  }
  lastSessionIdRef.current = currentSessionId;
}, [disconnectFromShell, isInitialized, selectedSession?.id]);
```

This is not enough once tab identity must change even when the session id does not.

### Current backend PTY cache key has no tab identity
```javascript
// server/index.js
ptySessionKey = `${projectPath}_${sessionId || 'default'}${commandSuffix}`;
const existingSession = isLoginCommand ? null : ptySessionsMap.get(ptySessionKey);
```

Without a terminal-tab component in this key, two tabs in the same project will collide.

### Current integrated panel renders exactly one shell host
```tsx
// src/components/shell/view/IntegratedTerminalPanel.tsx
<StandaloneShell
  project={boundProject}
  session={boundSession}
  showHeader={false}
  showShellHeader={false}
  isActive={isOpen}
  className="h-full min-h-0"
  onStatusChange={setShellStatus}
/>
```

Phase 3 should keep one visible shell host, but it must become active-tab aware.
</code_examples>

<open_questions>
## Open Questions

1. **Should a new terminal tab inherit the currently selected session/provider when one exists?**
   - What we know: Phase 2 already snapshots the current project/session/provider at open time.
   - Recommendation: yes. A new tab should snapshot the current workspace selection the same way, because that preserves existing "open terminal from what I am currently working on" semantics.

2. **What should happen when the user closes the last remaining terminal tab?**
   - What we know: the current integrated panel is only visible when it has meaningful terminal content.
   - Recommendation: close the panel, preserve the saved height, and clear `activeTabId`. Creating a new tab should reopen the panel.

3. **How should duplicate tab titles be handled when several tabs target the same project?**
   - What we know: a raw project name alone becomes ambiguous quickly.
   - Recommendation: use `projectDisplayName` as the base label and append ` · 2`, ` · 3`, etc. when the same base title already exists in the current tab list.
</open_questions>

## Validation Architecture

Phase 3 should stay on the same lightweight validation stack as earlier terminal phases:

- **Quick validation loop:** `npm run lint`
- **Full validation loop:** `npm run lint && npm run typecheck`
- **Manual verification focus:**
  - create at least two terminal tabs for the same project and confirm they do not reconnect to the same PTY accidentally
  - switch between tabs and confirm the inactive tab resumes its original shell/process state
  - close one tab and confirm adjacent-tab selection behaves predictably without disturbing other tabs
  - restart one tab and confirm only that tab gets a fresh PTY while other tabs stay intact

This phase still does not justify a new browser automation harness. The key correctness questions are identity, lifecycle, and reconnect behavior across real provider-backed shells.

<sources>
## Sources

### Primary (repo-specific)
- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/phases/02-project-aware-terminal-launch/02-RESEARCH.md`
- `.planning/phases/02-project-aware-terminal-launch/02-VERIFICATION.md`
- `src/types/app.ts`
- `src/hooks/useProjectsState.ts`
- `src/components/app/AppContent.tsx`
- `src/components/main-content/types/types.ts`
- `src/components/main-content/view/MainContent.tsx`
- `src/components/shell/view/IntegratedTerminalPanel.tsx`
- `src/components/standalone-shell/view/StandaloneShell.tsx`
- `src/components/shell/view/Shell.tsx`
- `src/components/shell/hooks/useShellRuntime.ts`
- `src/components/shell/hooks/useShellConnection.ts`
- `src/components/shell/types/types.ts`
- `server/index.js`

### Secondary (supporting repo context)
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/CONCERNS.md`
- `.planning/codebase/TESTING.md`

</sources>
