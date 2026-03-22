---
phase: 03-multi-session-terminal-tabs
plan: 02
subsystem: api
tags: [websocket, pty, xterm, tabs, node]
requires:
  - phase: 03-multi-session-terminal-tabs
    provides: Frontend tab state and active-tab selection
provides:
  - Tab-aware websocket init payloads and PTY cache keys
  - True tab-scoped restart semantics with `forceFresh`
  - Shell lifecycle events that include `connecting`, `live`, `disconnected`, and `exited`
affects: [phase-verification, panel-runtime, disconnect-recovery]
tech-stack:
  added: []
  patterns:
    - Use tab identity plus restart nonce to separate reconnect from restart
    - Emit structured lifecycle messages from the shell server instead of inferring everything in the UI
key-files:
  created: []
  modified:
    - src/components/shell/types/types.ts
    - src/components/shell/hooks/useShellConnection.ts
    - src/components/shell/hooks/useShellRuntime.ts
    - src/components/shell/view/Shell.tsx
    - src/components/standalone-shell/view/StandaloneShell.tsx
    - src/components/shell/view/IntegratedTerminalPanel.tsx
    - server/index.js
key-decisions:
  - "Use `terminalTabId` in the shell init payload and PTY cache key so tabs remain distinct even when `projectPath` and `sessionId` collide."
  - "Drive same-tab restart via `restartNonce` and `forceFresh` instead of remounting on every status change."
  - "Map runtime-only `loading` to persisted `connecting` before writing tab status into app state."
patterns-established:
  - "Shell runtime identity is `terminalTabId + restartNonce`, not ambient workspace selection."
  - "Server lifecycle messages are the source of truth for per-tab status chips and exit-code storage."
requirements-completed: [SESS-04, SESS-05]
duration: 25 min
completed: 2026-03-23
---

# Phase 3 Plan 02: Tab-Aware Shell Runtime Summary

**Integrated terminal tabs now own distinct PTY identities, true restart semantics, and structured lifecycle status instead of sharing a project-only shell identity**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-22T16:45:10Z
- **Completed:** 2026-03-22T17:10:26Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Extended shell message contracts, props, and runtime identity tracking so each tab carries its own `terminalTabId`, `restartNonce`, and `exitCode`.
- Made websocket init and server PTY caching tab-aware, including `forceFresh` restart handling and structured lifecycle events from the backend.
- Fed lifecycle events back into the integrated tab model so the panel can render stored `connecting`, `live`, `disconnected`, and `exited` states per tab.

## Task Commits

All three tasks landed together because the client, runtime hook, and server contract had to stay in lockstep:

1. **Tasks 1-3: shell contracts, tab-aware PTY identity, and lifecycle propagation** - `741978c` (feat)

## Files Created/Modified
- `src/components/shell/types/types.ts` - Defines the expanded lifecycle phases, exit code, and tab-aware shell messages
- `src/components/shell/hooks/useShellConnection.ts` - Sends `terminalTabId` and `forceFresh` during shell init and forwards lifecycle events
- `src/components/shell/hooks/useShellRuntime.ts` - Keys shell runtime identity from tab id plus restart nonce instead of only session id
- `src/components/shell/view/Shell.tsx` - Tracks exit state and restart lifecycle in the active shell snapshot
- `src/components/standalone-shell/view/StandaloneShell.tsx` - Threads `terminalTabId` and `restartNonce` into the mounted shell
- `src/components/shell/view/IntegratedTerminalPanel.tsx` - Persists runtime status back onto the matching tab record
- `server/index.js` - Builds tab-aware PTY keys, implements force-fresh restart, emits lifecycle messages, and guards against stale `onExit` cleanup

## Decisions Made
- Preserved provider-backed shell behavior and extended the existing transport instead of replacing the PTY path with a new session abstraction.
- Kept `terminalTabId` validation aligned with existing session-id safety rules so the new protocol surface does not widen shell injection risk.
- Stored exit code in the shell snapshot and tab record so restart affordances can react to real process exits instead of inferring failure from socket closure alone.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Guarded stale PTY exit cleanup during force-fresh restart**
- **Found during:** Task 2 (tab-aware PTY reuse and restart semantics)
- **Issue:** Killing an old PTY during restart could let that PTY's delayed `onExit` handler delete the newly spawned session mapping for the same tab key.
- **Fix:** Captured the newly spawned PTY as `spawnedShellProcess` and skipped cleanup when the exiting PTY no longer matched `session.pty`.
- **Files modified:** `server/index.js`
- **Verification:** `npm run lint`, `npm run typecheck`, browser-assisted restart UAT
- **Committed in:** `741978c` (feat)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The guard was required for correct restart behavior. Scope stayed inside the planned runtime contract.

## Issues Encountered

- Because the integrated terminal is provider-backed, restart verification had to rely on websocket logs and tab status instead of assuming raw shell prompt behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The runtime now preserves stable PTY identity per tab, which lets `03-03` harden tab switching and panel continuity without reworking the transport again.
- Exit codes and disconnected/live transitions are now available to the tab model, so the next plan can focus on UI continuity and inactive-tab state preservation.

---
*Phase: 03-multi-session-terminal-tabs*
*Completed: 2026-03-23*
