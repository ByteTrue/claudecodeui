# Research Summary: Integrated Project Terminal

**Date:** 2026-03-16

## Recommendation

Do not replace the existing terminal stack. The repo already has the right foundation: `@xterm/xterm`, `node-pty`, WebSocket transport on `/shell`, and reusable shell UI modules. The milestone should focus on turning that foundation into a VS Code-like workspace terminal experience.

## Stack

Reuse:

- `@xterm/xterm` and current addons
- `node-pty`
- existing `/shell` WebSocket transport
- existing shell React components and hooks

Avoid:

- terminal engine swaps
- second terminal backends
- split-pane infrastructure in v1

## Table Stakes

The research points to these as the real v1 requirements:

- bottom-panel terminal integrated into the workspace
- default cwd at the current project/workspace root
- multiple terminal tabs with simple switching and close/restart actions
- stable output, resize, copy/paste, and reconnect behavior
- mobile core usability

## Watch Out For

- PTY/WebSocket security: browser terminals are powerful surfaces, not harmless widgets
- large-output flow control: noisy commands can degrade terminal responsiveness
- session lifecycle: a bottom panel changes visibility/focus behavior compared with a dedicated shell page
- mobile layout: soft keyboard and limited vertical space will break desktop-first assumptions

## Architectural Direction

Add a workspace-level terminal panel host and a tab/session manager above the current shell feature. Reuse the existing shell instance implementation per tab and refine backend session semantics only where needed for stable tab identity and reconnect behavior.

## Recommended Scope Boundary

Include now:

- integrated panel
- project-root default context
- tabs
- mobile core usability

Defer:

- split panes
- deep shell integration
- reload persistence
- deep editor/chat/file-tree launch actions

## Source Highlights

- VS Code positions the integrated terminal as a workspace-root, in-editor command surface.
- VS Code shell integration shows that cwd and command awareness are valuable, but not required to establish basic terminal usability.
- xterm.js recommends addon-based extension and documents WebSocket flow-control concerns.
- node-pty documents resize/cwd/flow-control support and warns that PTY processes inherit server permissions.
