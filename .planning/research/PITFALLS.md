# Research: Pitfalls for Integrated Terminal

**Date:** 2026-03-16
**Context:** Adding a VS Code-like integrated terminal to an existing browser-based coding workspace

## 1. PTY Session Collisions Across Tabs

**Pitfall**
- Multiple terminal tabs in the same project accidentally reconnect to the same PTY

**Why this is likely here**
- Current plain-shell keying in `server/index.js` falls back to a project/default session model

**Warning signs**
- Creating a second terminal tab shows the same output as the first
- Closing one tab unexpectedly affects another tab
- Commands appear in the wrong tab after switching

**Prevention**
- Add explicit client-generated terminal tab/session IDs to the `/shell` init payload
- Key PTY sessions by that explicit identity rather than an implicit default

**Phase**
- Phase 1

## 2. Hidden xterm Instances Fail to Resize Correctly

**Pitfall**
- Terminals mounted in hidden panels or inactive tabs get zero-width measurements and render badly

**Why this is likely here**
- xterm requires `fit()` and resize coordination when the container becomes visible
- the repo currently fits on initialization and resize, but integrated panels introduce more visibility transitions

**Warning signs**
- Terminal opens with wrapped or clipped text
- Cursor renders off-grid after panel open
- Switching tabs produces incorrect dimensions until a manual resize

**Prevention**
- Only fit after the container is visible and stable
- Trigger fit+resize on panel open, tab activation, orientation change, and mobile keyboard layout changes

**Phase**
- Phase 1

## 3. Treating Mobile as a Shrunken Desktop Panel

**Pitfall**
- Reusing the desktop bottom panel literally on phones

**Why this is likely here**
- The user explicitly requires mobile usability, but the current shell UX is primarily desktop-oriented

**Warning signs**
- Soft keyboard covers input
- Tab strip becomes untappable
- Output area becomes too short to be useful

**Prevention**
- Use a mobile sheet/fullscreen terminal presentation
- Keep the session model shared with desktop, but adapt the container and controls for touch

**Phase**
- Phase 1

## 4. Losing Running Commands on UI Navigation

**Pitfall**
- Switching tabs, changing project context, or collapsing the terminal interrupts a running command

**Why this is likely here**
- `useShellRuntime` currently disconnects/disposes under several state transitions
- the current shell UX is not designed around persistent multi-tab workspace terminals

**Warning signs**
- Running command stops when the user navigates elsewhere in the UI
- Terminal reconnect banner appears too often during normal navigation
- Output history is unexpectedly missing

**Prevention**
- Separate UI visibility from PTY session identity
- Preserve server-side PTY sessions independently from React mount lifecycle
- Decide explicitly which events should close a terminal vs merely hide it

**Phase**
- Phase 1

## 5. Overbuilding v1 With Split Panes and Power-User Controls

**Pitfall**
- Spending the milestone on advanced terminal management before fixing the core workflow

**Why this is likely here**
- VS Code parity can invite feature copying beyond the actual user need

**Warning signs**
- Split views, shell profiles, and advanced command history appear before the panel and multi-tab flow feel solid
- Mobile usability slips because desktop-only enhancements consume the schedule

**Prevention**
- Keep v1 scoped to integrated panel/sheet, project cwd, multi-tab sessions, and stable input/output
- Defer split panes and profile management

**Phase**
- Phase 1

## 6. Security Assumptions Around Browser-Terminal Embedding

**Pitfall**
- Treating browser-embedded terminal access as low risk because it is “just UI”

**Why this matters**
- `node-pty` launches child processes with the same permission level as the parent process
- xterm's security guidance warns that any JavaScript on the page can potentially observe terminal keystrokes and shell output

**Warning signs**
- Overly broad shell access exposed in contexts that should be limited
- Sensitive command output rendered into untrusted UI/plugin surfaces
- Terminal feature exposed without revisiting auth and permission boundaries

**Prevention**
- Review which authenticated users can open terminals
- Keep shell access inside trusted app surfaces
- Re-check path validation and any plugin embedding around terminal views

**Phase**
- Phase 1 and verification

## 7. Depending Only on Keyboard Shortcuts

**Pitfall**
- Implementing a terminal UX that works only if the user knows desktop shortcuts

**Why this is likely here**
- VS Code-inspired terminal features often assume keyboard-heavy use

**Warning signs**
- Creating or switching tabs is awkward without a hardware keyboard
- Important actions are hidden behind hover states or context menus only

**Prevention**
- Provide explicit buttons for new tab, close tab, switch tab, and expand/collapse
- Treat keyboard shortcuts as enhancement, not access path

**Phase**
- Phase 1

## 8. Mixing Existing Shell Modes Without Clarifying Their Roles

**Pitfall**
- Confusing integrated terminal tabs with the current standalone/minimal shell flows

**Why this is likely here**
- The repo already has:
  - `Shell`
  - `StandaloneShell`
  - “plain shell” vs provider-backed shell behavior

**Warning signs**
- New UI reuses props in ways that blur project terminal tabs and one-off command execution
- Fixes for integrated tabs break minimal shell flows

**Prevention**
- Keep one low-level shell surface
- Add a dedicated integrated-terminal orchestration layer above it
- Preserve standalone/minimal shells as separate call sites

**Phase**
- Phase 1 and Phase 2

## Source Notes

The security risk statement is grounded in:

- node-pty README security section: https://github.com/microsoft/node-pty
- xterm.js security guide: https://xtermjs.org/docs/guides/security/

The layout and terminal-expectation guidance is grounded in:

- VS Code terminal docs: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code panel UX guidelines: https://code.visualstudio.com/api/ux-guidelines/panel

---
*Pitfall recommendation status: the highest-risk failures are session identity collisions, bad resize/visibility handling, and underdesigned mobile UX*
