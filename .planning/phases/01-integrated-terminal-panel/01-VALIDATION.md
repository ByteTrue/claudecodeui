---
phase: 1
slug: integrated-terminal-panel
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | ESLint 9 + TypeScript compile checks + manual UI verification |
| **Config file** | `eslint.config.js`, `tsconfig.json` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run typecheck` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run typecheck`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INTE-01 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | INTE-01 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | INTE-02 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | INTE-02 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 3 | INTE-03 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 3 | INTE-03 | static + manual | `npm run lint && npm run typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Open bottom-panel terminal from the existing shell trigger without switching away from the current workspace view | INTE-01 | Current repo has no UI test harness for this workspace interaction | Start the app, open a project, stay on chat/files/git, use the shell trigger, and confirm the terminal appears as a bottom panel while the current view remains visible |
| Collapse and reopen the panel while staying in the same workspace flow | INTE-02 | Requires interactive layout confirmation across real workspace state | With a project open and terminal visible, collapse the panel, confirm the workspace stays in place, reopen it, and verify it returns without route/tab replacement |
| Resize the panel on desktop and confirm it remains integrated into the layout | INTE-03 | Drag-resize behavior is inherently interactive | On desktop viewport, drag the panel resize handle, confirm height changes smoothly, reopen the panel, and verify the last chosen height is restored |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-16

