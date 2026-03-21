---
phase: 02-project-aware-terminal-launch
verified: 2026-03-21T05:06:02Z
status: passed
score: 5/5 must-haves verified
human_verification:
  - test: "Launch the integrated terminal from Project A, switch the workspace view to Project B, then close and reopen the panel"
    expected: "The terminal stays bound to Project A, the header still shows Project A, and the mismatch pill shows the currently viewed Project B."
    why_human: "Code inspection verifies the binding and header logic, but browser interaction is required to confirm the end-to-end UX."
  - test: "Type commands such as `pwd` and `echo terminal-ok` in the integrated terminal"
    expected: "Keystrokes reach the PTY immediately, the command runs in the bound project root, and output streams back into the same panel in real time."
    why_human: "The WebSocket and PTY path is wired in code, but real-time terminal behavior requires a running browser and backend."
  - test: "Resize the terminal panel repeatedly while output is visible, then close and reopen it"
    expected: "The prompt and output remain aligned, no rows are clipped, and xterm refits correctly after resize and reopen."
    why_human: "The flex layout and ResizeObserver pipeline are present, but visual fit correctness depends on runtime DOM sizing."
---

# Phase 2: Project-Aware Terminal Launch Verification Report

**Phase Goal:** Integrated terminals launch in the correct project context and behave reliably as live terminals.
**Verified:** 2026-03-21T05:06:02Z
**Status:** passed
**Re-verification:** Yes - browser-assisted runtime UAT on 2026-03-21

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Opening the integrated terminal snapshots a bound project/session context instead of following later workspace selection changes. | ✓ VERIFIED | `TerminalPanelState` carries `binding`, `openTerminalPanel` only snapshots when `previous.binding` is null, and normal project/session handlers only mutate ambient selection rather than terminal binding. |
| 2 | Closing and reopening the panel reuses the same bound terminal identity while the PTY session is still alive. | ✓ VERIFIED | The panel keeps `binding` on close, mounts `StandaloneShell` with `boundProject` and `boundSession`, and the shell server reconnects to an existing PTY session by `projectPath` plus `sessionId`. |
| 3 | The integrated UI clearly shows which project/workspace the terminal belongs to and highlights a viewed-project mismatch. | ✓ VERIFIED | The integrated header renders the terminal title, bound project display name, shortened bound path, live/disconnected status chip, and a `Viewing {{projectName}}` mismatch pill when the viewed project differs. |
| 4 | The integrated terminal remains wired as a live terminal that can send input and render streamed output. | ✓ VERIFIED | `xterm` input is forwarded over the shell WebSocket, the client sends `init/input/resize`, the server writes to the PTY and streams output back, and `Shell` writes output into the mounted terminal instance. |
| 5 | Terminal layout is still driven by the xterm fit pipeline after the richer header and manual panel resizing. | ✓ VERIFIED | The panel body now uses `flex-1` and `min-h-0`, `StandaloneShell` and `Shell` preserve the flex chain, and `useShellTerminal` keeps `FitAddon.fit()` plus `ResizeObserver`-driven resize messages as the only sizing path. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/types/app.ts` | Bound terminal launch context model and panel state storage | ✓ VERIFIED | Defines `TerminalBindingContext` and `TerminalPanelState.binding`, which is the root artifact for stable terminal ownership. |
| `src/hooks/useProjectsState.ts` | Capture and preserve terminal binding independently from ambient workspace navigation | ✓ VERIFIED | Initializes `binding: null`, snapshots selected project/session/provider on first open, preserves binding on close, and leaves binding untouched in project/session navigation and sidebar refresh paths. |
| `src/components/app/AppContent.tsx` and `src/components/main-content/types/types.ts` | Thread project inventory into main content so bound and current context can be resolved separately | ✓ VERIFIED | `AppContent` passes `projects={projects}` and `MainContentProps` explicitly requires `projects: Project[]`. |
| `src/components/main-content/view/MainContent.tsx` | Resolve `boundProject` and `boundSession` from the binding snapshot and pass them separately from the current workspace view | ✓ VERIFIED | Derives `boundProject` from `terminalPanelState.binding`, falls back to a minimal project model, derives `boundSession`, and passes `currentProject`, `terminalBinding`, `boundProject`, and `boundSession` to the integrated panel. |
| `src/components/shell/view/IntegratedTerminalPanel.tsx` | Render bound project identity, mismatch status, and mount the shell from bound props with flex-based body sizing | ✓ VERIFIED | Shows the bound project name/path and status chip, renders mismatch UI from `currentProject` vs `terminalBinding.projectName`, mounts `StandaloneShell` with `project={boundProject}` and `session={boundSession}`, and uses `flex min-h-0 flex-1` for the shell body. |
| `src/components/standalone-shell/view/StandaloneShell.tsx` and `src/components/shell/view/Shell.tsx` | Propagate shell status to the panel while preserving a live terminal host | ✓ VERIFIED | `StandaloneShell` forwards `onStatusChange`; `Shell` derives `ShellStatusSnapshot`, emits it, hosts the xterm container, overlays connection state, and forwards interactive prompt input. |
| `src/components/shell/hooks/useShellConnection.ts`, `src/components/shell/hooks/useShellTerminal.ts`, and `server/index.js` | Keep the integrated terminal wired to the shell transport, PTY session reuse, and resize pipeline | ✓ VERIFIED | The client sends `init/input/resize`, `useShellTerminal` drives `fit()` and `ResizeObserver`, and the server reuses PTY sessions via `ptySessionsMap` keyed by bound `projectPath` and `sessionId`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `useProjectsState.ts` | `TerminalPanelState.binding` | `openTerminalPanel` and `closeTerminalPanel` | WIRED | Opening snapshots the selected project/session/provider once, and closing keeps the binding intact for reopen. |
| `AppContent.tsx` | `MainContent.tsx` | `projects={projects}` prop threading | WIRED | Main content receives both the current workspace selection and the full project list needed to resolve the terminal-bound project independently. |
| `MainContent.tsx` | `IntegratedTerminalPanel.tsx` | `currentProject`, `terminalBinding`, `boundProject`, `boundSession` props | WIRED | The integrated panel no longer depends on ambient `selectedProject` and `selectedSession` alone. |
| `IntegratedTerminalPanel.tsx` | `StandaloneShell.tsx` and `Shell.tsx` | `project={boundProject}`, `session={boundSession}`, `onStatusChange={setShellStatus}` | WIRED | The shell mounts from the bound context and reports compact runtime state back into the panel header. |
| `Shell.tsx` and `useShellConnection.ts` | `server/index.js` shell WebSocket | `init`, `input`, and `resize` messages | WIRED | The client sends the bound project path and session id on init, forwards user input, and forwards terminal dimensions for fit updates. |
| `server/index.js` | existing PTY session reuse | `ptySessionsMap` keyed by `projectPath_sessionId` | WIRED | Reopen/reconnect reattaches to the cached PTY session, replays buffered output, and keeps the session alive for 30 minutes after WebSocket disconnect. |
| `IntegratedTerminalPanel.tsx`, `StandaloneShell.tsx`, `Shell.tsx`, and `useShellTerminal.ts` | xterm fit pipeline | `flex-1` and `min-h-0` layout plus `ResizeObserver` and `fit()` | WIRED | The previous fixed-height wrapper is gone; the shell body is the only flexing region and resize events still call `fit()` and send terminal dimensions upstream. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `INTE-04` | `02-01-PLAN.md` | New terminal tabs start in the current project/workspace root by default | ✓ SATISFIED | The first open snapshots `selectedProject.fullPath || selectedProject.path`, `MainContent` preserves that bound project, and the shell init message uses the bound project path rather than later ambient workspace changes. |
| `INTE-05` | `02-02-PLAN.md` | User can clearly tell which project/workspace a terminal tab belongs to | ✓ SATISFIED | The integrated header shows the bound project display name, shortened path, status chip, and mismatch pill; the runtime gap on header copy was closed by using `chat` namespace keys plus a dedicated `shell.header.title` translation. |
| `TERM-01` | `02-01-PLAN.md` | User can type commands into the integrated terminal and receive real-time output | ✓ SATISFIED | `useShellTerminal` forwards terminal input, `useShellConnection` writes streamed output into xterm, and browser-assisted runtime UAT confirmed live `/shell` input plus streamed output in the same panel. |
| `TERM-02` | `02-02-PLAN.md` | Terminal output and prompt layout remain correct when the panel size changes | ✓ SATISFIED | The shell body now uses flex/min-height layout, `useShellTerminal` keeps `ResizeObserver` plus `fit()` plus `resize` message propagation in place, and runtime UAT confirmed stable rows after resize and reopen. |

Phase 2 plan frontmatter declares `INTE-04`, `TERM-01`, `INTE-05`, and `TERM-02`, and `REQUIREMENTS.md` maps exactly those four IDs to Phase 2. No orphaned Phase 2 requirement IDs were found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None | - | No blocker stubs, TODO/FIXME markers, or placeholder implementations were found in the phase-touched files after reviewing the terminal-binding and shell-path changes. | Info | No automated code-level gaps were identified from the anti-pattern pass. |

### Runtime Gap Closure

Browser-assisted UAT on 2026-03-21 surfaced one real runtime gap before final pass: the integrated header rendered `shell.header.live` and `shell.header.viewingProject` as raw keys, and the title showed `Shell` instead of the fixed `Terminal` required by `02-CONTEXT.md`. That gap was closed by binding `IntegratedTerminalPanel` to the `chat` namespace for shell header copy and by adding a dedicated `shell.header.title` translation across the shipped locales. The same browser session was then rerun end to end.

### Runtime UAT Completed

### 1. Project-Bound Reopen

**Result:** Passed
**Evidence:** Opened the integrated terminal from `@siteboon/claude-code-ui`, switched the workspace view to `nanoclaw`, then hid and reopened the panel. The header stayed `Terminal / Live / @siteboon/claude-code-ui / .../playground/claudecodeui / Viewing nanoclaw`, the reopen `init` payload kept `projectPath=/Users/21jie/workspace/playground/claudecodeui`, and the runtime stream included `[Reconnected to existing session]`.

### 2. Live Terminal Input And Output

**Result:** Passed
**Evidence:** The integrated terminal is provider-backed (`provider="claude"`, `isPlainShell=false`), so `pwd` is interpreted by Claude Code rather than a raw Bash prompt. Runtime UAT still confirmed live PTY behavior: browser keyboard input sent `p`, `w`, `d`, and `\r` over `/shell`; the same panel immediately echoed `pwd`; streamed output continued live; and bound-root evidence came from the `init.projectPath=/Users/21jie/workspace/playground/claudecodeui` payload plus terminal output reporting `当前目录还是 /Users/21jie/workspace/playground/claudecodeui`.

### 3. Resize And Reopen Fit Stability

**Result:** Passed
**Evidence:** Resizing the panel upward changed the live shell from `rows=8` to `rows=18` at `panelHeight=377`; resizing back down changed it to `rows=12` at `panelHeight=274`; after hide/reopen the panel restored at `panelHeight=274`, the reopen `init` payload reused `rows=12`, and the final runtime screenshot showed aligned prompt/output with no visible clipping.

### Gaps Summary

No remaining code or runtime gaps were found after browser-assisted UAT. The declared must-haves from `02-01-PLAN.md` and `02-02-PLAN.md` are present, all four Phase 2 requirement IDs are accounted for without orphaned entries, and the previously pending live UAT checks now pass end to end.

#### Evidence References

- `/Users/21jie/workspace/personal/claudecodeui/.planning/ROADMAP.md:32`
- `/Users/21jie/workspace/personal/claudecodeui/.planning/ROADMAP.md:37`
- `/Users/21jie/workspace/personal/claudecodeui/.planning/REQUIREMENTS.md:13`
- `/Users/21jie/workspace/personal/claudecodeui/.planning/REQUIREMENTS.md:74`
- `/Users/21jie/workspace/personal/claudecodeui/.planning/phases/02-project-aware-terminal-launch/02-01-PLAN.md:15`
- `/Users/21jie/workspace/personal/claudecodeui/.planning/phases/02-project-aware-terminal-launch/02-02-PLAN.md:20`
- `/Users/21jie/workspace/personal/claudecodeui/src/types/app.ts:5`
- `/Users/21jie/workspace/personal/claudecodeui/src/hooks/useProjectsState.ts:185`
- `/Users/21jie/workspace/personal/claudecodeui/src/hooks/useProjectsState.ts:249`
- `/Users/21jie/workspace/personal/claudecodeui/src/hooks/useProjectsState.ts:465`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/app/AppContent.tsx:167`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/main-content/types/types.ts:35`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/main-content/view/MainContent.tsx:73`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/main-content/view/MainContent.tsx:229`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/view/IntegratedTerminalPanel.tsx:57`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/view/IntegratedTerminalPanel.tsx:166`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/view/IntegratedTerminalPanel.tsx:208`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/standalone-shell/view/StandaloneShell.tsx:68`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/view/Shell.tsx:180`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/view/Shell.tsx:204`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/view/Shell.tsx:280`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/hooks/useShellConnection.ts:129`
- `/Users/21jie/workspace/personal/claudecodeui/src/components/shell/hooks/useShellTerminal.ts:199`
- `/Users/21jie/workspace/personal/claudecodeui/server/index.js:1640`
- `/Users/21jie/workspace/personal/claudecodeui/server/index.js:1812`
- `/Users/21jie/workspace/personal/claudecodeui/server/index.js:1940`
- `/Users/21jie/workspace/personal/claudecodeui/src/i18n/locales/en/chat.json:234`

---

_Verified: 2026-03-21T05:06:02Z_
_Verifier: Claude (gsd-verifier)_
