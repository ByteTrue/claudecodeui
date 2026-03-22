---
phase: 03-multi-session-terminal-tabs
plan: 01
subsystem: ui
tags: [react, integrated-terminal, tabs, workspace-state, i18n]
requires:
  - phase: 02-project-aware-terminal-launch
    provides: Stable bound launch context and integrated panel shell host
provides:
  - Explicit integrated terminal tab records with active-tab selection
  - App-level tab lifecycle actions for create, select, close, restart, and status updates
  - Visible tab strip controls and per-tab lifecycle chips in the integrated panel
affects: [phase-verification, shell-runtime, mobile-terminal]
tech-stack:
  added: []
  patterns:
    - Persist integrated terminal tab state in app-level project state
    - Treat tab identity and shell runtime identity as separate but linked concerns
key-files:
  created: []
  modified:
    - src/types/app.ts
    - src/hooks/useProjectsState.ts
    - src/components/app/AppContent.tsx
    - src/components/main-content/types/types.ts
    - src/components/main-content/view/MainContent.tsx
    - src/components/shell/view/IntegratedTerminalPanel.tsx
    - src/i18n/locales/en/chat.json
key-decisions:
  - "Replace the single integrated-terminal binding with an explicit `tabs` array plus `activeTabId` so lifecycle decisions are always tab-scoped."
  - "Keep duplicate tab titles user-readable with ` · N` suffixes instead of exposing opaque ids in the UI."
  - "Store only tab-safe lifecycle values in project state and let the active shell runtime remain the source of transient transport details."
patterns-established:
  - "Integrated terminal panel state owns tab inventory, while the mounted shell owns the live socket and xterm instance."
  - "Tab actions are routed through `useProjectsState` helpers rather than component-local shadow state."
requirements-completed: [SESS-01, SESS-03, SESS-04, SESS-05]
duration: 25 min
completed: 2026-03-23
---

# Phase 3 Plan 01: Terminal Tab Model Summary

**Integrated terminal now owns explicit tab records, tab lifecycle actions, and a visible tab strip instead of a single global binding**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-22T16:20:10Z
- **Completed:** 2026-03-22T16:45:10Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Replaced the old single-binding panel state with `IntegratedTerminalTab[]` plus `activeTabId`, lifecycle metadata, and restart nonce tracking.
- Threaded tab state and tab actions from `useProjectsState` through `AppContent` and `MainContent` so the integrated panel can create, select, close, restart, and update tabs without local shadow state.
- Added the integrated tab strip UI with create, close, restart, and per-tab status affordances, plus the initial English locale keys for the new chrome.

## Task Commits

All three tasks landed in one atomic plan commit because the panel-state type change was not compile-safe as three independent slices:

1. **Tasks 1-3: tab state model, app wiring, and integrated tab strip** - `2da7387` (feat)

## Files Created/Modified
- `src/types/app.ts` - Defines `TerminalTabStatus`, `IntegratedTerminalTab`, and the new tab-based `TerminalPanelState`
- `src/hooks/useProjectsState.ts` - Creates tab records and exposes tab lifecycle helpers for create/select/close/restart/status update
- `src/components/app/AppContent.tsx` - Threads new terminal tab actions into the main workspace view
- `src/components/main-content/types/types.ts` - Extends `MainContentProps` with tab actions and typed status updates
- `src/components/main-content/view/MainContent.tsx` - Resolves the active terminal tab and its bound project/session identity
- `src/components/shell/view/IntegratedTerminalPanel.tsx` - Renders the tab strip, restart action, close affordances, and stored status chips
- `src/i18n/locales/en/chat.json` - Adds English copy for tab actions and lifecycle labels

## Decisions Made
- Kept tab creation idempotent with `openTerminalPanel`: once tabs exist, opening the panel only reopens and focuses instead of creating duplicates.
- Centralized duplicate-title numbering in state helpers so tab naming remains deterministic across panel reopen and workspace navigation.
- Preserved `focusVersion` as the single focus handoff mechanism so the tab strip could add lifecycle controls without reworking terminal focus behavior.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- The `TerminalPanelState` shape change touched all panel consumers at once, so the plan was committed as one compile-safe slice rather than one commit per individual task.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The integrated panel can now address an active tab directly and persist inactive tabs, which unlocks the transport-level tab identity work in `03-02`.
- Runtime lifecycle is still shell-level at this point, so the next plan must make websocket init, PTY keys, and restart semantics tab-aware.

---
*Phase: 03-multi-session-terminal-tabs*
*Completed: 2026-03-23*
