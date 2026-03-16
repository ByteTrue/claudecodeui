---
phase: 01-integrated-terminal-panel
plan: 01
subsystem: ui
tags: [react, xterm, workspace-layout, terminal-panel]
requires: []
provides:
  - Shared terminal panel state outside activeTab
  - Full-width workspace panel host slot for terminal rendering
  - Integrated panel wrapper around the existing shell runtime
affects: [01-02, 01-03, shell, workspace-layout]
tech-stack:
  added: []
  patterns:
    - Shared workspace panel state separate from activeTab
    - Panel wrapper reuse of existing shell runtime
key-files:
  created:
    - src/components/shell/view/IntegratedTerminalPanel.tsx
  modified:
    - src/hooks/useProjectsState.ts
    - src/components/main-content/view/MainContent.tsx
    - src/components/main-content/types/types.ts
    - src/components/shell/view/Shell.tsx
    - src/components/standalone-shell/view/StandaloneShell.tsx
    - src/types/app.ts
    - src/components/app/AppContent.tsx
key-decisions:
  - "Terminal panel state now lives outside activeTab so the workspace can host shell independently of page navigation."
  - "The new bottom panel wrapper reuses the existing shell runtime instead of creating a second terminal implementation."
patterns-established:
  - "Workspace integration pattern: shared bottom panel rendered below the combined content/editor row."
  - "Shell embedding pattern: hide the heavy full-page shell header when rendering inside an integrated panel."
requirements-completed: [INTE-01]
duration: 19 min
completed: 2026-03-16
---

# Phase 1 Plan 01: Integrated Terminal Panel Summary

**Workspace-level terminal panel foundation with dedicated panel state, full-width host layout, and a reusable embedded shell wrapper**

## Performance

- **Duration:** 19 min
- **Started:** 2026-03-16T16:03:17Z
- **Completed:** 2026-03-16T16:22:56Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Added dedicated terminal panel state in workspace state so terminal visibility no longer depends on `activeTab`.
- Created `IntegratedTerminalPanel` as a panel-oriented wrapper that reuses the existing shell runtime without the old full-page header.
- Mounted a full-width terminal panel region below the combined workspace content/editor row in `MainContent`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add explicit terminal panel workspace state** - `8df3d0f` (feat)
2. **Task 2: Create the integrated terminal panel host component** - `4f61d40` (feat)
3. **Task 3: Mount a shared bottom-panel region in the workspace layout** - `f481bc1` (feat)

## Files Created/Modified
- `src/components/shell/view/IntegratedTerminalPanel.tsx` - New panel wrapper around the existing shell runtime
- `src/hooks/useProjectsState.ts` - Dedicated terminal panel state and helpers outside `activeTab`
- `src/components/main-content/view/MainContent.tsx` - Full-width panel slot below the workspace row
- `src/components/main-content/types/types.ts` - MainContent prop contract for panel state/control
- `src/components/shell/view/Shell.tsx` - Optional shell header rendering for embedded panel usage
- `src/components/standalone-shell/view/StandaloneShell.tsx` - Pass-through shell-header control for embedded use
- `src/components/app/AppContent.tsx` - Thread terminal panel state into workspace content
- `src/types/app.ts` - Shared terminal panel state type

## Decisions Made
- Moved terminal panel state out of `activeTab` so future trigger rewiring can preserve the current workspace view.
- Reused the existing shell runtime via a panel wrapper instead of introducing a second shell client or transport path.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `node_modules` was missing in the workspace, so `npm run lint` initially failed with `eslint: command not found`. Resolved by running `npm install`, after which lint ran successfully at the repo's existing warning-only baseline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The workspace now has a real full-width bottom panel host for terminal rendering.
- Phase 01-02 can rewire the existing shell trigger to this panel, implement collapse/reopen behavior, and remove the dedicated shell-page mental model.

---
*Phase: 01-integrated-terminal-panel*
*Completed: 2026-03-16*
