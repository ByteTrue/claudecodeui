# Phase 2: Project-Aware Terminal Launch - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the integrated bottom-panel terminal launch in the correct project/workspace root and behave as a reliable live terminal inside the existing workspace UI. This phase covers project-aware launch defaults, project identity clarity in the terminal UI, real-time command input/output in the integrated panel, and prompt/output layout stability during panel resizing. Multi-session tabs, full disconnect/recovery UX, and deeper shell-aware cwd tracking remain outside this phase.

</domain>

<decisions>
## Implementation Decisions

### Project binding strategy
- **D-01:** Opening a new integrated terminal binds it to the project currently selected in the workspace.
- **D-02:** If the user switches the main workspace to a different project while the terminal is already open, the terminal stays bound to its original project instead of silently switching context.
- **D-03:** When the terminal's bound project differs from the project currently being viewed, the panel must explicitly communicate that mismatch rather than hiding it.
- **D-04:** If the user switches back to the project the terminal is bound to, the UI should return to the existing live terminal state rather than starting a fresh shell instance.

### Project identity presentation
- **D-05:** The panel header title stays `Terminal`; project identity is secondary information, not part of the main title.
- **D-06:** The default project identity display uses `displayName + short path`, not just a friendly name and not a noisy full absolute path.
- **D-07:** When the viewed project and bound project differ, the mismatch should be surfaced with a light badge/pill treatment rather than a heavy warning banner.
- **D-08:** Project identity is always visible in the header, with stronger emphasis only when there is a project mismatch.

### Launch and reconnect behavior
- **D-09:** Opening the integrated terminal should auto-connect immediately; the user should not need to press a separate "start terminal" action in the normal case.
- **D-10:** If auto-connect fails, the UI must show a clear error state and an explicit retry action.
- **D-11:** Reopening the terminal panel while the bound shell is still alive should restore that live terminal and focus input automatically.
- **D-12:** Connection progress and success should be visible through lightweight status feedback so the terminal feels explicitly live rather than passively embedded.

### Header information density
- **D-13:** The terminal header should show lightweight connection state such as connecting, live, or disconnected.
- **D-14:** The header only needs to show project-difference context when the viewed project and terminal-bound project diverge.
- **D-15:** The header can show a short project path, but this phase does not require real-time shell cwd tracking beyond launch context.
- **D-16:** The header action area should stay minimal in Phase 2 and keep only the hide/collapse affordance; reconnect/retry actions belong in the connection state UI rather than permanent header controls.

### the agent's Discretion
- Exact status copy, iconography, and color treatment for lightweight connection indicators.
- Exact truncation rules for the short path display, as long as the displayed identity remains unambiguous.
- Exact wording and placement of the project-mismatch badge/pill.
- Exact styling of the retry/error overlay, as long as it remains clear and explicit.

</decisions>

<specifics>
## Specific Ideas

- The intended mental model remains close to VS Code: opening the integrated terminal should feel immediate and ready for command entry.
- The terminal should make project context obvious enough that users do not accidentally run commands in the wrong repository.
- The mismatch between "current viewed project" and "terminal-bound project" should be visible, but not treated like an error.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 2 goal, boundary, success criteria, and plan slots `02-01` / `02-02`
- `.planning/REQUIREMENTS.md` — `INTE-04`, `INTE-05`, `TERM-01`, and `TERM-02`
- `.planning/PROJECT.md` — product intent for a VS Code-like integrated terminal that defaults to the current project/workspace directory

### Prior decisions
- `.planning/STATE.md` — current milestone status and previously recorded terminal-panel decisions carried into Phase 2
- `.planning/phases/01-integrated-terminal-panel/01-CONTEXT.md` — locked Phase 1 decisions about bottom-panel behavior, trigger semantics, and resize persistence

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/shell/view/IntegratedTerminalPanel.tsx`: Existing panel wrapper with header slot, resize handle, and shell embedding path for the integrated terminal.
- `src/components/standalone-shell/view/StandaloneShell.tsx`: Thin wrapper that already wires project/session props into the shared `Shell` runtime.
- `src/components/shell/view/Shell.tsx`: Shared xterm-based terminal view with focus behavior, connection overlay, and empty state handling.
- `src/components/shell/hooks/useShellRuntime.ts`: Central runtime composition for terminal lifecycle, socket connection, and reconnect/restart behavior.
- `src/components/shell/hooks/useShellConnection.ts`: Sends shell `init` payloads that already include `projectPath`, terminal dimensions, and connection state.
- `src/components/shell/hooks/useShellTerminal.ts`: Existing fit/resize pipeline for xterm, including resize observer and shell `resize` messages.

### Established Patterns
- `src/components/main-content/view/MainContent.tsx` already mounts the integrated terminal independently from `activeTab`, so the terminal can persist while the user moves through workspace surfaces.
- The current integrated panel passes the ambient `selectedProject` directly to `StandaloneShell`, which means Phase 2 planning should decide whether terminal binding needs its own explicit state rather than always following the latest workspace selection.
- `useShellTerminal` lifecycle currently keys terminal setup to the selected project, so planner/research work should account for how to preserve a bound terminal while the viewed project changes.
- The shell UI already supports a connection overlay with explicit connect/loading states; Phase 2 can refine and repurpose this instead of inventing a second status system.

### Integration Points
- `src/components/main-content/view/MainContent.tsx`: Main place to introduce an explicit terminal-bound project separate from the currently viewed workspace project if needed.
- `src/components/shell/view/IntegratedTerminalPanel.tsx`: Main place to surface project identity, mismatch indication, and lightweight connection status in the panel header.
- `src/components/shell/view/Shell.tsx` and `src/components/shell/view/subcomponents/ShellConnectionOverlay.tsx`: Main UI surfaces for auto-connect, failure/retry states, and live terminal feedback.
- `server/index.js`: `/shell` websocket handler already validates `projectPath`, spawns PTY processes with that cwd, and caches sessions in `ptySessionsMap` by `projectPath` plus session identity.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-project-aware-terminal-launch*
*Context gathered: 2026-03-21*
