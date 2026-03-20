---
phase: 02-project-aware-terminal-launch
plan: 02
subsystem: ui
tags: [react, integrated-terminal, i18n, xterm]
requires:
  - phase: 02-01
    provides: Stable terminal binding for project and session ownership
provides:
  - Integrated terminal header showing bound project identity and mismatch context
  - Compact shell runtime status snapshot surfaced to the panel header
  - Flex-based shell body sizing that survives richer header content
affects: [phase-verification, workspace-navigation, mobile-terminal]
tech-stack:
  added: []
  patterns:
    - Propagate lightweight shell status snapshots from runtime to presentation components
    - Keep terminal viewport sizing in the flex/min-h-0 chain instead of hard-coded header offsets
key-files:
  created: []
  modified:
    - src/components/shell/types/types.ts
    - src/components/shell/view/Shell.tsx
    - src/components/standalone-shell/view/StandaloneShell.tsx
    - src/components/shell/view/IntegratedTerminalPanel.tsx
    - src/i18n/locales/en/chat.json
    - src/i18n/locales/zh-CN/chat.json
    - src/i18n/locales/de/chat.json
    - src/i18n/locales/ja/chat.json
    - src/i18n/locales/ko/chat.json
    - src/i18n/locales/ru/chat.json
key-decisions:
  - "Shell runtime emits a compact status snapshot instead of making the integrated panel infer socket state on its own."
  - "The integrated header keeps `Terminal` as the main title and treats bound project identity plus mismatch state as secondary context."
  - "Viewport sizing stays on the existing xterm fit pipeline by switching the panel body to flex/min-h-0 rather than adding new resize logic."
patterns-established:
  - "Integrated terminal status UI should consume a presentation-friendly runtime snapshot."
  - "Richer terminal headers should grow naturally while the shell body remains the only flexing region."
requirements-completed: [INTE-05, TERM-02]
duration: 3 min
completed: 2026-03-20
---

# Phase 2 Plan 02: Project-Aware Terminal Header Summary

**Integrated terminal now shows bound project ownership and live shell state in the header while keeping the xterm viewport stable under the richer header layout**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-20T18:47:39Z
- **Completed:** 2026-03-20T18:50:23Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Added a compact `ShellStatusSnapshot` flow from `Shell` through `StandaloneShell` into the integrated panel.
- Updated the integrated terminal header to show bound project display name, shortened bound path, mismatch context, and lightweight runtime state.
- Replaced the panel's fixed shell body height calculation with a flex/min-h-0 layout chain so xterm fitting remains correct when the header grows.

## Task Commits

Each task was committed atomically:

1. **Task 1: Expose compact shell status to the integrated panel** - `9712b52` (feat)
2. **Task 2: Render compact bound-project identity and mismatch UI in the panel header** - `c0af8e9` (feat)
3. **Task 3: Replace fixed shell-body height with flex-based sizing that survives the richer header** - `9a953e4` (feat)

## Files Created/Modified
- `src/components/shell/types/types.ts` - Defines compact shell status phase and snapshot types
- `src/components/shell/view/Shell.tsx` - Emits presentation-friendly shell runtime status updates
- `src/components/standalone-shell/view/StandaloneShell.tsx` - Forwards shell status changes to integrated consumers
- `src/components/shell/view/IntegratedTerminalPanel.tsx` - Renders project-aware header state and uses flex-based shell body sizing
- `src/i18n/locales/en/chat.json` - Adds header copy for live/disconnected/mismatch labels
- `src/i18n/locales/zh-CN/chat.json` - Adds Chinese terminal header labels
- `src/i18n/locales/de/chat.json` - Adds German terminal header labels
- `src/i18n/locales/ja/chat.json` - Adds Japanese terminal header labels
- `src/i18n/locales/ko/chat.json` - Adds Korean terminal header labels
- `src/i18n/locales/ru/chat.json` - Adds Russian terminal header labels

## Decisions Made
- Kept retry behavior in the existing connection overlay and only surfaced status in the header so the panel action area stays minimal.
- Used the bound launch path rather than live cwd detection to keep Phase 2 within scope while still making terminal ownership explicit.
- Let the header wrap naturally on narrow layouts instead of truncating all secondary identity context into a single line.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 code execution is complete across both plans.
- The next step is phase-level verification of project-aware launch behavior, header identity clarity, live shell behavior, and viewport stability.

---
*Phase: 02-project-aware-terminal-launch*
*Completed: 2026-03-20*
