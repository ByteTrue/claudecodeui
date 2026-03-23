---
phase: 4
slug: mobile-and-workflow-continuity
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | ESLint 9 + TypeScript compile checks + manual integrated-terminal continuity/mobile verification |
| **Config file** | `eslint.config.js`, `tsconfig.json` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run typecheck` |
| **Estimated runtime** | ~75 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run typecheck`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | SESS-06 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | SESS-06 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-01-03 | 01 | 1 | SESS-06 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | MOBL-01 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | MOBL-01, MOBL-02 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-02-03 | 02 | 2 | MOBL-01, MOBL-02 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 3 | MOBL-04 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-03-02 | 03 | 3 | MOBL-02, MOBL-04 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 04-03-03 | 03 | 3 | MOBL-03, MOBL-04 | static + manual | `npm run lint` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Closing and reopening the integrated terminal while switching between chat/files/git or empty/loading workspace states keeps the same active terminal tab and process context | SESS-06 | Same-session continuity depends on mounted-shell behavior and real UI navigation, not only type-level state | Open a terminal tab, produce visible output, hide the panel, switch across major workspace views, reopen it, and confirm the same tab/output context remains without an unintended fresh session |
| On mobile, the terminal opens as a usable sheet above the workspace and can be closed without trapping the user in the terminal | MOBL-01 | Bottom-sheet behavior and non-blocking workspace access are layout interactions | Use a phone viewport, open the terminal from mobile navigation, confirm the workspace remains reachable above it, then close and reopen the panel repeatedly |
| On mobile, focusing terminal input with the software keyboard keeps the prompt/input area visible and usable | MOBL-02 | Keyboard-open viewport changes require real browser behavior | On a phone viewport, focus the terminal input, open the software keyboard, and confirm the active prompt, tab actions, and close affordance remain reachable |
| On mobile, recent output remains readable while the panel is open and while auxiliary controls are visible | MOBL-03 | Output readability depends on real sheet height, safe-area padding, and overlay placement | Open the panel on a phone viewport, generate visible output, open any shortcut/auth overlays, and confirm the newest output lines remain readable without being hidden under floating controls |
| On mobile, users can create, switch, close, and restart tabs with touch-friendly controls | MOBL-04 | Touch-target size and horizontal tab affordances are UX-only behaviors | Open at least two tabs on a phone viewport, switch between them by touch, close one tab, restart another, and confirm each control is reachable without precision tapping |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands or explicit manual verification coverage
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing infrastructure references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-23
