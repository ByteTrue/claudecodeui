---
phase: 02-project-aware-terminal-launch
plan: 01
subsystem: ui
tags: [react, integrated-terminal, workspace-context, shell]
requires:
  - phase: 01-integrated-terminal-panel
    provides: Integrated bottom-panel shell host and reconnectable PTY session path
provides:
  - Stable terminal launch binding captured from the current workspace selection
  - Bound project and session resolution independent from sidebar navigation
  - Integrated shell mounting that reconnects against the bound launch context
affects: [phase-verification, terminal-header, workspace-navigation]
tech-stack:
  added: []
  patterns:
    - Persist terminal launch context separately from ambient workspace selection
    - Derive fallback bound project/session models from binding snapshots when live project data is unavailable
key-files:
  created: []
  modified:
    - src/types/app.ts
    - src/hooks/useProjectsState.ts
    - src/components/app/AppContent.tsx
    - src/components/main-content/types/types.ts
    - src/components/main-content/view/MainContent.tsx
    - src/components/shell/view/IntegratedTerminalPanel.tsx
key-decisions:
  - "Capture the integrated terminal binding once on open and preserve it across close/reopen until the user intentionally replaces the shell context."
  - "Resolve the terminal's bound project and session separately from the currently viewed workspace so ambient navigation cannot silently retarget a live PTY."
  - "Build minimal fallback project/session objects from the binding snapshot so reconnect paths continue to work even when refreshed project metadata lags."
patterns-established:
  - "Terminal visibility and terminal ownership are separate state concerns."
  - "Integrated terminal mounts should receive explicit current-vs-bound context props rather than reading ambient workspace selection directly."
requirements-completed: [INTE-04, TERM-01]
duration: 9 min
completed: 2026-03-20
---

# Phase 2 Plan 01: Stable Terminal Binding Summary

**Integrated terminal now snapshots its launch project/session once, keeps that binding across workspace navigation, and reconnects the live shell against the bound context instead of ambient selection**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-20T18:29:11Z
- **Completed:** 2026-03-20T18:38:19Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Added explicit `TerminalBindingContext` state so the terminal panel can persist launch ownership independently from visibility.
- Threaded project inventory plus bound project/session derivation through `MainContent` so the workspace can distinguish the viewed project from the terminal-owned project.
- Switched the integrated terminal mount to use the bound project/session snapshot, preserving the live shell identity across project and session navigation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add bound launch context to terminal panel state** - `d8ed7fa` (feat)
2. **Task 2: Thread current-vs-bound terminal context through MainContent** - `7c97922` (feat)
3. **Task 3: Launch the integrated shell from the bound context instead of ambient selection** - `1641b63` (feat)

## Files Created/Modified
- `src/types/app.ts` - Defines `TerminalBindingContext` and extends terminal panel state with a persistent binding snapshot
- `src/hooks/useProjectsState.ts` - Captures the bound launch context on open and preserves it across close/reopen and background refreshes
- `src/components/app/AppContent.tsx` - Passes full project inventory into `MainContent`
- `src/components/main-content/types/types.ts` - Extends main-content props with the project list
- `src/components/main-content/view/MainContent.tsx` - Resolves bound project/session state independently from the current workspace view
- `src/components/shell/view/IntegratedTerminalPanel.tsx` - Receives explicit current-vs-bound context and mounts the shell with the bound project/session pair

## Decisions Made
- Preserved terminal binding when the panel closes so reopening reuses the same live PTY identity rather than creating a new ambient selection.
- Used `projectName` plus a minimal fallback `Project` shape to keep terminal reconnect logic working even if the bound project is absent from the latest project refresh.
- Used the binding snapshot as the source of truth for session provider fallback so reconnect behavior stays stable across provider/session navigation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cleaned up Tailwind class ordering introduced during the panel handoff**
- **Found during:** Post-task verification after Task 3
- **Issue:** The integrated panel changes introduced new Tailwind class-order lint warnings, which would have left the plan in a noisier state than before execution.
- **Fix:** Normalized class ordering in `IntegratedTerminalPanel.tsx` and re-ran targeted plus full-project lint checks.
- **Files modified:** `src/components/shell/view/IntegratedTerminalPanel.tsx`
- **Verification:** `npx eslint src/components/shell/view/IntegratedTerminalPanel.tsx`, `npm run lint`, `npm run typecheck`
- **Committed in:** `c8cbf2a` (fix)

---

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking)
**Impact on plan:** Verification stayed clean for the files touched by this plan. No scope creep beyond preserving lint cleanliness.

## Issues Encountered

The spawned executor completed all three task commits but stalled before generating plan metadata. The main orchestrator took over for verification, summary generation, and tracking updates after spot-checking the completed code and commit history.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Stable bound launch context is now available for the richer terminal header and status UI planned in `02-02`.
- The integrated shell path already reuses the bound `projectPath` / `sessionId` identity, so the next plan can focus on presentation and viewport stability instead of reconnect semantics.

---
*Phase: 02-project-aware-terminal-launch*
*Completed: 2026-03-20*
