---
phase: 3
slug: multi-session-terminal-tabs
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | ESLint 9 + TypeScript compile checks + manual integrated-terminal multi-tab verification |
| **Config file** | `eslint.config.js`, `tsconfig.json` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run typecheck` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run typecheck`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 75 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SESS-01 | static | `npm run lint` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | SESS-01, SESS-03 | static | `npm run lint` | ✅ | ⬜ pending |
| 03-01-03 | 01 | 1 | SESS-04, SESS-05 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | SESS-05 | static | `npm run lint` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | SESS-04, SESS-05 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 03-02-03 | 02 | 2 | SESS-04, SESS-05 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 3 | SESS-02 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 3 | SESS-02, SESS-03 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 03-03-03 | 03 | 3 | SESS-02, SESS-05 | static + manual | `npm run lint` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Creating a second terminal tab in the same project creates a distinct tab and does not silently reattach to the first tab's PTY | SESS-01 | PTY reuse vs fresh-spawn behavior depends on live server/session interaction | Open one integrated terminal tab, create a second tab for the same project, run different visible commands in each tab, and confirm switching between them preserves separate shell state |
| Switching tabs keeps the inactive tab's shell/process state intact | SESS-02 | Requires real reconnect behavior against provider-backed shells and server PTY keepalive | Start a long-lived command or visible session state in tab A, switch to tab B, then switch back and confirm tab A resumes the same PTY rather than starting over |
| Closing one terminal tab only removes that tab and selects the correct remaining neighbor | SESS-03 | Adjacent-tab selection and panel visibility are UX behaviors, not static assertions | Open at least three tabs, close the active middle tab, confirm the panel selects the left neighbor when present, and confirm the untouched tab keeps its status and output |
| Restarting one terminal tab creates a fresh shell for that tab without disturbing the others | SESS-04 | Requires live PTY lifecycle confirmation and cannot be proven by types alone | With at least two tabs open, restart tab B, confirm tab B gets a fresh prompt/session, and confirm tab A continues from its previous PTY state |
| Every terminal tab surfaces clear lifecycle state including connecting, live, disconnected, and exited | SESS-05 | Per-tab status chips and exited-state timing need runtime confirmation | Trigger initial connect, normal live state, an explicit restart, and a process exit, then confirm the active and inactive tabs show the expected status chips at each step |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands or explicit manual verification coverage
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing infrastructure references
- [x] No watch-mode flags
- [x] Feedback latency < 75s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-21
