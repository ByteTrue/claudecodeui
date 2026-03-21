---
status: passed
phase: 02-project-aware-terminal-launch
source: [02-VERIFICATION.md]
started: 2026-03-20T19:03:35Z
updated: 2026-03-21T05:06:02Z
---

## Current Test

Completed via browser-assisted runtime UAT on 2026-03-21.

## Tests

### 1. Project-Bound Reopen
expected: The terminal stays bound to Project A, the header still shows Project A, and the mismatch pill shows the currently viewed Project B.
result: passed
evidence: Opened the integrated terminal from `@siteboon/claude-code-ui`, switched the workspace view to `nanoclaw`, then hid and reopened the panel. The header stayed `Terminal / Live / @siteboon/claude-code-ui / .../playground/claudecodeui / Viewing nanoclaw`, the reopen `init` payload kept `projectPath=/Users/21jie/workspace/playground/claudecodeui`, and the runtime stream included `[Reconnected to existing session]`.

### 2. Live Terminal Input And Output
expected: Keystrokes reach the PTY immediately, the command runs in the bound project root, and output streams back into the same panel in real time.
result: passed
evidence: This integrated terminal is provider-backed (`provider="claude"`, `isPlainShell=false`), so `pwd` is handled inside Claude Code rather than a raw Bash prompt. Runtime UAT still confirmed live PTY IO: keyboard input sent `p`, `w`, `d`, and `\r` over `/shell`; the panel immediately echoed `pwd`; streamed output continued in the same terminal; and bound-root evidence came from the live `init.projectPath=/Users/21jie/workspace/playground/claudecodeui` payload plus terminal output reporting `当前目录还是 /Users/21jie/workspace/playground/claudecodeui`.

### 3. Resize And Reopen Fit Stability
expected: The prompt and output remain aligned, no rows are clipped, and xterm refits correctly after resize and reopen.
result: passed
evidence: Resizing the panel upward changed the live shell from `rows=8` to `rows=18` at `panelHeight=377`; resizing back down changed it to `rows=12` at `panelHeight=274`; after hide/reopen the panel restored at `panelHeight=274`, the reopen `init` payload reused `rows=12`, and the final runtime screenshot showed aligned prompt/output with no visible clipping.

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None.
