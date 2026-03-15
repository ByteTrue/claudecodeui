# Research Summary: Integrated Terminal

**Date:** 2026-03-16
**Scope:** VS Code-like integrated project terminal for Claude Code UI

## Key Findings

### Stack

The repo already has the right core stack for this feature:

- `@xterm/xterm` plus first-party addons for rendering and fitting
- `node-pty` for shell processes
- an existing `/shell` WebSocket transport

The recommendation is to **reuse the current shell stack** and invest in workspace integration, tab/session orchestration, and mobile presentation.

### Table Stakes

The minimum bar for v1 is:

- integrated bottom-panel terminal on desktop
- terminal starts in the current project/workspace directory
- multiple terminal tabs with fast switching
- stable input/output/reconnect behavior
- mobile support for opening the terminal, running commands, reading output, and switching tabs

### Architecture

The missing architecture is not a new backend; it is a new orchestration layer:

- terminal panel/sheet host in the workspace UI
- client-side terminal tab/session state
- explicit terminal tab/session identity in the `/shell` init protocol
- reuse of the existing `Shell` runtime as the per-tab terminal surface

### Watch Out For

The main risks are:

- PTY collisions between multiple tabs in the same project
- hidden xterm instances sizing incorrectly when shown
- mobile keyboards and small-screen layouts breaking usability
- losing running commands during normal UI navigation
- overbuilding split panes and advanced power-user features before the core flow is solid

## Recommended Scope Shape

### Build First

- terminal session identity model
- integrated desktop panel
- tabbed multi-session lifecycle
- stable resize/reconnect behavior
- mobile sheet/fullscreen adaptation

### Defer

- split terminal panes
- advanced profile management
- deep chat/agent automation into terminal
- durable cross-reload session persistence

## Practical Conclusion

This feature is a brownfield product-integration milestone. The codebase already knows how to render a terminal and run a PTY. The work that matters is making that capability feel native to the workspace, safe to use repeatedly, and usable on mobile.

## Research Files

- `STACK.md`
- `FEATURES.md`
- `ARCHITECTURE.md`
- `PITFALLS.md`

---
*Summary status: ready to define v1 requirements*
