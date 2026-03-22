---
phase: 03-multi-session-terminal-tabs
plan: 03
subsystem: ui
tags: [react, xterm, tabs, i18n, workspace-layout]
requires:
  - phase: 03-multi-session-terminal-tabs
    provides: Tab-aware shell transport and lifecycle events
provides:
  - Active-shell remount keyed by tab identity
  - Deterministic close and reopen behavior for multi-tab panel state
  - Per-tab lifecycle chips that preserve inactive-tab history
affects: [phase-verification, mobile-terminal, disconnect-recovery]
tech-stack:
  added: []
  patterns:
    - Key visible shell mounts by tab identity while keeping same-tab restart prop-driven
    - Preserve inactive-tab status in app state rather than mirroring the active shell snapshot
key-files:
  created: []
  modified:
    - src/hooks/useProjectsState.ts
    - src/components/main-content/view/MainContent.tsx
    - src/components/shell/view/IntegratedTerminalPanel.tsx
    - src/components/standalone-shell/view/StandaloneShell.tsx
    - src/i18n/locales/zh-CN/chat.json
    - src/i18n/locales/de/chat.json
    - src/i18n/locales/ja/chat.json
    - src/i18n/locales/ko/chat.json
    - src/i18n/locales/ru/chat.json
key-decisions:
  - "Key the visible shell by `activeTab.id` so tab switches reconnect to the correct PTY even when session ids overlap."
  - "Keep same-tab restart as a `restartNonce` change inside the mounted shell instead of forcing a second remount key."
  - "Render inactive-tab status from stored tab records so non-active tabs keep their own lifecycle history."
patterns-established:
  - "Tab switching and same-tab restart use different identity mechanisms on purpose."
  - "Integrated panel reopen should reuse stored tab inventory and active-tab rules instead of rebuilding tab state."
requirements-completed: [SESS-02, SESS-05]
duration: 3 min
completed: 2026-03-23
---

# Phase 3 Plan 03: Tab Continuity Summary

**Tab switching, middle-tab close behavior, and panel reopen now preserve the correct PTY identity and per-tab lifecycle history instead of collapsing everything onto the active shell**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T17:10:26Z
- **Completed:** 2026-03-22T17:13:50Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Keyed the visible integrated shell by active tab id so switching tabs reconnects to the correct PTY while same-tab restart remains prop-driven.
- Hardened active-tab selection and close/reopen helpers so closing the active tab selects the left neighbor when present and reopening the panel does not duplicate tabs.
- Fanned the new shell status and tab copy into the shipped non-English locales so the tab strip does not depend on English fallback outside the initial rollout.

## Task Commits

All three tasks landed in the same commit because the tab-continuity behavior and locale fan-out were the final compile-safe slice for the phase:

1. **Tasks 1-3: active-shell keying, deterministic close/reopen, and locale fan-out** - `c87911f` (feat)

## Files Created/Modified
- `src/hooks/useProjectsState.ts` - Preserves deterministic active-tab behavior on select, close, restart, and panel reopen
- `src/components/main-content/view/MainContent.tsx` - Resolves the active tab once and feeds the integrated panel from that tab's binding
- `src/components/shell/view/IntegratedTerminalPanel.tsx` - Keys the visible shell by `activeTab.id` and renders inactive tabs from stored status
- `src/components/standalone-shell/view/StandaloneShell.tsx` - Continues passing tab identity and restart nonce through the visible shell boundary
- `src/i18n/locales/zh-CN/chat.json` - Adds localized shell tab and lifecycle copy
- `src/i18n/locales/de/chat.json` - Adds localized shell tab and lifecycle copy
- `src/i18n/locales/ja/chat.json` - Adds localized shell tab and lifecycle copy
- `src/i18n/locales/ko/chat.json` - Adds localized shell tab and lifecycle copy
- `src/i18n/locales/ru/chat.json` - Adds localized shell tab and lifecycle copy

## Decisions Made
- Used the active tab record as the only source of bound project/session resolution so workspace navigation cannot silently retarget an inactive PTY.
- Left panel height untouched when the last tab closes so the user's preferred size survives future reopen.
- Scoped locale fan-out to the keys added in Phase 3 instead of broad translation churn.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 can now build mobile and major-view continuity on top of a stable multi-tab model rather than compensating for tab identity bugs.
- Per-tab status and deterministic reopen behavior are in place, so the next phase can focus on viewport, keyboard, and cross-view workflow continuity.

---
*Phase: 03-multi-session-terminal-tabs*
*Completed: 2026-03-23*
