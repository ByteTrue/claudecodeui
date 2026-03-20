---
status: partial
phase: 02-project-aware-terminal-launch
source: [02-VERIFICATION.md]
started: 2026-03-20T19:03:35Z
updated: 2026-03-20T19:03:35Z
---

## Current Test

Awaiting human testing.

## Tests

### 1. Project-Bound Reopen
expected: The terminal stays bound to Project A, the header still shows Project A, and the mismatch pill shows the currently viewed Project B.
result: pending

### 2. Live Terminal Input And Output
expected: Keystrokes reach the PTY immediately, the command runs in the bound project root, and output streams back into the same panel in real time.
result: pending

### 3. Resize And Reopen Fit Stability
expected: The prompt and output remain aligned, no rows are clipped, and xterm refits correctly after resize and reopen.
result: pending

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

None yet.
