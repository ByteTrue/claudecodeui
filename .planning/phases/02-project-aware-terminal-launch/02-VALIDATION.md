---
phase: 2
slug: project-aware-terminal-launch
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | ESLint 9 + TypeScript compile checks + manual integrated-terminal verification |
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
| 02-01-01 | 01 | 1 | INTE-04 | static | `npm run lint` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | INTE-04 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | TERM-01 | static + manual | `npm run lint && npm run typecheck` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | TERM-01 | static | `npm run lint` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | INTE-05 | static + manual | `npm run lint` | ✅ | ⬜ pending |
| 02-02-03 | 02 | 2 | TERM-02 | static + manual | `npm run lint && npm run typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| New integrated terminal binds to the selected project/workspace root instead of silently following later workspace changes | INTE-04 | Requires live selection changes and reconnection behavior inside the real workspace shell flow | Open project A, launch the integrated terminal, switch the workspace to project B, and confirm the terminal stays attached to project A rather than relaunching in project B |
| Integrated UI clearly shows which project/workspace the terminal belongs to and signals mismatch with the currently viewed project | INTE-05 | Compact header clarity and mismatch tone need visual confirmation | With the terminal still bound to project A and the workspace viewing project B, confirm the header shows `Terminal`, the bound project identity, and a lightweight mismatch cue instead of a warning banner |
| User can type into the integrated terminal and receive live output after project binding is introduced | TERM-01 | Live PTY input/output is an interactive runtime behavior, not a static assertion | Launch the integrated terminal, wait for the provider CLI prompt, type a short benign input, and confirm the prompt and resulting output continue to render in the bottom panel without forced remounts during normal workspace navigation |
| Prompt and output layout remain correct when the terminal panel header grows and the panel is resized/reopened | TERM-02 | Header growth, panel reopen, and xterm fitting are visual container behaviors | With a connected terminal open, resize the panel height, close and reopen it, and confirm prompt/output wrap correctly with no clipping or empty viewport caused by the richer header layout |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands or explicit manual verification coverage
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing infrastructure references
- [x] No watch-mode flags
- [x] Feedback latency < 75s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-21
