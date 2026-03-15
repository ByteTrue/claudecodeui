# Research: Stack for Integrated Project Terminal

**Date:** 2026-03-16  
**Scope:** Add a VS Code-like integrated project terminal to the existing workspace app without replacing the current shell stack.

## Recommendation

Reuse the existing terminal stack already present in this repository:

- Frontend terminal surface: `@xterm/xterm`
- Frontend sizing and usability addons: `@xterm/addon-fit`, `@xterm/addon-web-links`, `@xterm/addon-clipboard`, `@xterm/addon-webgl`
- Backend PTY process management: `node-pty`
- Transport: existing `/shell` WebSocket channel in `server/index.js`
- UI composition: existing React shell modules in `src/components/shell/` and `src/components/standalone-shell/`

This project does not need a terminal engine swap. The product gap is integration, session management, layout, and mobile usability.

## What The Codebase Already Has

The current app already contains the hard parts of terminal infrastructure:

- `server/index.js` creates PTY sessions with `node-pty`
- `server/index.js` exposes `/shell` over WebSocket
- `src/components/shell/view/Shell.tsx` renders an xterm-based shell surface
- `src/components/shell/hooks/useShellConnection.ts` initializes terminal sessions with `projectPath`, terminal size, and optional `sessionId`
- `src/components/main-content/view/MainContent.tsx` already exposes shell as a full-page tab
- `src/components/standalone-shell/view/StandaloneShell.tsx` wraps shell for reuse in other contexts

This means v1 should extend the current shell feature into a workspace-integrated terminal panel, not start over with a new backend or renderer.

## Recommended v1 Stack Shape

### 1. Terminal Renderer

Keep `@xterm/xterm` as the single terminal renderer.

Why:

- The project already depends on it in `package.json`
- It is the standard browser terminal surface paired with `node-pty`
- The current shell UI is already built on top of it

Confidence: High

### 2. Addon Strategy

Use the existing addons intentionally instead of adding new surface area in v1:

- `@xterm/addon-fit`: keep for resize and panel open/close fitting
- `@xterm/addon-web-links`: keep for URL/file-like output interactions
- `@xterm/addon-clipboard`: keep for copy/paste ergonomics
- `@xterm/addon-webgl`: keep as an optional performance path, but allow fallback if rendering issues appear on some environments

Do not add search, image, or custom parser addons in v1 unless a requirement depends on them.

Confidence: High

### 3. PTY Backend

Keep `node-pty` as the PTY backend.

Why:

- It is already used in `server/index.js`
- It supports resize, cwd, shell process launch, and flow control hooks
- It is the normal pairing for xterm.js-backed web terminals

Important backend considerations:

- preserve per-tab PTY identity explicitly instead of relying on one shell view per page
- keep cwd tied to the selected project/workspace by default
- continue using resize events from the browser terminal
- treat reconnect and timeout behavior as part of product design, not just transport cleanup

Confidence: High

### 4. Transport

Reuse the existing `/shell` WebSocket transport instead of adding REST polling or a new socket channel for v1.

Why:

- current shell already uses live duplex WebSocket I/O
- terminal output is streaming-oriented
- resize, reconnect, auth handoff, and input are already modeled there

Recommended transport refinement:

- add explicit terminal-tab identifiers on top of the existing session model
- keep shell metadata lightweight: tab id, title, cwd, connection state, exit state
- if large-output lag appears, add an ACK-based flow-control layer rather than redesigning transport

Confidence: High

### 5. Session Model

Introduce a product-level terminal tab/session manager on top of the existing shell connection model.

Recommended tab metadata:

- `terminalTabId`
- `projectId` or `projectPath`
- `sessionId` if attached to an existing provider session
- `title`
- `mode` (`plain-shell` vs provider session resume)
- `cwd`
- `status` (`connecting`, `running`, `disconnected`, `exited`)
- `lastActiveAt`

This should live in UI state and map to backend PTY sessions, rather than treating each terminal surface as an isolated mount.

Confidence: Medium-High

## Mobile Implications

Do not introduce a separate mobile terminal engine. Keep xterm.js, but change the product shell around it:

- open terminal in a bottom sheet / bottom panel behavior that can grow taller on focus
- use larger hit targets for tab switching and session actions
- fit the terminal after viewport changes and software keyboard appearance
- minimize always-visible controls while typing
- avoid promising full desktop shortcut parity on mobile

The requirement is core usability, not desktop parity.

Confidence: Medium

## What Not To Use In v1

- Do not replace `@xterm/xterm` with another browser terminal renderer
- Do not replace `node-pty` with a remote execution service just to get tabs
- Do not build a second terminal backend parallel to `/shell`
- Do not add split-pane terminal layout infrastructure before tabbed sessions work well
- Do not add broad shell-integration scripting as a prerequisite for v1 usability

## Optional Later Enhancements

- shell integration sequences for cwd / command boundary detection
- richer tab titles based on current cwd or foreground process
- session persistence across reloads
- file-tree “Open in Terminal Here”
- editor/chat initiated “Run in Terminal”

## Sources

- VS Code terminal basics: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code shell integration: https://code.visualstudio.com/docs/terminal/shell-integration
- xterm.js addons guide: https://xtermjs.org/docs/guides/using-addons/
- xterm.js flow control guide: https://xtermjs.org/docs/guides/flowcontrol/
- node-pty README: https://github.com/microsoft/node-pty

## Source-Backed Notes

- VS Code opens the integrated terminal in the workspace root by default and positions it as part of the editor workflow, which matches the requested mental model.
- xterm.js recommends addon-based extension rather than forking terminal behavior into custom renderers.
- xterm.js documents that WebSocket-backed terminals may need extra flow-control handling when producers are fast.
- node-pty documents resize, cwd, and optional flow-control support, and warns that PTY processes run with the server process' permission level.

## Confidence Summary

- Reuse current xterm.js + node-pty + WebSocket stack: High
- Build tabs/state on top of current shell feature instead of replacing it: High
- Mobile should use the same terminal engine with a different surrounding UX: Medium
- Rich shell integration should be deferred behind baseline usability: Medium-High
